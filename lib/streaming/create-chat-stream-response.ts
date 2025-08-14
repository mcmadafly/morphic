import {
    consumeStream,
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    UIMessage,
    UIMessageStreamWriter
} from 'ai'
import { randomUUID } from 'crypto'
import { Langfuse } from 'langfuse'

import { gamer } from '@/lib/agents/gamer'
import { isTracingEnabled } from '@/lib/utils/telemetry'

import { loadChat } from '../actions/chat'
import { generateChatTitle } from '../agents/title-generator'
import {
    getMaxAllowedTokens,
    shouldTruncateMessages,
    truncateMessages
} from '../utils/context-window'
import { getTextFromParts } from '../utils/message-utils'
import { perfLog, perfTime } from '../utils/perf-logging'

import { generateId } from '@/lib/db/schema'
import { filterReasoningParts } from './helpers/filter-reasoning-parts'
import { handleStreamFinish } from './helpers/handle-stream-finish'
import { prepareMessages } from './helpers/prepare-messages'
import type { StreamContext } from './helpers/types'
import { BaseStreamConfig } from './types'

// Constants
const DEFAULT_CHAT_TITLE = 'Untitled'

const AGENT_NAME = 'zeus-gamer-agent'
const AGENT_SIGNATURE = '⚡️ Zeus, from the Enthusiast Gaming Guide - https://www.zeus.gg ⚡️'


export async function createChatStreamResponse(
    config: BaseStreamConfig
): Promise<Response> {
    const {
        message,
        model,
        chatId,
        userId,
        trigger,
        messageId,
        abortSignal,
        isNewChat
    } = config
    const modelId = `${model.providerId}:${model.id}`

    // Verify that chatId is provided
    if (!chatId) {
        return new Response('Chat ID is required', {
            status: 400,
            statusText: 'Bad Request'
        })
    }

    // Skip loading chat for new chats optimization
    let initialChat = null
    if (!isNewChat) {
        const loadChatStart = performance.now()
        // Fetch chat data for authorization check and cache it
        initialChat = await loadChat(chatId, userId)
        perfTime('loadChat completed', loadChatStart)

        // Authorization check: if chat exists, it must belong to the user
        if (initialChat && initialChat.userId !== userId) {
            return new Response('You are not allowed to access this chat', {
                status: 403,
                statusText: 'Forbidden'
            })
        }
    } else {
        perfLog('loadChat skipped for new chat')
    }

    // Create parent trace ID for grouping all operations
    let parentTraceId: string | undefined
    let langfuse: Langfuse | undefined

    if (isTracingEnabled()) {
        parentTraceId = randomUUID()
        langfuse = new Langfuse()

        // Create parent trace with name "research"
        langfuse.trace({
            id: parentTraceId,
            name: AGENT_NAME,
            metadata: {
                chatId,
                userId,
                modelId: `${model.providerId}:${model.id}`,
                trigger
            }
        })
    }

    // Create stream context with trace ID
    const context: StreamContext = {
        chatId,
        userId,
        modelId: `${model.providerId}:${model.id}`,
        messageId,
        trigger,
        initialChat,
        abortSignal,
        parentTraceId, // Add parent trace ID to context
        isNewChat
    }

    // Create the stream
    const stream = createUIMessageStream<UIMessage>({
        execute: async ({ writer }: { writer: UIMessageStreamWriter }) => {
            try {
                // Prepare messages for the model
                const messagesToModel = await prepareMessages(context, message)

                // Get the researcher agent with parent trace ID
                const researchAgent = gamer({
                    model: context.modelId,
                    modelConfig: model,
                    abortSignal,
                    writer
                })

                // Write metadata including traceId at the start of streaming
                if (parentTraceId) {
                    writer.write({
                        type: 'message-metadata',
                        messageMetadata: { traceId: parentTraceId }
                    })
                }

                // Filter out reasoning parts from messages before converting to model messages
                // OpenAI API requires reasoning messages to be followed by assistant messages
                const filteredMessages = filterReasoningParts(messagesToModel)

                // Convert to model messages and apply context window management
                let modelMessages = convertToModelMessages(filteredMessages)

                if (shouldTruncateMessages(modelMessages, model)) {
                    const maxTokens = getMaxAllowedTokens(model)
                    const originalCount = modelMessages.length
                    modelMessages = truncateMessages(modelMessages, maxTokens, model.id)

                    if (process.env.NODE_ENV === 'development') {
                        console.log(
                            `Context window limit reached. Truncating from ${originalCount} to ${modelMessages.length} messages`
                        )
                    }
                }

                // Start title generation in parallel if it's a new chat
                let titlePromise: Promise<string> | undefined
                if (!initialChat && message) {
                    const userContent = getTextFromParts(message.parts)
                    titlePromise = generateChatTitle({
                        userMessageContent: userContent,
                        modelId: context.modelId,
                        abortSignal,
                        parentTraceId
                    }).catch(error => {
                        console.error('Error generating title:', error)
                        return DEFAULT_CHAT_TITLE
                    })
                }

                // Stream with the research agent
                writer.merge(
                    researchAgent.stream({ messages: modelMessages }).toUIMessageStream({
                        onFinish: async ({ responseMessage, isAborted }) => {
                            if (isAborted || !responseMessage) return
                            // Development logging for the final response message
                            // if (process.env.NODE_ENV === 'development') {
                            //     try {
                            //         const textSnippet = getTextFromParts(responseMessage.parts ?? [])
                            //             .slice(0, 200)
                            //         console.log('[stream:onFinish] responseMessage summary', {
                            //             id: (responseMessage as unknown as { id?: string })?.id,
                            //             metadata: responseMessage.metadata,
                            //             partsCount: Array.isArray(responseMessage.parts) ? responseMessage.parts.length : 0,
                            //             textSnippet
                            //         })
                            //     } catch (logError) {
                            //         console.log('[stream:onFinish] responseMessage (could not serialize)', logError)
                            //     }
                            // }
                            // Append Zeus signature to the final message (persisted)
                            const signatureText = `\n\n${AGENT_SIGNATURE}`
                            responseMessage.parts = [
                                ...(responseMessage.parts ?? []),
                                { type: 'text', text: signatureText }
                            ]
                            // Stream the signature so the UI shows it immediately
                            const signatureChunkId = generateId()
                            writer.write({ type: 'text-start', id: signatureChunkId })
                            writer.write({ type: 'text-delta', id: signatureChunkId, delta: signatureText })
                            writer.write({ type: 'text-end', id: signatureChunkId })
                            await handleStreamFinish(
                                writer,
                                responseMessage,
                                messagesToModel,
                                context,
                                titlePromise
                            )
                        }
                    })
                )

            } catch (error) {
                console.error('Stream execution error:', error)
                throw error // This error will be handled by the onError callback
            } finally {
                // Flush Langfuse traces if enabled
                if (langfuse) {
                    await langfuse.flushAsync()
                }
            }
        },
        onError: (error: any) => {
            // console.error('Stream error:', error)
            return error instanceof Error ? error.message : String(error)
        },
        // Ensure messages/chunks have stable IDs
        generateId
    })

    return createUIMessageStreamResponse({
        stream,
        consumeSseStream: consumeStream
    })
}
