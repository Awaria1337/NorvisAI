'use client'

import React from 'react'
import { Avatar, AvatarFallback } from './avatar'
import { Message } from '@/store/chatStore'

interface MessageBubbleProps {
  message: Message
  isUser: boolean
}

const getFileTypeFromUrl = (url: string) => {
  if (url.startsWith('data:image/')) return 'image';
  if (url.includes('pdf') || url.startsWith('data:application/pdf')) return 'pdf';
  if (url.includes('word') || url.includes('docx')) return 'word';
  if (url.includes('excel') || url.includes('xlsx')) return 'excel';
  return 'document';
};

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return '/pdf_icon.png';
    case 'word':
      return '/word_icon.png';
    case 'excel':
      return '/excel_icon.png';
    default:
      return '/pdf_icon.png';
  }
};

const getFileColor = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return 'bg-red-500';
    case 'word':
      return 'bg-blue-500';
    case 'excel':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  if (isUser) {
    // User message - Right side with bubble
    return (
      <div className="flex justify-end mb-6">
        <div className="flex items-start space-x-3 max-w-[80%]">
          <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
            {/* Display images and documents if any */}
            {message.images && message.images.length > 0 && (
              <div className="mb-3 space-y-2">
                {message.images.map((imageUrl, index) => {
                  const fileType = getFileTypeFromUrl(imageUrl);
                  
                  if (fileType === 'image') {
                    return (
                      <img 
                        key={index}
                        src={imageUrl}
                        alt={`Uploaded image ${index + 1}`}
                        className="max-w-full h-auto rounded-lg border border-gray-600"
                        style={{ maxHeight: '200px' }}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    );
                  } else {
                    const fileIcon = getFileIcon(fileType);
                    const fileColor = getFileColor(fileType);
                    
                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <img 
                            src={fileIcon} 
                            alt={fileType} 
                            className="w-8 h-8 object-contain"
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-100">
                            {fileType.toUpperCase()} Dosyası
                          </p>
                          <p className="text-xs text-gray-300">
                            Dosya yüklendi
                          </p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
            {message.content && (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
            )}
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