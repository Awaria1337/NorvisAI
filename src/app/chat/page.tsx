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
  FileText
} from 'lucide-react';
import MessageBubble from '@/components/ui/message-bubble';
import AILoadingStates from '@/components/ui/ai-loading-states';
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

    const newFileItems = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file: file,
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadedFiles(prev => [...prev, ...newFileItems]);
    
    const fileText = newFileItems.length === 1 ? 'dosya' : 'dosya';
    showToast.success(`${newFileItems.length} ${fileText} başarıyla yüklendi!`, {
      duration: 3000,
    });
    
    // Clear the input value to allow re-uploading the same file
    event.target.value = '';
  };

  // Simple file remove helper for existing preview system
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    showToast.success('Dosya kaldırıldı', {
      duration: 2000,
    });
  };

  // Simple preview helper for existing system
  const createFilePreview = (fileItem: any) => {
    return fileItem.preview || null;
  };

  const getFileType = (fileItem: any) => {
    const file = fileItem.file || fileItem;
    if (file.type?.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) return 'word';
    if (
      file.type === 'application/vnd.ms-excel' || 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) return 'excel';
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

  // Redirect to specific chat URL if we have a current chat but are on general /chat page
  useEffect(() => {
    if (currentChatId && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const expectedPath = `/chat/${currentChatId}`;
      
      // Only redirect if we're on /chat (not on a specific chat page)
      if (currentPath === '/chat') {
        router.push(expectedPath);
      }
    }
  }, [currentChatId, router]);

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

        {/* Message Input - Fixed Bottom - Original Design Restored */}
        <div className={`fixed bottom-0 left-0 right-0 bg-background backdrop-blur-sm px-6 py-4 z-50 transition-all duration-300 ${
          sidebarState === 'expanded' ? 'md:left-64' : 'md:left-16'
        }`}>
              <div className="max-w-3xl mx-auto">
                {/* Outer Container - Compact */}
                <div
                  className="rounded-2xl p-1 space-y-3"
                  style={{ backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)' }}
                >
                  {/* Pro Plan Text */}
                  <div className="px-3 mb-1">
                    <div className="text-xs text-muted-foreground/80">
                      Use our faster AI on Pro Plan • <span className="text-primary hover:underline cursor-pointer">Upgrade</span>
                    </div>
                  </div>


                  {/* Main Input Container */}
                  <div 
                    className="rounded-xl border border-border/10 p-3" 
                    style={{ backgroundColor: 'rgb(4, 4, 6)' }}
                  >
                    {/* File Previews */}
                    {uploadedFiles.length > 0 && (
                      <div className="mb-3">
                        <div className="flex gap-2 flex-wrap">
                          {uploadedFiles.map((fileItem, index) => {
                            const file = fileItem.file || fileItem;
                            const fileName = file.name || fileItem.name || 'Unknown';
                            const preview = createFilePreview(fileItem);
                            const fileType = getFileType(fileItem);
                            const fileIcon = getFileIcon(fileType);
                            const fileColor = getFileColor(fileType);
                            
                            return (
                              <div 
                                key={fileItem.id || index} 
                                className="relative bg-muted/20 rounded-lg overflow-hidden border border-border/20"
                                style={{ width: '80px', height: '80px' }}
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                              >
                                {preview ? (
                                  <img 
                                    src={preview} 
                                    alt={fileName}
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                    onDragStart={(e) => e.preventDefault()}
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-1">
                                    <div className="w-10 h-10 flex items-center justify-center mb-1">
                                      <img 
                                        src={fileIcon} 
                                        alt={fileType} 
                                        className="w-8 h-8 object-contain"
                                        draggable={false}
                                        onDragStart={(e) => e.preventDefault()}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground/70 text-center truncate w-full">
                                      {fileName && fileName.length > 12 ? fileName.substring(0, 8) + '...' : fileName}
                                    </span>
                                  </div>
                                )}
                                <button
                                  onClick={() => removeFile(index)}
                                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90 shadow-sm"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Textarea - Compact */}
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
                      placeholder="Norvis AI'ya bir şey sorun..."
                      className="w-full min-h-[40px] max-h-32 resize-none border-0 px-0 py-1 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed mb-3 bg-transparent"
                      style={{ backgroundColor: 'transparent' }}
                      maxLength={2000}
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />


                    {/* Hidden file input */}
                    <input
                      type="file"
                      id="file-upload-input"
                      className="hidden"
                      multiple
                      accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileInputChange}
                    />

                    {/* Bottom Row - Controls */}
                    <div className="flex items-center justify-between">
                      {/* Left Side - Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full hover:bg-accent"
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
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {uploadedFiles.length >= 3 ? 'Maksimum 3 dosya (Pro için yükselt)' : 'Dosya ekle'}
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full hover:bg-accent"
                            >
                              <Mic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Voice input</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full hover:bg-accent"
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Web search</TooltipContent>
                        </Tooltip>
                      </div>
                      
                      {/* Right Side - Send Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleSendClick}
                            size="sm"
                            disabled={(!inputMessage.trim() && uploadedFiles.length === 0) || isAIThinking || isAIResponding}
                            className="h-8 w-8 rounded-full bg-foreground hover:bg-foreground/90 text-background disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
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