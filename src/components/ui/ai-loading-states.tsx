'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Avatar, AvatarFallback } from './avatar'
import StreamingMessage from './streaming-message'
import SimpleAILoading from './simple-ai-loading'

interface AILoadingStatesProps {
  isAIThinking: boolean
  showWaitingMessage: boolean
  isAIResponding: boolean
  streamingMessageId: string | null
  streamingContent: string
}

export const AILoadingStates: React.FC<AILoadingStatesProps> = ({
  isAIThinking,
  showWaitingMessage,
  isAIResponding,
  streamingMessageId,
  streamingContent
}) => {
  // Show loading during thinking, waiting, or responding (but NOT if streaming message exists)
  if ((isAIThinking || showWaitingMessage || (isAIResponding && (!streamingContent || streamingContent.trim().length === 0))) && !streamingMessageId) {
    return (
      <div className="flex justify-start mb-6">
        <div className="flex items-start gap-3 max-w-[85%]">
          {/* AI Avatar */}
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold">
              AI
            </AvatarFallback>
          </Avatar>
          
          {/* Loading Animation */}
          <div className="flex-1 pt-1">
            <SimpleAILoading text="Bir saniye bekleyin..." />
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AILoadingStates