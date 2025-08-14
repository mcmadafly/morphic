'use client'

import { useEffect, useRef, useState } from 'react'

import {
    Gamepad2,
    LucideIcon,
    Newspaper,
    Search
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'
import { Button } from './ui/button'

// Constants for timing delays
const FOCUS_OUT_DELAY_MS = 100 // Delay to ensure focus has actually moved

interface ActionCategory {
    icon: LucideIcon
    label: string
    key: string
}

const actionCategories: ActionCategory[] = [
    {
        icon: Gamepad2,
        label: 'Games Updates',
        key: 'games'
    },
    {
        icon: Search,
        label: 'Trending',
        key: 'trending'
    },
    {
        icon: Newspaper,
        label: 'Rumors & News',
        key: 'rumors'
    }
]

const promptSamples: Record<string, string[]> = {
    games: [
        'What\'s the latest news on Dune: Awakening?',
        'What\'s the latest news on Diablo 4?',
        'What\'s the latest news on World of Warcraft: The War Within?',
        'What\'s the latest news on League of Legends?',
    ],
    trending: [
        'What\'s trending on Steam?',
        'What\'s trending on Epic Games?',
        'What\'s trending for consoles?',
        'What\'s trending on Addicting Games?',
    ],
    rumors: [
        'What\'s the latest gaming rumors?',
        'What are some unannounced games?',
    ]
}

interface ActionButtonsProps {
    onSelectPrompt: (prompt: string) => void
    onCategoryClick: (category: string) => void
    inputRef?: React.RefObject<HTMLTextAreaElement>
    className?: string
}

export function ActionButtons({
    onSelectPrompt,
    onCategoryClick,
    inputRef,
    className
}: ActionButtonsProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleCategoryClick = (category: ActionCategory) => {
        setActiveCategory(category.key)
        onCategoryClick(category.label)
    }

    const handlePromptClick = (prompt: string) => {
        setActiveCategory(null)
        onSelectPrompt(prompt)
    }

    const resetToButtons = () => {
        setActiveCategory(null)
    }

    // Handle Escape key and clicks outside (including focus loss)
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && activeCategory) {
                resetToButtons()
            }
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                if (activeCategory) {
                    // Check if click is not on the input field
                    if (!inputRef?.current?.contains(e.target as Node)) {
                        resetToButtons()
                    }
                }
            }
        }

        const handleFocusOut = () => {
            // Check if focus is moving outside both the container and input
            setTimeout(() => {
                const activeElement = document.activeElement
                if (
                    activeCategory &&
                    !containerRef.current?.contains(activeElement) &&
                    activeElement !== inputRef?.current
                ) {
                    resetToButtons()
                }
            }, FOCUS_OUT_DELAY_MS)
        }

        document.addEventListener('keydown', handleEscape)
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('focusout', handleFocusOut)

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('focusout', handleFocusOut)
        }
    }, [activeCategory, inputRef])

    return (
        <div
            ref={containerRef}
            className={cn('relative transition-all duration-300 ease-in-out', className)}
        >
            {/* Action buttons - always visible */}
            <div className="flex items-start justify-center pt-2 pb-2">
                <div className="flex flex-wrap justify-center gap-2 px-2">
                    {actionCategories.map(category => {
                        const Icon = category.icon
                        return (
                            <Button
                                key={category.key}
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap rounded-lg transition-all duration-300',
                                    'text-xs sm:text-sm px-3 sm:px-4',
                                    activeCategory === category.key
                                        ? 'bg-primary text-primary-foreground opacity-100'
                                        : 'opacity-50 hover:opacity-100'
                                )}
                                onClick={() => handleCategoryClick(category)}
                            >
                                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{category.label}</span>
                            </Button>
                        )
                    })}
                </div>
            </div>

            {/* Prompt samples - expand below action buttons */}
            <div
                className={cn(
                    'space-y-1 transition-all duration-300 overflow-hidden',
                    !activeCategory ? 'max-h-0 opacity-0' : 'max-h-[200px] opacity-100'
                )}
            >
                {activeCategory &&
                    promptSamples[activeCategory]?.map((prompt, index) => (
                        <button
                            key={index}
                            type="button"
                            className={cn(
                                'w-full text-left px-3 py-2 rounded-md text-sm',
                                'hover:bg-muted/80 transition-colors',
                                'flex items-center gap-2 group'
                            )}
                            onClick={() => handlePromptClick(prompt)}
                        >
                            <Search className="h-3 w-3 text-muted-foreground flex-shrink-0 group-hover:text-foreground" />

                            {index === 0 && activeCategory === 'games' && (
                                <Badge variant="destructive" className="text-3xs uppercase text-align-left">🔥 Hot!</Badge>
                            )}
                            <span className="line-clamp-1">{prompt}</span>
                        </button>
                    ))}
            </div>
        </div>
    )
}
