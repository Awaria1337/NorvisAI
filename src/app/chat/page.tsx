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
  MoreHorizontal
} from 'lucide-react';

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
      <div className="h-screen flex bg-background">
        {/* Main Container - Full Screen */}
        <div className="flex w-full">
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
        <div className="flex-1 flex flex-col bg-background">
          {/* Chat Header */}
          <div className="bg-card border-b border-border p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-muted">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {currentChat?.title || 'Create a chatbot gpt using python language what will be step for that'}
                </h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    CHAT A.I+ ⚡
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share conversation</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit title</DropdownMenuItem>
                  <DropdownMenuItem>Delete chat</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6 max-w-4xl mx-auto">
              {currentChat?.messages && currentChat.messages.length > 0 ? (
                currentChat.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex space-x-3 max-w-3xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className={message.isUser ? 'bg-muted' : 'bg-primary text-primary-foreground'}>
                          {message.isUser ? (user?.name?.charAt(0).toUpperCase() || 'U') : 'AI'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-4 py-3 ${message.isUser ? 'bg-muted' : 'bg-card border border-border'}`}>
                        <div className="text-sm whitespace-pre-wrap text-foreground">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Choose an AI model and start chatting. Your conversations are private and secure.
                  </p>
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

          {/* Message Input */}
          <div className="bg-card border-t border-border p-6">
            <div className="flex items-end space-x-3 max-w-4xl mx-auto">
              <div className="flex-1">
                <div className="relative">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="💗 What's in your mind..."
                    className="min-h-[44px] max-h-[120px] pr-12 resize-none"
                    rows={1}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 bottom-2 p-1.5 h-auto"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Attach file</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={!inputMessage.trim()}
                    className="p-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Send message</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default ChatPage;