'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Plus, 
  Settings, 
  LogOut,
  User,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Archive
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Chat {
  id: string;
  title: string;
  model: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface AppSidebarProps {
  chats?: Chat[];
  currentChatId?: string | null;
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
  onSearchOpen?: () => void;
  onChatRename?: (chatId: string, newTitle: string) => void;
  onChatDelete?: (chatId: string) => void;
  onChatArchive?: (chatId: string) => void;
  onSidebarStateChange?: (state: 'expanded' | 'collapsed') => void;
}

export function AppSidebar({ 
  chats = [], 
  currentChatId, 
  onChatSelect, 
  onNewChat,
  onSearchOpen,
  onChatRename,
  onChatDelete,
  onChatArchive,
  onSidebarStateChange
}: AppSidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { state } = useSidebar();
  const [editingChatId, setEditingChatId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  const handleChatClick = (chatId: string) => {
    if (onChatSelect) {
      onChatSelect(chatId);
    }
  };

  const startEditing = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const saveEdit = () => {
    if (editingChatId && editTitle.trim() && onChatRename) {
      onChatRename(editingChatId, editTitle.trim());
    }
    cancelEditing();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const recentChats = chats.slice(0, 4);
  const olderChats = chats.slice(4);

  // Notify parent about sidebar state changes
  React.useEffect(() => {
    if (onSidebarStateChange) {
      onSidebarStateChange(state);
    }
  }, [state, onSidebarStateChange]);

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon">
      <div className="flex justify-between items-center">
        <Link href="/chat" className={`no-draggable hover:bg-sidebar-accent keyboard-focused:bg-sidebar-accent touch:h-12 touch:w-12 flex h-14 w-14 items-center justify-center rounded-lg focus:outline-none disabled:opacity-50 transition-colors ${state === 'collapsed' ? 'group-data-[collapsible=icon]:hidden' : ''}`}>
          <img 
            src="/norvis_logo.png" 
            alt="Norvis AI" 
            className="h-17 w-17 object-contain brightness-0 invert"
          />
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="bg-transparent hover:bg-sidebar-accent border-0 p-2 rounded-md transition-colors mr-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:mt-2" />
          </TooltipTrigger>
          <TooltipContent>
            {state === 'expanded' ? 'Kenar çubuğunu kapat' : 'Kenar çubuğunu aç'}
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="px-1 pb-3 space-y-0.5">
        <Button 
          className="w-full justify-start text-left px-2 py-2 h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0" 
          variant="ghost" 
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-1" />
          <span className="group-data-[collapsible=icon]:hidden font-medium">Yeni sohbet</span>
        </Button>
        
        <Button 
          className="w-full justify-start text-left px-2 py-2 h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0" 
          variant="ghost" 
          onClick={onSearchOpen}
        >
          <Search className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-1" />
          <span className="group-data-[collapsible=icon]:hidden font-medium">Sohbetleri ara</span>
        </Button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 group-data-[collapsible=icon]:hidden">
            Sohbetler
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.length === 0 ? (
                <div className="px-2 py-4 text-center group-data-[collapsible=icon]:hidden">
                  <p className="text-xs text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <div className="flex items-center w-full group/item hover:bg-sidebar-accent rounded-md transition-colors">
                      {editingChatId === chat.id ? (
                        <div className="flex-1 px-2 py-1">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onBlur={saveEdit}
                            className="h-8 text-sm border-sidebar-border bg-sidebar focus-visible:ring-1"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <SidebarMenuButton 
                          className={`flex-1 justify-start border-0 shadow-none hover:bg-transparent px-2 ${
                            currentChatId === chat.id ? 'bg-sidebar-accent' : ''
                          }`}
                          onClick={() => handleChatClick(chat.id)}
                        >
                          <span className="truncate group-data-[collapsible=icon]:hidden">{chat.title}</span>
                        </SidebarMenuButton>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 mr-2 opacity-0 group-hover/item:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => startEditing(chat)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Yeniden adlandır
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onChatArchive && onChatArchive(chat.id)}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Arşivle
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onChatDelete && onChatDelete(chat.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-sidebar-accent/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'N'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'norvis'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@norvis.ai'}
            </p>
          </div>
          <div className="flex items-center space-x-1 group-data-[collapsible=icon]:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 w-8 p-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}