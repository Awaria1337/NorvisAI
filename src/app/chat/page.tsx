'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useGuestStore } from '@/store/guestStore';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import AdvancedFilePreview, { FileUploadStats } from '@/components/ui/advanced-file-preview';
import { getFileDisplayInfo, formatFileSize, validateFile } from '@/utils/fileUtils';
import { useTranslation } from 'react-i18next';

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
  Sparkles,
  ImagePlus,
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
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, user } = useAuthStore();
  
  // Guest mode support
  const { 
    messages: guestMessages, 
    sendGuestMessage, 
    canSendMessage: canSendGuestMessage, 
    getRemainingMessages,
    isLoading: isGuestLoading
  } = useGuestStore();
  
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
    renameChat,
    cleanup,
    generateImage
  } = useChatStore();
  
  // Sidebar state will be passed from AppSidebar
  const [sidebarState, setSidebarState] = useState<'expanded' | 'collapsed'>('expanded');
  
  // Memoize currentChat to ensure proper re-rendering when chats or currentChatId changes
  const currentChat = useMemo(() => {
    // For guest users, create a temporary chat with guest messages
    if (!isAuthenticated) {
      return {
        id: 'guest-chat',
        title: 'Guest Chat',
        messages: guestMessages,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    return getCurrentChat();
  }, [chats, currentChatId, getCurrentChat, isAuthenticated, guestMessages]);
  const [inputMessage, setInputMessage] = useState('');
  // const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  // Scroll reference for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Get AI loading states from store
  const { isAIThinking, isAIResponding, isTypingEffect, showWaitingMessage, streamingMessageId, streamingContent } = useChatStore();
  
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
  
  // Cleanup on page unload, route change, and chat change
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanup();
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup();
      }
    };
    
    // Cleanup on page unload/refresh
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Cleanup when tab becomes hidden
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on component unmount or when chat changes
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanup();
    };
  }, [cleanup]);
  
  // Cleanup when chat changes
  useEffect(() => {
    // Stop any ongoing speech when switching chats
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        // Only cancel if speech is currently active
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      } catch (error) {
        // Silent error handling for speech cancellation
        console.log('Speech synthesis stopped when changing chat');
      }
    }
  }, [currentChatId]);

  // Auto-resize textarea when inputMessage changes
  useEffect(() => {
    const textarea = document.querySelector('textarea[placeholder="Norvis nasıl yardımcı olabilir?"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, 312); // 12 lines * 26px
      textarea.style.height = scrollHeight + 'px';
    }
  }, [inputMessage]);

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

    // Guest mode - use guest store
    if (!isAuthenticated) {
      // Check guest message limit
      if (!canSendGuestMessage()) {
        showToast.error('Misafir kullanıcı mesaj limitine ulaştınız! Giriş yaparak sınırsız mesajlaşabilirsiniz.', {
          duration: 5000,
        });
        return;
      }

      setInputMessage('');
      try {
        await sendGuestMessage(content);
      } catch (error) {
        setInputMessage(content);
        showToast.error('Mesaj gönderilemedi, lütfen tekrar deneyin.');
      }
      return;
    }

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

    // If no current chat, create one first
    if (!currentChatId) {
      console.log('🆕 No active chat, creating new chat first...');
      try {
        const newChat = await createNewChat('New Chat');
        // Wait a bit for the chat to be created and set as current
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        showToast.error('Sohbet oluşturulamadı');
        // Restore input on error
        setInputMessage(content);
        setUploadedFiles(filesToSend);
        return;
      }
    }
    
    try {
      // Check if user wants to generate image
      const imageKeywords = ['görsel oluştur', 'resim oluştur', 'image generate', 'create image', 'draw', 'çiz'];
      const isImageRequest = imageKeywords.some(keyword => content.toLowerCase().includes(keyword));
      
      if (isImageRequest) {
        // Extract prompt and model
        let prompt = content;
        let model = 'dall-e-3'; // Default model
        
        // Check for model specification
        const modelPatterns = [
          { keyword: 'dall-e-3', model: 'dall-e-3' },
          { keyword: 'dall-e-2', model: 'dall-e-2' },
          { keyword: 'gemini', model: 'google/imagen-3' },
          { keyword: 'imagen', model: 'google/imagen-3' },
          { keyword: 'flux pro', model: 'black-forest-labs/flux-pro' },
          { keyword: 'flux', model: 'black-forest-labs/flux-schnell' },
          { keyword: 'stable diffusion', model: 'stability-ai/stable-diffusion-3' }
        ];
        
        for (const pattern of modelPatterns) {
          if (content.toLowerCase().includes(pattern.keyword)) {
            model = pattern.model;
            prompt = prompt.replace(new RegExp(pattern.keyword, 'gi'), '').trim();
            break;
          }
        }
        
        // Remove trigger keywords from prompt
        imageKeywords.forEach(keyword => {
          prompt = prompt.replace(new RegExp(keyword, 'gi'), '').trim();
        });
        
        if (prompt.length < 3) {
          showToast.warning('Lütfen daha detaylı bir görsel açıklaması yazın.', {
            duration: 3000,
          });
          setInputMessage(content);
          return;
        }
        
        showToast.info(`🎨 ${model} ile görsel oluşturuluyor...`, {
          duration: 2000,
        });
        
        await generateImage(prompt, model);
      } else {
        // Normal message
        await sendMessage(content, false, filesToSend);
      }
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



  // Fetch chats when authenticated (skip for guest users)
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

  // Guest users are welcome! No auth required for chat

  // Check if chat is empty (no messages and not processing)
  const isChatEmpty = (!currentChat?.messages || currentChat.messages.length === 0) && !isAIThinking && !isAIResponding;

  return (
    <TooltipProvider>
      <SidebarProvider>
        {/* Only show sidebar for authenticated users */}
        {isAuthenticated && (
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
        )}

        <SidebarInset>
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden relative">
            {/* ChatGPT-style Fixed Top Left - Only show when chat has messages */}
            {!isChatEmpty && (
              <div className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-3 transition-all duration-300 ${
                isAuthenticated ? (sidebarState === 'expanded' ? 'md:left-64' : 'md:left-16') : ''
              }`}>
                {/* Mobile Sidebar Trigger - only show on mobile for authenticated users */}
                {isAuthenticated && (
                  <SidebarTrigger className="md:hidden bg-background/80 backdrop-blur-sm border border-border rounded-md p-2 shadow-sm hover:bg-accent mr-3" />
                )}
                
                {/* Title */}
                <div className="flex-1 flex justify-start">
                  <h1 className="text-xl font-semibold text-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                    Norvis AI
                  </h1>
                </div>
                
                {/* Login button for guest users */}
                {!isAuthenticated && (
                  <Button
                    onClick={() => router.push(ROUTES.LOGIN)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Giriş Yap
                  </Button>
                )}
              </div>
            )}

            {/* Messages Area - Different layout for empty vs active chat */}
            {isChatEmpty ? (
              /* Empty Chat - Centered Layout */
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                {/* Logo and Title - Büyük ve Beyaz */}
                <div className="flex items-center  mb-5">
                  <img
                    src="/norvis_logo.png"
                    alt="Norvis AI"
                    className="h-16 w-16 object-contain brightness-0 invert"
                  />
                  <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'white' }}>
                    NorvisAI
                  </h1>
                </div>
                
                {/* Input centered in empty state - ORTADA */}
                <div className="w-full max-w-3xl px-4 mb-4">
                  {/* Main Input Container - Dynamic Height */}
                  <div className="border border-gray-600 px-2 shadow-lg p-1 mb-2" style={{
                    backgroundColor: '#242628', 
                    borderRadius: '28px',
                    minHeight: '60px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '15px !important'
                  }}>
                    <div className="flex flex-col">
                      {/* File Previews - Top Section */}
                      {uploadedFiles.length > 0 && (
                        <div className="px-1 pb-2 pt-1">
                          <AdvancedFilePreview
                            fileItems={uploadedFiles}
                            onRemove={removeFile}
                            maxFiles={3}
                            compact={true}
                            showDetails={false}
                          />
                        </div>
                      )}
                      
                      {/* Input Row - Always at bottom */}
                      <div className="flex items-end justify-between gap-2" style={{ minHeight: '48px' }}>
                        {/* Left Side - File Upload */}
                        <div className="flex items-center justify-center pb-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white p-0 flex items-center justify-center flex-shrink-0"
                                disabled={uploadedFiles.length >= 3}
                                onClick={() => {
                                  if (uploadedFiles.length >= 3) {
                                    showToast.warning('Maksimum 3 dosya yükleyebilirsiniz! Pro plana geçerek daha fazla dosya yükleyebilirsiniz.', {
                                      duration: 5000,
                                    });
                                    return;
                                  }
                                  // Use different file input based on state
                                  const fileInput = document.getElementById(isChatEmpty ? 'file-upload-input' : 'file-upload-input-bottom');
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
                        </div>
                        
                        {/* Center - Input Area */}
                        <div className="flex-1 flex items-end pb-2">
                          <textarea
                            value={inputMessage}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 2000) {
                                setInputMessage(value);
                                // Auto-resize textarea
                                const textarea = e.target as HTMLTextAreaElement;
                                textarea.style.height = 'auto';
                                const scrollHeight = Math.min(textarea.scrollHeight, 312); // 12 lines * 26px
                                textarea.style.height = scrollHeight + 'px';
                              } else {
                                console.error('❌ Maksimum 2000 karakter girebilirsiniz!');
                                alert('⚠️ Maksimum 2000 karakter girebilirsiniz!');
                              }
                            }}
                            placeholder="Norvis nasıl yardımcı olabilir?"
                            className="w-full min-h-[26px] max-h-[312px] resize-none border-0 bg-transparent text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-0 text-base py-0 overflow-y-auto"
                            maxLength={2000}
                            rows={1}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            style={{
                              // minHeight: '20px',
                               // height: '23px',
                              lineHeight: '18px',
                              outline: 'none',
                              border: 'none'
                            }}
                          />
                        </div>
                        
                        {/* Right Side - Dynamic Button (Voice/Send/Stop) */}
                        <div className="flex items-center justify-center pb-1">
                        {(isAIThinking || isAIResponding || isTypingEffect) ? (
                          // Stop Button - Only show when AI is actively processing
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => {
                                  console.log('🛑 User clicked stop button');
                                  useChatStore.getState().stopStreaming();
                                }}
                                size="sm"
                                className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white p-0 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                              >
                                <Square className="h-3 w-3 fill-current" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mesajı durdur</TooltipContent>
                          </Tooltip>
                        ) : inputMessage.trim() || uploadedFiles.length > 0 ? (
                          // Send Button - when there's content
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleSendClick}
                                size="sm"
                                className="h-10 w-10 rounded-full hover:bg-gray-600 text-black hover:text-white p-0 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Send message</TooltipContent>
                          </Tooltip>
                        ) : (
                          // Voice Button - when empty
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center flex-shrink-0" style={{ marginLeft: '6px' }}>
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
                  </div>
                  
                  {/* Hidden file input - FOR CENTERED STATE */}
                  <input
                    type="file"
                    id="file-upload-input"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.html,.css,.js,.ts,.json,.xml,.yaml,.yml,.md,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.sql,.zip,.rar,.7z,.mp3,.wav,.mp4,.avi,.mov,.webm,.svg,.psd,.ai"
                    onChange={handleFileInputChange}
                  />
                </div>
                
                {/* Suggestion Buttons - 3 adet - EN ALTTA */}
                <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
                  <Button
                    variant="outline"
                    onClick={() => handleSendMessage('Kodlama konusunda yardım')}
                    className="px-4 py-5 rounded-2xl bg-transparent backdrop-blur-sm border border-gray-700 hover:bg-gray-800/50 text-white text-sm font-medium transition-all"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Kod yardımı
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSendMessage('Yaratıcı bir hikaye yaz')}
                    className="px-4 py-5 rounded-2xl bg-transparent backdrop-blur-sm border border-gray-700 hover:bg-gray-800/50 text-white text-sm font-medium transition-all"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Hikaye yaz
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSendMessage('Bir şey öğrenmeme yardım et')}
                    className="px-4 py-5 rounded-2xl bg-transparent backdrop-blur-sm border border-gray-700 hover:bg-gray-800/50 text-white text-sm font-medium transition-all"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Öğren
                  </Button>
                </div>
              </div>
            ) : (
              /* Active Chat - Normal Scrollable Layout */
              <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-hidden">
                <div className={`outside-1 p-6 pt-16 space-y-6 mx-auto min-h-full transition-all duration-300 ${
                  sidebarState === 'collapsed' ? 'max-w-4xl' : 'max-w-3xl'
                }`}>
                  {currentChat?.messages.map((message) => (
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
                  
                  {/* Invisible div at the end for auto-scrolling */}
                  <div ref={messagesEndRef} className="h-1" />
                </div>
              </ScrollArea>
            )}

        {/* Message Input - Only show at bottom when chat is active */}
        {!isChatEmpty && (
        <div className={`fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md px-6 py-4 z-50 transition-all duration-300 ${
          sidebarState === 'expanded' ? 'md:left-64' : 'md:left-16'
        }`}>
          <div className={`mx-auto transition-all duration-300 ${
            sidebarState === 'collapsed' ? 'max-w-4xl' : 'max-w-3xl'
          }`}>
            {/* Main Input Container - Dynamic Height */}
            <div className="border border-gray-600 px-2 shadow-lg p-1 mb-2" style={{
              backgroundColor: '#242628', 
              borderRadius: '28px',
              minHeight: '60x', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '15px !important'
            }}>
              <div className="flex flex-col">
                {/* File Previews - Top Section */}
                {uploadedFiles.length > 0 && (
                  <div className="px-1 pb-2 pt-1">
                    <AdvancedFilePreview
                      fileItems={uploadedFiles}
                      onRemove={removeFile}
                      maxFiles={3}
                      compact={true}
                      showDetails={false}
                    />
                  </div>
                )}
                
                {/* Input Row - Always at bottom */}
                <div className="flex items-end justify-between gap-2" style={{ minHeight: '48px' }}>
                  {/* Left Side - File Upload */}
                  <div className="flex items-center justify-center pb-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white p-0 flex items-center justify-center flex-shrink-0"
                          disabled={uploadedFiles.length >= 3}
                          onClick={() => {
                            if (uploadedFiles.length >= 3) {
                              showToast.warning('Maksimum 3 dosya yükleyebilirsiniz! Pro plana geçerek daha fazla dosya yükleyebilirsiniz.', {
                                duration: 5000,
                              });
                            return;
                          }
                          // Use different file input based on state
                          const fileInput = document.getElementById(isChatEmpty ? 'file-upload-input' : 'file-upload-input-bottom');
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
                  </div>
                  
                  {/* Center - Input Area */}
                  <div className="flex-1 flex items-end pb-2">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 2000) {
                          setInputMessage(value);
                          // Auto-resize textarea
                          const textarea = e.target as HTMLTextAreaElement;
                          textarea.style.height = 'auto';
                          const scrollHeight = Math.min(textarea.scrollHeight, 312); // 12 lines * 26px
                          textarea.style.height = scrollHeight + 'px';
                        } else {
                          console.error('❌ Maksimum 2000 karakter girebilirsiniz!');
                          alert('⚠️ Maksimum 2000 karakter girebilirsiniz!');
                        }
                      }}
                      placeholder="Norvis nasıl yardımcı olabilir?"
                      className="w-full min-h-[26px] max-h-[312px] resize-none border-0 bg-transparent text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-0 text-base py-0 overflow-y-auto"
                      maxLength={2000}
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      style={{
                        // minHeight: '20px',
                         // height: '23px',
                        lineHeight: '18px',
                        outline: 'none',
                        border: 'none'
                      }}
                    />
                  </div>
                  
                  {/* Right Side - Dynamic Button (Voice/Send/Stop) */}
                  <div className="flex items-center justify-center pb-1">
                  {(isAIThinking || isAIResponding || isTypingEffect) ? (
                    // Stop Button - Only show when AI is actively processing
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            console.log('🛑 User clicked stop button');
                            useChatStore.getState().stopStreaming();
                          }}
                          size="sm"
                          className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white p-0 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        >
                          <Square className="h-3 w-3 fill-current" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mesajı durdur</TooltipContent>
                    </Tooltip>
                  ) : inputMessage.trim() || uploadedFiles.length > 0 ? (
                    // Send Button - when there's content
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSendClick}
                          size="sm"
                          className="h-10 w-10 rounded-full hover:bg-gray-600 text-black hover:text-white p-0 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send message</TooltipContent>
                    </Tooltip>
                  ) : (
                    // Voice Button - when empty
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center flex-shrink-0" style={{ marginLeft: '6px' }}>
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
            </div>
            
            {/* Guest Message Counter */}
            {!isAuthenticated && (
              <div className="mt-2 text-center">
                <p className="text-sm text-muted-foreground">
                  {canSendGuestMessage() ? (
                    <span>
                      Misafir kullanıcı - Kalan mesaj: <span className="font-semibold text-primary">{getRemainingMessages()}/3</span>
                      {' '}•{' '}
                      <button 
                        onClick={() => router.push(ROUTES.LOGIN)}
                        className="text-primary hover:underline"
                      >
                        Sınırsız mesaj için giriş yapın
                      </button>
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">
                      ⚠️ Mesaj limitiniz doldu! 
                      {' '}
                      <button 
                        onClick={() => router.push(ROUTES.LOGIN)}
                        className="text-primary hover:underline font-semibold"
                      >
                        Giriş yapın
                      </button>
                      {' '}
veya
                      {' '}
                      <button 
                        onClick={() => router.push('/auth/register')}
                        className="text-primary hover:underline font-semibold"
                      >
                        Kayıt olun
                      </button>
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {/* Hidden file input - FOR BOTTOM STATE */}
            <input
              type="file"
              id="file-upload-input-bottom"
              className="hidden"
              multiple
              accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.html,.css,.js,.ts,.json,.xml,.yaml,.yml,.md,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.sql,.zip,.rar,.7z,.mp3,.wav,.mp4,.avi,.mov,.webm,.svg,.psd,.ai"
              onChange={handleFileInputChange}
            />
          </div>
        </div>
        )}
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