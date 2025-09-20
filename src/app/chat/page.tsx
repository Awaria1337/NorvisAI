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
  Search
} from 'lucide-react';
import MessageBubble from '@/components/ui/message-bubble';
import AILoadingStates from '@/components/ui/ai-loading-states';
import SearchModal from '@/components/ui/search-modal';
// import { ApiKeyModal } from '@/components/api-key-modal';




const ChatPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuthStore();
  const {
    chats,
    getCurrentChat,
    currentChatId,
    fetchChats,
    createNewChat,
    sendMessage,
    setCurrentChatId
  } = useChatStore();
  
  // Memoize currentChat to ensure proper re-rendering when chats or currentChatId changes
  const currentChat = useMemo(() => getCurrentChat(), [chats, currentChatId, getCurrentChat]);
  const [inputMessage, setInputMessage] = useState('');
  // const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [availableModels, setAvailableModels] = useState<Array<{id: string, name: string, provider: string}>>([]);
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape to close search
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage.trim();
    if (!content) return;

    // Don't send if AI is already processing
    if (isAIThinking || isAIResponding) {
      console.log('AI is busy, please wait...');
      return;
    }

    // Clear input immediately for better UX
    setInputMessage('');
    
    try {
      console.log('🚀 Starting message send process...');
      await sendMessage(content, false, selectedModel);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // If message fails, restore the input content
      setInputMessage(content);
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
      const newChat = await createNewChat('New Chat', selectedModel || 'gemini-1.5-flash');
      // Clear input when creating new chat
      setInputMessage('');
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const handleChatSelectFromSearch = (chatId: string) => {
    setCurrentChatId(chatId);
    setIsSearchOpen(false);
  };

  const fetchAvailableModels = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/models', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAvailableModels(result.data || []);
        // setHasApiKeys((result.data || []).length > 0);
        
        // Set DeepSeek Chat v3.1 as default model if available
        if (result.data && result.data.length > 0) {
          const deepSeekModel = result.data.find((model: any) => model.id === 'deepseek/deepseek-chat-v3.1:free');
          if (deepSeekModel) {
            setSelectedModel(deepSeekModel.id);
          } else {
            setSelectedModel(result.data[0].id);
          }
        } else {
          // No API keys available, show modal after a short delay
          // setTimeout(() => {
          //   setShowApiKeyModal(true);
          // }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      // setHasApiKeys(false);
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
      fetchAvailableModels();
    }
  }, [isAuthenticated, fetchChats]);

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
          onChatSelect={setCurrentChatId}
          onNewChat={handleNewChat}
          onSearchOpen={handleSearchOpen}
        />


        <SidebarInset>
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden relative">
            {/* ChatGPT-style Fixed Top Left */}
            <div className="fixed top-0 left-0 md:left-64 z-30 flex items-center space-x-3 p-4">
              <SidebarTrigger className="bg-background/80 backdrop-blur-sm border border-border rounded-md p-2 shadow-sm hover:bg-accent" />
              <h1 className="text-xl font-semibold text-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg">Norvis AI</h1>
            </div>

            {/* Messages Area - ChatGPT style, starts from top */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-hidden">
              <div className="p-6 pt-16 space-y-6 max-w-4xl mx-auto min-h-full pb-48">
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
                    <div className="text-center py-20">
                      <div className="h-20 w-20 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        Welcome to Norvis AI
                      </h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Start a conversation with our AI assistant. Ask anything, get creative, or explore new ideas.
                      </p>
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
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-background backdrop-blur-sm px-6 py-4 z-50">
              <div className="max-w-4xl mx-auto">
                {/* Outer Container - Compact */}
                <div
                  className="rounded-2xl p-1 space-y-3"
                  style={{ backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)' }}
                >
                  {/* Upgrade Pro Text */}
                  <div className="text-xs font-medium mr-4" style={{ color: '#fff' }}>
                    Upgrade Pro
                  </div>

                  {/* Main Input Container */}
                  <div className="rounded-xl border border-border/40 p-3" style={{ backgroundColor: 'oklch(0.141 0.004 285.83)' }}>
                    {/* Textarea - Compact */}
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Norvis AI'ya bir şey sorun..."
                      className="w-full min-h-[40px] max-h-32 resize-none border-0 px-0 py-1 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed mb-3"
                      style={{ backgroundColor: 'oklch(14.1% .004 285.83)' }}
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
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
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Attach file</TooltipContent>
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
                            disabled={!inputMessage.trim() || isAIThinking || isAIResponding}
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