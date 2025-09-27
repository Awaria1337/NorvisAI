'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import AdvancedFilePreview, { FileUploadStats } from '@/components/ui/advanced-file-preview';
import { getFileDisplayInfo, formatFileSize, validateFile } from '@/utils/fileUtils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Share,
  Copy,
  Paperclip,
  MoreHorizontal,
  Mic,
  MessageSquare,
  ArrowUp,
  Key,
  Search,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Trash2,
  FileText,
  Square
} from 'lucide-react';
import MessageBubble from '@/components/ui/message-bubble';
import AILoadingStates from '@/components/ui/ai-loading-states';
import VoiceInput from '@/components/ui/voice-input';
import SearchModal from '@/components/ui/search-modal';
import KeyboardShortcutsModal from '@/components/ui/keyboard-shortcuts-modal';
// import { ApiKeyModal } from '@/components/api-key-modal';




const ChatPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, user } = useAuthStore();
  
  // Custom toast helper with Lucide icons
  const showToast = {
    success: (message: string, options?: { duration?: number }) => {
      toast.success(message, {
        duration: options?.duration || 3000,
      });
    },
    error: (message: string, options?: { duration?: number }) => {
      toast.error(message, {
        duration: options?.duration || 4000,
      });
    },
    warning: (message: string, options?: { duration?: number }) => {
      toast.error(message, {
        duration: options?.duration || 4000,
      });
    },
    info: (message: string, options?: { duration?: number }) => {
      toast(message, {
        duration: options?.duration || 3000,
      });
    }
  };
  const {
    chats,
    getCurrentChat,
    currentChatId,
    fetchChats,
    createNewChat,
    sendMessage,
    setCurrentChatId,
    navigateToChat,
    setChats,
    deleteChat,
    renameChat
  } = useChatStore();
  
  // Sidebar state will be passed from AppSidebar
  const [sidebarState, setSidebarState] = useState<'expanded' | 'collapsed'>('expanded');
  
  // Memoize currentChat to ensure proper re-rendering when chats or currentChatId changes
  const currentChat = useMemo(() => getCurrentChat(), [chats, currentChatId, getCurrentChat]);
  const [inputMessage, setInputMessage] = useState('');
  // const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  // Scroll reference for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Get AI loading states from store
  const { isAIThinking, isAIResponding, showWaitingMessage, streamingMessageId, streamingContent } = useChatStore();
  
  // Auto-scroll to bottom when new messages arrive or AI states change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Scroll to bottom when messages change or AI states change
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isAIThinking, isAIResponding, showWaitingMessage, streamingContent]);

  // Keyboard shortcuts
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Cmd/Ctrl + / for keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        }
        if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, showKeyboardShortcuts]);

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage.trim();
    if (!content && uploadedFiles.length === 0) return;

    // Don't send if AI is already processing
    if (isAIThinking || isAIResponding) {
      showToast.warning('AI şu anda meşgul, lütfen bekleyin...', {
        duration: 2000,
      });
      return;
    }

    // Clear input and files immediately for better UX
    setInputMessage('');
    const filesToSend = [...uploadedFiles];
    setUploadedFiles([]);
    
    try {
      await sendMessage(content, false, filesToSend);
    } catch (error) {
      // If message fails, restore the input content and files
      setInputMessage(content);
      setUploadedFiles(filesToSend);
      showToast.error('Mesaj gönderilemedi, lütfen tekrar deneyin.');
    }
  };

  const handleSendClick = () => {
    // if (!hasApiKeys) {
    //   setShowApiKeyModal(true);
    //   return;
    // }
    handleSendMessage();
  };
  
  // Voice input handler - mevcut metne ekle
  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      setInputMessage(prevMessage => {
        const currentMessage = prevMessage.trim();
        if (currentMessage) {
          // Eğer mevcut metin varsa, araya boşluk ekleyerek birleştir
          return currentMessage + ' ' + transcript.trim();
        } else {
          // Eğer mevcut metin yoksa, sadece yeni transcript'i ekle
          return transcript.trim();
        }
      });
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await createNewChat('New Chat');
      // Clear input when creating new chat
      setInputMessage('');
    } catch (error) {
      showToast.error('Yeni sohbet oluşturulamadı, lütfen tekrar deneyin.');
    }
  };

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const handleChatSelectFromSearch = (chatId: string) => {
    navigateToChat(chatId);
    setIsSearchOpen(false);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Check if adding new files would exceed the limit of 3
    if (uploadedFiles.length + files.length > 3) {
      showToast.warning('Maksimum 3 dosya yükleyebilirsiniz! Pro plana geçerek daha fazla dosya yükleyebilirsiniz.', {
        duration: 5000,
      });
      event.target.value = ''; // Clear the input
      return;
    }

    const validFiles: any[] = [];
    const invalidFiles: string[] = [];
    const warnings: string[] = [];

    Array.from(files).forEach((file, index) => {
      // Validate each file
      const validation = validateFile({
        size: file.size,
        type: file.type,
        name: file.name
      });

      if (validation.valid) {
        const fileItem = {
          id: `${Date.now()}-${index}`,
          file: file,
          name: file.name,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        };
        validFiles.push(fileItem);
        
        if (validation.warning) {
          warnings.push(`${file.name}: ${validation.warning}`);
        }
      } else {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      }
    });

    // Add valid files
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      
      const fileText = validFiles.length === 1 ? 'dosya' : 'dosya';
      showToast.success(`${validFiles.length} ${fileText} başarıyla yüklendi!`, {
        duration: 3000,
      });
    }

    // Show warnings
    warnings.forEach(warning => {
      showToast.warning(warning, { duration: 4000 });
    });

    // Show errors
    invalidFiles.forEach(error => {
      showToast.error(error, { duration: 5000 });
    });
    
    // Clear the input value to allow re-uploading the same file
    event.target.value = '';
  };

  // File remove helper using new utility
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    showToast.success('Dosya kaldırıldı', {
      duration: 2000,
    });
  };

  const handleChatRename = async (chatId: string, newTitle: string) => {
    try {
      console.log('📝 Renaming chat:', chatId, 'to:', newTitle);
      await renameChat(chatId, newTitle);
      console.log('✅ Chat renamed successfully in database and UI');
    } catch (error) {
      console.error('❌ Failed to rename chat:', error);
      // Show user-friendly error message
      alert('Sohbet adlandırılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleChatDelete = async (chatId: string) => {
    try {
      console.log('🗑️ Deleting chat:', chatId);
      await deleteChat(chatId);
      console.log('✅ Chat deleted successfully from database and UI');
    } catch (error) {
      console.error('❌ Failed to delete chat:', error);
      // Show user-friendly error message
      alert('Sohbet silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleChatArchive = async (chatId: string) => {
    try {
      // TODO: Backend API hazır olunca gerçek archive isteği yapılacak
      
      // Local state'ten chat'i kaldır (arşivlenmiş chat'ler görünmez)
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      
      console.log('✅ Sohbet arşivlendi (local)');
    } catch (error) {
      console.error('Failed to archive chat:', error);
    }
  };



  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch chats when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchChats();
    }
  }, [isAuthenticated, fetchChats]);

  // Note: URL navigation is now handled by chatStore.navigateToChat() and createNewChat()
  // No need for additional URL redirects here to prevent URL jumping bugs

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading...</p>
          <p className="mt-2 text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={navigateToChat}
          onNewChat={handleNewChat}
          onSearchOpen={handleSearchOpen}
          onChatRename={handleChatRename}
          onChatDelete={handleChatDelete}
          onChatArchive={handleChatArchive}
          onSidebarStateChange={setSidebarState}
        />


        <SidebarInset>
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden relative">
            {/* ChatGPT-style Fixed Top Left */}
            <div className={`fixed top-0 left-0 z-30 flex items-center space-x-3 p-3 transition-all duration-300 ${
              sidebarState === 'expanded' ? 'md:left-64' : 'md:left-16'
            }`}>
              {/* Mobile Sidebar Trigger - only show on mobile */}
              <SidebarTrigger className="md:hidden bg-background/80 backdrop-blur-sm border border-border rounded-md p-2 shadow-sm hover:bg-accent" />
              <h1 className="text-xl font-semibold text-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg">Norvis AI</h1>
            </div>

            {/* Messages Area - ChatGPT style, starts from top */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-hidden">
              <div className="p-6 pt-16 space-y-6 max-w-3xl mx-auto min-h-full pb-48">
                {currentChat?.messages && currentChat.messages.length > 0 ? (
                  <>
                    {currentChat.messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isUser={message.role === 'user'}
                      />
                    ))}
                    
                    {/* AI Loading States */}
                    <AILoadingStates
                      isAIThinking={isAIThinking}
                      showWaitingMessage={showWaitingMessage}
                      isAIResponding={isAIResponding}
                      streamingMessageId={streamingMessageId}
                      streamingContent={streamingContent}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/60 mx-auto mb-8" />
                        <h1 className="text-3xl font-medium text-foreground mb-4 tracking-tight">
                          Merhaba {user?.name || 'Kullanıcı'}!
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                          AI asistanımızla sohbete başlayın. Soru sorun, yaratıcı olun veya yeni fikirler keşfedin.
                        </p>
                      </div>
                    </div>
                    
                    {/* AI Loading States for empty chat */}
                    <AILoadingStates
                      isAIThinking={isAIThinking}
                      showWaitingMessage={showWaitingMessage}
                      isAIResponding={isAIResponding}
                      streamingMessageId={streamingMessageId}
                      streamingContent={streamingContent}
                    />
                  </>
                )}
                
                
                {/* Invisible div at the end for auto-scrolling */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </ScrollArea>

        {/* Message Input - New Clean Design */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md px-6 py-4 z-50 transition-all duration-300 md:left-64">
          <div className="max-w-3xl mx-auto">
            {/* File Previews - Outside Input */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3">
                <AdvancedFilePreview
                  fileItems={uploadedFiles}
                  onRemove={removeFile}
                  maxFiles={3}
                  compact={true}
                  showDetails={false}
                />
              </div>
            )}
            
            {/* Main Input Container - 55px Height */}
            <div className="rounded-full border border-gray-600 px-4 shadow-lg" style={{backgroundColor: '#242628', borderRadius: '10rem', height: '60px', border: '1px solid #2F3132'}}>
              <div className="flex items-center justify-between gap-3 h-full">
                
                {/* Left Side - File Upload */}
                <div className="flex items-center justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white p-0 flex items-center justify-center"
                        disabled={uploadedFiles.length >= 3}
                        onClick={() => {
                          if (uploadedFiles.length >= 3) {
                            showToast.warning('Maksimum 3 dosya yükleyebilirsiniz! Pro plana geçerek daha fazla dosya yükleyebilirsiniz.', {
                              duration: 5000,
                            });
                            return;
                          }
                          const fileInput = document.getElementById('file-upload-input');
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {uploadedFiles.length >= 3 ? 'Maksimum 3 dosya (Pro için yükselt)' : 'Dosya ekle'}
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                {/* Center - Input Area */}
                <div className="flex-1 flex items-center justify-center h-full">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 2000) {
                        setInputMessage(value);
                      } else {
                        console.error('❌ Maksimum 2000 karakter girebilirsiniz!');
                        alert('⚠️ Maksimum 2000 karakter girebilirsiniz!');
                      }
                    }}
                    placeholder="Message Norvis AI..."
                    className="w-full min-h-[26px] max-h-32 resize-none border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-0 px-2"
                    maxLength={2000}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    style={{
                      minHeight: '26px',
                      lineHeight: '26px'
                    }}
                  />
                </div>
                
                {/* Right Side - Dynamic Button (Voice/Send/Stop) */}
                <div className="flex items-center justify-center">
                  {(isAIThinking || isAIResponding) ? (
                    // Stop Button
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => useChatStore.getState().stopStreaming()}
                          size="sm"
                          className="h-10 w-10 rounded-full bg-red-600 hover:bg-red-700 text-white p-0 flex items-center justify-center"
                        >
                          <Square className="h-4 w-4 fill-current" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Stop generating</TooltipContent>
                    </Tooltip>
                  ) : inputMessage.trim() || uploadedFiles.length > 0 ? (
                    // Send Button - when there's content
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSendClick}
                          size="sm"
                          className="h-10 w-10 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white p-0 transition-all duration-200 flex items-center justify-center"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send message</TooltipContent>
                    </Tooltip>
                  ) : (
                    // Voice Button - when empty
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center">
                          <VoiceInput
                            onTranscript={handleVoiceTranscript}
                            disabled={isAIThinking || isAIResponding}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Voice input</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                
              </div>
            </div>
            
            {/* Hidden file input */}
            <input
              type="file"
              id="file-upload-input"
              className="hidden"
              multiple
              accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.html,.css,.js,.ts,.json,.xml,.yaml,.yml,.md,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.sql,.zip,.rar,.7z,.mp3,.wav,.mp4,.avi,.mov,.webm,.svg,.psd,.ai"
              onChange={handleFileInputChange}
            />
          </div>
        </div>
          </div>
        </SidebarInset>
        
        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={handleSearchClose}
          onChatSelect={handleChatSelectFromSearch}
        />
        
        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
        
        
        {/* API Key Management Modal */}
        {/* <ApiKeyModal
          open={showApiKeyModal}
          onOpenChange={setShowApiKeyModal}
          onApiKeysUpdated={fetchAvailableModels}
        /> */}
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default ChatPage;