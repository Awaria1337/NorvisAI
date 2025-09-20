'use client'

import React from 'react'
import { Avatar, AvatarFallback } from './avatar'
import { Message } from '@/store/chatStore'

interface MessageBubbleProps {
  message: Message
  isUser: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  if (isUser) {
    // User message - Right side with bubble
    return (
      <div className="flex justify-end mb-6">
        <div className="flex items-start space-x-3 max-w-[80%]">
          <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-gray-800 text-gray-100 font-bold text-sm">
              M
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    )
  }

  // AI message - Left side without bubble (ChatGPT style)
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
            {message.model && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {message.model}
              </span>
            )}
          </div>
          <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble