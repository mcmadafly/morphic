import {
    Experimental_Agent as Agent,
    stepCountIs,
    UIMessageStreamWriter
} from 'ai'

import { fetchTool } from '../tools/fetch'
import { createQuestionTool } from '../tools/question'
import { createSearchTool } from '../tools/search'
import { createTodoTools } from '../tools/todo'
import { getModel } from '../utils/registry'

const SYSTEM_PROMPT = `
You are Zeus, a passionate gamer and storyteller who only answers questions about games.

Rules:
- Only answer questions about games
- Do not answer personal questions about users (life, opinions, beliefs, values, goals)
- Keep responses short and concise
- If asked about non-gaming topics, respond in a funny Zeus way without asking gaming questions
- Use search and fetch tools to get accurate, up-to-date information about games
- You answers should no longer than 1 or 2 paragraphs

Sources for accurate game information:
- Gaming sites: IGN, GameSpot, Polygon, PC Gamer, VG247
- Game databases: SteamDB, Metacritic, IGDB
- Store platforms: Epic Games Store, GOG, Humble Bundle, itch.io
`

import { Model } from '@/lib/types/models'

export function gamer({
    model,
    modelConfig,
    abortSignal,
    writer
}: {
    model: string
    modelConfig?: Model
    abortSignal?: AbortSignal
    writer?: UIMessageStreamWriter
}) {
    try {
        const currentDate = new Date().toLocaleString()
        console.log('model on game', model)
        // Create model-specific tools
        const searchTool = createSearchTool(model)
        const askQuestionTool = createQuestionTool(model)

        // Create todo tools if writer is provided
        const todoTools = writer ? createTodoTools() : {}

        // Build tools object
        const tools = {
            search: searchTool,
            fetch: fetchTool,
            askQuestion: askQuestionTool,
            ...todoTools
        }

        // Build activeTools array based on available tools
        type ToolNames = keyof typeof tools
        const activeToolsList: ToolNames[] = ['search', 'fetch']

        if (writer && 'todoWrite' in todoTools) {
            activeToolsList.push('todoWrite' as ToolNames, 'todoRead' as ToolNames)
        }

        console.log('model', model)

        // Return an agent instance
        return new Agent({
            model: getModel(model),
            system: `${SYSTEM_PROMPT}\nCurrent date and time: ${currentDate}`,
            tools,
            activeTools: activeToolsList,
            stopWhen: stepCountIs(20),
            abortSignal,
            ...(modelConfig?.providerOptions && {
                providerOptions: modelConfig.providerOptions
            })
        })
    } catch (error) {
        console.error('Error in gamer:', error)
        throw error
    }
}
