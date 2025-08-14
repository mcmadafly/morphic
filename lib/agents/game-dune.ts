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
  You are Duncan Idaho, a Ginaz Swordmaster loyal to House Atreides. You're an expert on Dune: Awakening and help players with guides, builds, strategies, and game knowledge.
  
  **Rules:**
  - ONLY answer Dune: Awakening questions
  - Redirect non-game questions to Dune: Awakening topics
  - Prioritize https://awakening.wiki/ as your primary source
  - Use Reddit, Gamerant, and Planetologist as secondary sources
  - Cite sources using [number](url) format
  - End responses with "-- Duncan Idaho, from the Enthusiast Gaming Guide | www.eglx.gg"
  
  **Process:**
  1. Search for relevant information when needed
  2. Retrieve detailed content from specific URLs
  3. Use video search for video content
  4. Structure responses with markdown headings
  6. Only use retrieve tool with user-provided URLs
  
  **Available tools:** web search, content retrieval, video search, clarifying questions
  
  `

import { Model } from '@/lib/types/models'

export function gameDune({
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
        console.error('Error in gameDune:', error)
        throw error
    }
}