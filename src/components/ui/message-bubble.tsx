'use client'

import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message } from '@/store/chatStore'
import { useChatStore } from '@/store/chatStore'
import CodeBlock from '@/components/ui/code-block'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import MessageEditSidebar from '@/components/ui/message-edit-sidebar'
import MessageEditModal from '@/components/ui/message-edit-modal'
import MessageHoverActions from '@/components/ui/message-hover-actions'
import TypingSkeleton, { AITypingIndicator } from '@/components/ui/typing-skeleton'
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  Share2,
  RefreshCw,
  MoreHorizontal,
  MessageSquarePlus,
  Volume2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  isUser: boolean
  isStreaming?: boolean
  streamingContent?: string
}

// Typing effect hook for smooth character-by-character display
const useTypingEffect = (text: string, speed: number = 30, enabled: boolean = false) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    if (!text) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    const typeCharacter = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        timeoutRef.current = setTimeout(typeCharacter, speed);
      } else {
        setIsComplete(true);
      }
    };

    timeoutRef.current = setTimeout(typeCharacter, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
};

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

// Kod dosyası uzantıları - bunlar için kırmızı code icon kullanılacak
const codeExtensions = [
  // Web Technologies
  'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'sass', 'less',
  // Programming Languages
  'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt',
  // Data/Config
  'json', 'xml', 'yaml', 'yml', 'sql', 'md', 'txt', 'csv'
];

// Bilinen dosya türleri
const knownFileTypes = ['pdf', 'word', 'excel', 'image'];

// Bilinen document uzantıları
const documentExtensions = ['rtf', 'odt', 'pages', 'docm', 'dotx'];

const getFileIcon = (filename: string, fileType: string) => {
  const extension = filename?.split('.').pop()?.toLowerCase();
  
  // Kod dosyları için kırmızı code icon
  if (extension && codeExtensions.includes(extension)) {
    return '/code_icon.png';
  }
  
  // Özel dosya türleri için specific iconlar
  switch (fileType) {
    case 'pdf':
      return '/pdf_icon.png';
    case 'word':
      return '/word_icon.png';
    case 'excel':
      return '/excel_icon.png';
    case 'image':
      return '/image_icon.png';
    default:
      // Bilinen document uzantıları için document icon
      if (extension && documentExtensions.includes(extension)) {
        return '/document_icon.png';
      }
      // Bilinmeyen uzantılar için bilinmeyen dosya icon
      return '/bilinmeyen_dosya.png';
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isUser, 
  isStreaming = false, 
  streamingContent 
}) => {
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get streaming state from store
  const { streamingMessageId, streamingContent: storeStreamingContent, isAIResponding, editMessage } = useChatStore();
  
  // Determine if this message is currently streaming
  const isCurrentlyStreaming = isAIResponding && streamingMessageId === message.id;
  const currentContent = isCurrentlyStreaming ? (storeStreamingContent || streamingContent || '') : message.content;
  
  // Use typing effect for streaming messages
  const { displayedText, isComplete } = useTypingEffect(
    currentContent, 
    15, // Faster typing speed for better UX
    isCurrentlyStreaming && currentContent.length > 0
  );
  
  // Message action handlers
  const handleEditMessage = (messageId: string) => {
    setEditingMessageId(messageId);
    setIsEditModalOpen(true);
  };
  
  const handleEditMessageOld = (messageId: string) => {
    setEditingMessageId(messageId);
    setIsEditSidebarOpen(true);
  };

  const handleRegenerateMessage = (messageId: string) => {
    // TODO: Implement regenerate functionality
    console.log('Regenerating message:', messageId);
  };

  const handleRateMessage = (messageId: string, rating: 'up' | 'down') => {
    // TODO: Implement rating functionality
    console.log('Rating message:', messageId, rating);
  };

  // Copy message handler
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Mesaj panoya kopyalandı!');
    } catch (error) {
      toast.error('Kopyalama başarısız!');
    }
  };

  // Good response handler
  const handleGoodResponse = () => {
    toast.success('Olumlu geri bildirim için teşekkürler!');
    // TODO: Implement actual rating logic
  };

  // Bad response handler
  const handleBadResponse = () => {
    toast.success('Geri bildirim için teşekkürler!');
    // TODO: Implement actual rating logic
  };

  // Share message handler
  const handleShareMessage = async (content: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Norvis AI Mesajı',
          text: content,
        });
      } else {
        await navigator.clipboard.writeText(content);
        toast.success('Mesaj paylaşım için panoya kopyalandı!');
      }
    } catch (error) {
      toast.error('Paylaşım başarısız!');
    }
  };

  // Retry message handler
  const handleRetryMessage = () => {
    toast.success('Mesaj yeniden oluşturuluyor...');
    // TODO: Implement actual retry logic
  };

  // New chat from message handler
  const handleNewChatFromMessage = () => {
    toast.success('Bu mesajdan yeni sohbet başlatılıyor...');
    // TODO: Implement new chat creation
  };

  // Read aloud handler
  const handleReadAloud = (content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'tr-TR';
      speechSynthesis.speak(utterance);
      toast.success('Mesaj sesli okunuyor...');
    } else {
      toast.error('Sesli okuma bu tarayıcıda desteklenmiyor!');
    }
  };

  // Close edit sidebar
  const handleCloseEditSidebar = () => {
    setIsEditSidebarOpen(false);
    setEditingMessageId(null);
  };

  // Save edited message
  const handleSaveEditedMessage = (messageId: string, newContent: string) => {
    // TODO: Implement actual message update logic
    console.log('Saving edited message:', messageId, newContent);
    toast.success('Mesaj kaydedildi! (Geliştirme aşamasında)');
  };
  
  // Close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingMessageId(null);
  };
  
  // Save edited message from modal
  const handleSaveEditedMessageFromModal = async (newContent: string) => {
    if (!editingMessageId) return;
    
    try {
      await editMessage(editingMessageId, newContent);
      toast.success('Mesaj düzenlendi ve AI yeniden cevap veriyor!');
    } catch (error) {
      toast.error('Mesaj düzenleme başarısız!');
      console.error('Edit message error:', error);
    }
  };
  
  if (isUser) {
    // User message - Right side with bubble
    return (
      <>
      <div className="flex justify-end mb-8">
        <div 
          className="max-w-[80%] relative pb-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
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
                    const fileIcon = getFileIcon(file.name, fileType);
                    const displayName = getFileDisplayName(file.type);
                    const extension = file.name?.split('.').pop()?.toLowerCase();
                    const isCodeFile = extension && codeExtensions.includes(extension);
                    const isKnownDocument = extension && documentExtensions.includes(extension);
                    const isKnownFileType = knownFileTypes.includes(fileType);
                    const isUnknownFile = !isCodeFile && !isKnownDocument && !isKnownFileType;
                    
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
                          <div className="flex items-center space-x-2">
                            <p className="text-base font-medium text-gray-100 truncate">
                              {file.name}
                            </p>
                            {isCodeFile && (
                              <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                                {extension?.toUpperCase()}
                              </span>
                            )}
                            {isUnknownFile && (
                              <span className="px-1.5 py-0.5 bg-orange-600 text-white text-xs font-bold rounded">
                                Bilinmeyen
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300">
                            {displayName} • {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
            
            {message.content && (
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
            )}
          </div>
          
          {/* Hover Actions - mesajın hemen altında */}
          {isHovered && (
            <div className="absolute bottom-2 right-0 opacity-100 transition-opacity duration-150 mt-3">
              <MessageHoverActions
                messageId={message.id}
                content={message.content}
                onEdit={handleEditMessage}
                className=""
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Sidebar for user messages */}
      <MessageEditSidebar
        isOpen={isEditSidebarOpen && editingMessageId === message.id}
        onClose={handleCloseEditSidebar}
        originalMessage={message.content}
        messageId={message.id}
        onSave={handleSaveEditedMessage}
      />
      
      {/* Edit Modal for user messages */}
      <MessageEditModal
        isOpen={isEditModalOpen && editingMessageId === message.id}
        onClose={handleCloseEditModal}
        originalMessage={message.content}
        onSave={handleSaveEditedMessageFromModal}
      />
      </>
    );
  }

  // AI message - Left side without bubble (ChatGPT style)
  return (
    <>
    <div className="flex justify-start mb-8">
      <div className="flex items-start space-x-4 max-w-[90%] w-full">
        <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
          <img 
            src="/norvis_logo.png" 
            alt="Norvis AI" 
            className="h-8 w-8 object-contain filter invert"
          />
        </div>
        <div className="flex-1 min-w-0">
          {(displayedText || (!isCurrentlyStreaming && message.content)) && (
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-xl font-bold mb-2 text-foreground font-heading">{children}</h1>,
                  h2: ({children}) => <h2 className="text-lg font-bold mb-2 text-foreground font-heading">{children}</h2>,
                  h3: ({children}) => <h3 className="text-base font-bold mb-1 text-foreground font-heading">{children}</h3>,
                  h4: ({children}) => <h4 className="text-base font-semibold mb-1 text-foreground font-heading">{children}</h4>,
                  h5: ({children}) => <h5 className="text-sm font-semibold mb-1 text-foreground font-heading">{children}</h5>,
                  h6: ({children}) => <h6 className="text-sm font-medium mb-1 text-foreground font-heading">{children}</h6>,
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
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-base font-mono text-foreground">{children}</code>
                    ) : (
                      <CodeBlock className={className} language={match?.[1]}>
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    )
                  },
                  table: ({children}) => <table className="border-collapse border border-gray-300 dark:border-gray-600 mb-2">{children}</table>,
                  th: ({children}) => <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-50 dark:bg-gray-700 font-semibold text-foreground font-content">{children}</th>,
                  td: ({children}) => <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-foreground font-content">{children}</td>
                }}
              >
                {isCurrentlyStreaming ? displayedText : message.content}
              </ReactMarkdown>
              
              {/* Cursor effect for streaming */}
              {isCurrentlyStreaming && !isComplete && (
                <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1 align-text-bottom"></span>
              )}
            </div>
          )}

          {/* Message Action Bar for AI */}
          <div className="flex items-center gap-2 mt-3">
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => handleCopyMessage(message.content)}
            >
              <Copy className="h-4 w-4 text-gray-500" />
            </Button>

            {/* Good Response Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-600"
              onClick={handleGoodResponse}
            >
              <ThumbsUp className="h-4 w-4 text-gray-500" />
            </Button>

            {/* Bad Response Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600"
              onClick={handleBadResponse}
            >
              <ThumbsDown className="h-4 w-4 text-gray-500" />
            </Button>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600"
              onClick={() => handleShareMessage(message.content)}
            >
              <Share2 className="h-4 w-4 text-gray-500" />
            </Button>

            {/* Retry Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleRetryMessage}
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </Button>

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleNewChatFromMessage}>
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Yeni sohbet başlat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReadAloud(message.content)}>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Sesli oku
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default MessageBubble