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
      <div className="flex justify-start mb-8">
        <div className="flex items-start space-x-3 max-w-[100%]">
          <SimpleAILoading text="Bir saniye bekleyin..." />
        </div>
      </div>
    )
  }

  return null
}

export default AILoadingStates