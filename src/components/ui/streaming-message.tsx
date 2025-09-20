'use client'

import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from './avatar'

interface StreamingMessageProps {
  content: string
  isStreaming: boolean
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ content, isStreaming }) => {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Simulate typing effect when streaming
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content)
      return
    }

    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 30) // Adjust typing speed here (lower = faster)

      return () => clearTimeout(timer)
    }
  }, [content, currentIndex, isStreaming])

  // Reset when content changes
  useEffect(() => {
    if (isStreaming) {
      setCurrentIndex(0)
      setDisplayedContent('')
    }
  }, [content, isStreaming])

  return (
    <div className="w-full">
      <div className="flex items-start space-x-4">
        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
          <AvatarFallback className="bg-green-600 text-white font-bold text-xs">
            AI
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-foreground">
              Norvis AI
            </span>
            {isStreaming && (
              <span className="text-xs text-muted-foreground bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full animate-pulse">
                Typing...
              </span>
            )}
          </div>
          <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {displayedContent}
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-foreground ml-1 animate-pulse"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StreamingMessage