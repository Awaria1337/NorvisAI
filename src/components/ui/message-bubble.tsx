'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

const getFileTypeFromMimeType = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'excel';
  if (mimeType === 'text/plain') return 'text';
  return 'document';
};

const getFileDisplayName = (mimeType: string) => {
  const fileType = getFileTypeFromMimeType(mimeType);
  switch (fileType) {
    case 'pdf': return 'PDF';
    case 'word': return 'Word';
    case 'excel': return 'Excel';
    case 'text': return 'Text';
    case 'image': return 'Image';
    default: return 'Document';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            {/* Display files if any */}
            {message.files && message.files.length > 0 && (
              <div className="mb-3 space-y-2">
                {message.files.map((file, index) => {
                  const fileType = getFileTypeFromMimeType(file.type);
                  
                  if (fileType === 'image' && file.preview) {
                    return (
                      <img 
                        key={index}
                        src={file.preview}
                        alt={file.name}
                        className="max-w-full h-auto rounded-lg border border-gray-600"
                        style={{ maxHeight: '200px' }}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    );
                  } else {
                    const fileIcon = getFileIcon(fileType);
                    const displayName = getFileDisplayName(file.type);
                    
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-100 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-300">
                            {displayName} • {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
            {/* Legacy support for images array (backward compatibility) */}
            {!message.files && message.images && message.images.length > 0 && (
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
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble