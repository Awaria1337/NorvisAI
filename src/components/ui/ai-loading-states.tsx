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
  // If streaming, use streaming component
  if (streamingMessageId && streamingContent) {
    return (
      <div className="flex justify-start mb-8">
        <div className="flex items-start space-x-4 max-w-[100%]">
          <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
            <img 
              src="/norvis_logo.png" 
              alt="Norvis AI" 
              className="h-8 w-8 object-contain filter invert"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm leading-relaxed text-foreground prose prose-sm dark:prose-invert max-w-none font-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-foreground font-heading">{children}</h1>,
                  h2: ({children}) => <h2 className="text-base font-bold mb-2 text-foreground font-heading">{children}</h2>,
                  h3: ({children}) => <h3 className="text-sm font-bold mb-1 text-foreground font-heading">{children}</h3>,
                  h4: ({children}) => <h4 className="text-sm font-semibold mb-1 text-foreground font-heading">{children}</h4>,
                  h5: ({children}) => <h5 className="text-xs font-semibold mb-1 text-foreground font-heading">{children}</h5>,
                  h6: ({children}) => <h6 className="text-xs font-medium mb-1 text-foreground font-heading">{children}</h6>,
                  p: ({children}) => <p className="mb-2 text-foreground font-content leading-relaxed">{children}</p>,
                  strong: ({children}) => <strong className="font-semibold text-foreground font-content">{children}</strong>,
                  em: ({children}) => <em className="italic text-foreground font-content">{children}</em>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-2 text-foreground font-content">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-2 text-foreground font-content">{children}</ol>,
                  li: ({children}) => <li className="mb-1 text-foreground font-content">{children}</li>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-2 text-foreground font-content">{children}</blockquote>,
                  code: ({children, className}) => {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match
                    return isInline ? (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>
                    ) : (
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto mb-2">
                        <code className="text-sm font-mono text-foreground">{children}</code>
                      </pre>
                    )
                  },
                  table: ({children}) => <table className="border-collapse border border-gray-300 dark:border-gray-600 mb-2">{children}</table>,
                  th: ({children}) => <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-50 dark:bg-gray-700 font-semibold text-foreground font-content">{children}</th>,
                  td: ({children}) => <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-foreground font-content">{children}</td>
                }}
              >
                {streamingContent}
              </ReactMarkdown>
              <span className="inline-block w-2 h-5 bg-foreground ml-1 animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // AI thinking state - show simple loader only
  if (isAIThinking) {
    return (
      <div className="flex justify-start mb-8">
        <div className="flex items-start space-x-3 max-w-[100%]">
          <SimpleAILoading text="Bir saniye bekleyin..." />
        </div>
      </div>
    )
  }

  // Waiting message state - also show simple loader
  if (showWaitingMessage) {
    return (
      <div className="flex justify-start mb-8">
        <div className="flex items-start space-x-3 max-w-[100%]">
          <SimpleAILoading text="Bir saniye bekleyin..." />
        </div>
      </div>
    )
  }

  // AI responding (but not streaming) - still show simple loader until stream starts
  if (isAIResponding) {
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