'use client';

import React, { useEffect, useState } from 'react';
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
  ChevronDown,
  ArrowUp
} from 'lucide-react';




const ChatPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuthStore();
  const {
    chats,
    currentChat,
    currentChatId,
    fetchChats,
    createNewChat,
    sendMessage,
    setCurrentChatId
  } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (inputMessage.trim() && currentChatId) {
      try {
        await sendMessage(inputMessage);
        setInputMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleNewChat = async () => {
    try {
      await createNewChat();
    } catch (error) {
      console.error('Failed to create new chat:', error);
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
        />


        <SidebarInset>
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-background min-h-0 h-screen">
            {/* Chat Header */}
            <div className="bg-background/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="bg-background border border-border rounded-md p-2 shadow-sm hover:bg-accent" />
                <div className="flex items-center space-x-2">
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      <Share className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share conversation</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      New conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Clear conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-6 max-w-4xl mx-auto">
                {currentChat?.messages && currentChat.messages.length > 0 ? (
                  currentChat.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex space-x-3 max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={`${message.role === 'user'
                            ? 'bg-blue-600 text-white font-bold text-sm'
                            : 'bg-green-600 text-white font-bold text-xs'
                            }`}>
                            {message.role === 'user' ? 'M' : 'AI'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`group relative rounded-3xl px-5 py-4 ${message.role === 'user'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-800 dark:bg-gray-800 text-white shadow-lg'
                          }`}>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </div>
                          {message.model && (
                            <div className="text-xs opacity-70 mt-2">
                              {message.model}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
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

                    {/* Suggestion Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <div className="p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all cursor-pointer group">
                        <div className="text-lg mb-2">📝</div>
                        <h4 className="font-medium text-sm mb-1">Help me write</h4>
                        <p className="text-xs text-muted-foreground">Get assistance with writing tasks</p>
                      </div>
                      <div className="p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all cursor-pointer group">
                        <div className="text-lg mb-2">💡</div>
                        <h4 className="font-medium text-sm mb-1">Give me ideas</h4>
                        <p className="text-xs text-muted-foreground">Brainstorm creative solutions</p>
                      </div>
                      <div className="p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all cursor-pointer group">
                        <div className="text-lg mb-2">📊</div>
                        <h4 className="font-medium text-sm mb-1">Analyze data</h4>
                        <p className="text-xs text-muted-foreground">Help with data interpretation</p>
                      </div>
                      <div className="p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all cursor-pointer group">
                        <div className="text-lg mb-2">✨</div>
                        <h4 className="font-medium text-sm mb-1">Surprise me</h4>
                        <p className="text-xs text-muted-foreground">Random interesting topic</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input - Compact Claude Style */}
            <div className="px-6 pb-6">
              <div className="max-w-4xl mx-auto">
                {/* Outer Container - Compact */}
                <div
                  className="rounded-2xl p-2 space-y-3"
                  style={{ backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)' }}
                >
                  {/* Upgrade Prompt - Top Left */}
                  <div className="flex items-start">
                    <div className="text-xs text-muted-foreground flex items-center gap-2 ml-1 mt-0.5">
                      <span>Use our faster AI on Pro Plan</span>
                      <span className="text-muted-foreground">•</span>
                      <button className="text-foreground hover:underline font-medium">Upgrade</button>
                    </div>
                  </div>

                  {/* Main Input Container */}
                  <div className="rounded-xl border border-border/40 p-3" style={{ backgroundColor: 'oklch(0.141 0.004 285.83)' }}>
                    {/* Textarea - Compact */}
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything..."
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
                      <div className="flex items-center gap-2">
                        {/* Attachment Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                            >
                              <Paperclip className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Attach files</TooltipContent>
                        </Tooltip>

                        {/* Model Selector */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 px-3 rounded-full bg-muted/40 hover:bg-muted/60 text-xs font-medium text-foreground border border-border/30"
                            >
                              <span>Claude 3.5 sonnet</span>
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuItem>
                              <div className="flex flex-col">
                                <span className="font-medium">Claude 3.5 Sonnet</span>
                                <span className="text-xs text-muted-foreground">Most capable model</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <div className="flex flex-col">
                                <span className="font-medium">GPT-4 Turbo</span>
                                <span className="text-xs text-muted-foreground">OpenAI's latest</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <div className="flex flex-col">
                                <span className="font-medium">GPT-3.5 Turbo</span>
                                <span className="text-xs text-muted-foreground">Fast and efficient</span>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Voice Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                            >
                              <Mic className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Voice message</TooltipContent>
                        </Tooltip>

                        {/* Send Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleSendMessage}
                              size="sm"
                              disabled={!inputMessage.trim()}
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default ChatPage;