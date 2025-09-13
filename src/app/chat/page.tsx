'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Send, 
  Share, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  RotateCcw,
  Paperclip,
  MoreHorizontal,
  Mic,
  Square
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Create Html Game Environment...',
      messages: [],
      timestamp: new Date()
    },
    {
      id: '2', 
      title: 'Apply To Leave For Emergency',
      messages: [],
      timestamp: new Date()
    },
    {
      id: '3',
      title: 'What Is UI UX Design?',
      messages: [],
      timestamp: new Date()
    },
    {
      id: '4',
      title: 'Create POS System',
      messages: [],
      timestamp: new Date()
    },
    {
      id: '5',
      title: 'What Is UX Audit?',
      messages: [],
      timestamp: new Date()
    },
    {
      id: '6',
      title: 'Create Chatbot GPT...',
      messages: [{
        id: '1',
        content: 'Create a chatbot gpt using python language what will be step for that',
        isUser: true,
        timestamp: new Date()
      }, {
        id: '2',
        content: `Sure, I can help you get started with creating a chatbot using GPT in Python. Here are the basic steps you'll need to follow:

1. Install the required libraries: You'll need to install the transformers library from Hugging Face to use GPT. You can install it using pip.

2. Load the pre-trained model: GPT comes in several sizes and versions, so you'll need to choose the one that fits your needs. You can load a pre-trained GPT model. This loads the 1.3B parameter version of GPT-Neo, which is a powerful and relatively recent model.

3. Create a chatbot loop: You'll need to create a loop that takes user input, generates a response using the GPT model, and outputs it to the user. Here's an example loop that uses the input() function to get user input and the gpt() function to generate a response. This loop will keep running until the user exits the program or the loop is interrupted.

4. Add some personality to the chatbot: While GPT can generate text, it doesn't have any inherent personality or style. You can make your chatbot more interesting by adding custom prompts or responses that reflect your desired personality. You can then modify the chatbot loop to use these prompts and responses when appropriate. This will make the chatbot seem more human-like and engaging.

These are just the basic steps to get started with a GPT chatbot in Python. Depending on your requirements, you may need to add more features or complexity to the chatbot. Good luck!`,
        isUser: false,
        timestamp: new Date()
      }],
      timestamp: new Date()
    },
    {
      id: '7',
      title: 'How Chat GPT Work?',
      messages: [],
      timestamp: new Date()
    }
  ]);
  const [currentChatId, setCurrentChatId] = useState<string>('6');
  const [inputMessage, setInputMessage] = useState('');
  const [showRecentChats, setShowRecentChats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const recentChats = chats.filter(chat => chat.id !== currentChatId).slice(0, 6);

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
      <div className="h-screen flex bg-background overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-sidebar flex flex-col border-r border-sidebar-border">
            {/* Logo and Title */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-sidebar-foreground tracking-wide">
                CHAT A.I+
              </h1>
            </div>

            {/* New Chat Button */}
            <div className="px-6 mb-6">
              <Button 
                className="w-full justify-center" 
                variant="outline"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New chat
              </Button>
            </div>

            {/* Your conversations */}
            <div className="px-6 mb-4">
              <p className="text-muted-foreground text-sm font-medium mb-3">Your conversations</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowRecentChats(!showRecentChats)}
                className="text-muted-foreground hover:text-foreground p-0 h-auto"
              >
                Clear All
              </Button>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-2">
                {chats.map((chat) => (
                  <Button
                    key={chat.id}
                    variant={currentChatId === chat.id ? "secondary" : "ghost"}
                    className={`w-full justify-start p-3 h-auto ${
                      currentChatId === chat.id 
                        ? 'bg-sidebar-accent border border-sidebar-border' 
                        : 'hover:bg-sidebar-accent'
                    }`}
                    onClick={() => setCurrentChatId(chat.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium truncate flex-1 text-left">
                      {chat.title}
                    </span>
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* Recent Section */}
            {showRecentChats && (
              <div className="px-6 py-4">
                <Separator className="mb-4" />
                <p className="text-muted-foreground text-xs mb-3">Last 7 Days</p>
                <div className="space-y-1">
                  {recentChats.slice(0, 4).map((chat) => (
                    <Button
                      key={`recent-${chat.id}`}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start p-2 h-auto text-xs"
                    >
                      <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate text-left">
                        {chat.title.length > 25 ? chat.title.substring(0, 25) + '...' : chat.title}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Settings and Profile */}
            <div className="p-6 border-t border-sidebar-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                  <ThemeToggle />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sidebar-foreground text-sm font-medium">
                    {user?.name || 'Andrew Nelson'}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background min-h-0">
          {/* Chat Header */}
          <div className="bg-background/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold">
                  AI
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Norvis AI Assistant
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Online</span>
                  <Badge variant="secondary" className="text-xs ml-2">
                    GPT-4 Turbo
                  </Badge>
                </div>
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
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex space-x-3 max-w-3xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className={`${message.isUser 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                          : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                        } font-semibold`}>
                          {message.isUser ? (user?.name?.charAt(0).toUpperCase() || 'U') : 'AI'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`group relative rounded-2xl px-4 py-3 max-w-full ${
                        message.isUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-card border border-border shadow-sm hover:shadow-md transition-shadow'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                          {message.content}
                        </div>
                        {/* Message Actions */}
                        <div className={`absolute -bottom-8 ${message.isUser ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1`}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                          {!message.isUser && (
                            <>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
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

          {/* Follow-up Actions */}
          {currentChat?.messages && currentChat.messages.length > 0 && (
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center space-x-2 max-w-4xl mx-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Good response</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Bad response</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Copy</p></TooltipContent>
                </Tooltip>
                <div className="flex-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Regenerate response</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Message Input - Beautiful Prompt Area */}
          <div className="bg-background px-6 pb-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Main Input Container */}
                <div className="relative bg-card border border-border rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                  <div className="flex items-end p-4">
                    {/* Add Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 mr-3 p-2.5 rounded-xl hover:bg-muted"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Add content</p></TooltipContent>
                    </Tooltip>

                    {/* Text Input */}
                    <div className="flex-1 min-h-[50px] flex items-center">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Herhangi bir şey sor"
                        className="border-0 bg-transparent resize-none text-base placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[50px] py-3"
                        rows={1}
                        style={{ 
                          minHeight: '50px',
                          maxHeight: '200px',
                          overflow: 'hidden'
                        }}
                        onInput={(e) => {
                          e.currentTarget.style.height = 'auto';
                          e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-3">
                      {inputMessage.trim() ? (
                        <>
                          {/* Send Button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => {
                                  // Handle send message
                                  console.log('Sending:', inputMessage);
                                  setInputMessage('');
                                }}
                                size="sm"
                                className="rounded-xl px-4 py-2.5 bg-primary hover:bg-primary/90"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Send message</p></TooltipContent>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          {/* Microphone Button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl p-2.5 hover:bg-muted"
                              >
                                <Mic className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Voice input</p></TooltipContent>
                          </Tooltip>

                          {/* Stop Button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl p-2.5 hover:bg-muted"
                              >
                                <Square className="h-4 w-4 fill-current" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Stop</p></TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatPage;