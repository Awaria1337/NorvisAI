'use client'

import React from 'react'
import { Avatar, AvatarFallback } from './avatar'
import AIStateLoading from './aiStateLoading'
import AITextLoading from './thinkingTest'
import StreamingMessage from './streaming-message'

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
  // If streaming, use streaming component
  if (streamingMessageId && streamingContent) {
    return (
      <div className="flex justify-start mb-6">
        <div className="flex items-start space-x-4 max-w-[90%]">
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
              <span className="text-xs text-muted-foreground bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full animate-pulse">
                Typing...
              </span>
            </div>
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {streamingContent}
              <span className="inline-block w-2 h-5 bg-foreground ml-1 animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // AI thinking state
  if (isAIThinking) {
    return (
      <div className="flex justify-start mb-6">
        <div className="flex items-start space-x-4 max-w-[90%]">
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
            </div>
            <AIStateLoading />
          </div>
        </div>
      </div>
    )
  }

  // Waiting message state
  if (showWaitingMessage) {
    return (
      <div className="flex justify-start mb-6">
        <div className="flex items-start space-x-4 max-w-[90%]">
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
            </div>
            <AITextLoading texts={['Düşünüyor...', 'Bir saniye bekleyin...', 'Analiz ediyor...']} />
          </div>
        </div>
      </div>
    )
  }

  // AI responding (but not streaming)
  if (isAIResponding) {
    return (
      <div className="flex justify-start mb-6">
        <div className="flex items-start space-x-4 max-w-[90%]">
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
            </div>
            <AITextLoading texts={['Cevap yazıyor...', 'Hazırlanıyor...', 'Neredeyse bitti...']} />
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AILoadingStates