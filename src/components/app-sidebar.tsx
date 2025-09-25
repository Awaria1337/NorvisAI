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
  PenSquare, 
  Settings, 
  LogOut,
  User,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Crown,
  Mail,
  HelpCircle,
  Sun,
  Moon,
  Monitor,
  Info,
  Shield,
  Bug,
  Keyboard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import ModernSettingsModal from '@/components/ui/modern-settings-modal';
import BugReportModal from '@/components/ui/bug-report-modal';
import KeyboardShortcutsModal from '@/components/ui/keyboard-shortcuts-modal';

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
  const { theme, setTheme } = useTheme();
  const [editingChatId, setEditingChatId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showBugReport, setShowBugReport] = React.useState(false);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

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
    <>
      <TooltipProvider>
        <Sidebar collapsible="icon">
      <div className="flex justify-between items-center my-4">
        <Link href="/chat" className={`no-draggable hover:bg-sidebar-accent keyboard-focused:bg-sidebar-accent touch:h-12 touch:w-12 flex h-8 w-8 items-center justify-center rounded-lg focus:outline-none disabled:opacity-50 ml-2 transition-colors ${state === 'collapsed' ? 'group-data-[collapsible=icon]:hidden' : ''}`}>
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
          <PenSquare className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-1" />
          <span className="group-data-[collapsible=icon]:hidden font-medium font-ui">Yeni sohbet</span>
        </Button>
        
        <Button 
          className="w-full justify-start text-left px-2 py-2 h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0" 
          variant="ghost" 
          onClick={onSearchOpen}
        >
          <Search className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-1" />
          <span className="group-data-[collapsible=icon]:hidden font-medium font-ui">Sohbetleri ara</span>
        </Button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 group-data-[collapsible=icon]:hidden font-heading">
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
                        <div className={`flex items-center w-full hover:bg-sidebar-accent rounded-md transition-colors px-2 py-1 ${
                          currentChatId === chat.id ? 'bg-sidebar-accent' : ''
                        }`}>
                          <div 
                            className="flex-1 cursor-pointer py-1 truncate"
                            onClick={() => handleChatClick(chat.id)}
                          >
                            <span className="truncate group-data-[collapsible=icon]:hidden text-sm">{chat.title}</span>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
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
                      )}
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full h-12 p-2 rounded-lg hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0"
            >
              <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
                <div className="flex items-center space-x-3 min-w-0 group-data-[collapsible=icon]:space-x-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'N'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.name || 'Kullanıcı'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ücretsiz
                    </p>
                  </div>
                </div>
                <div className="flex items-center group-data-[collapsible=icon]:hidden">
                  <Link href={ROUTES.PRICING}>
                    <div className="flex items-center px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-md text-xs font-medium hover:from-amber-600 hover:to-orange-600 transition-colors cursor-pointer">
                      <Crown className="h-3 w-3 mr-1" />
                      Yükselt
                    </div>
                  </Link>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top"
            className="w-64 mb-2"
            sideOffset={8}
          >
            {/* User Info Header */}
            <div className="px-3 py-3 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'N'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.name || 'Kullanıcı'}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 mr-1" />
                    <span className="truncate">{user?.email || 'user@norvis.ai'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upgrade Plan */}
            <div className="p-2">
              <Link href={ROUTES.PRICING}>
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm"
                  size="sm"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Planı yükselt
                </Button>
              </Link>
            </div>
            
            {/* Menu Items */}
            <div className="p-1">
              {/* Theme Selection */}
              <div className="px-2 py-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Tema</p>
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={theme === 'light' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 text-xs p-1"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 text-xs p-1"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 text-xs p-1"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="border-t my-2"></div>
              
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="mr-3 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem>
              
              <DropdownMenuSub>
<DropdownMenuSubTrigger className="cursor-pointer" hideChevron>
                  <HelpCircle className="mr-3 h-4 w-4" />
                  Yardım
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent align="start" side="right" sideOffset={8} className="w-64">
                  <DropdownMenuItem className="cursor-pointer py-3" onClick={() => { /* TODO: link to help center */ }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                        <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Yardım merkezi</p>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer py-3" onClick={() => { /* TODO: release notes link */ }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
                        <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sürüm notları</p>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer py-3" onClick={() => { /* TODO: terms link */ }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                        <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Şartlar ve politikalar</p>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer py-3" onClick={() => setShowBugReport(true)}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
                        <Bug className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Hata bildir</p>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer py-3" onClick={() => setShowShortcuts(true)}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                        <Keyboard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Klavye kısayolları</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </div>
            
            {/* Logout */}
            <div className="p-1 border-t mt-1">
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Oturumu kapat
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
      
    {/* Settings Modal */}
    <ModernSettingsModal 
      isOpen={showSettingsModal}
      onClose={() => setShowSettingsModal(false)}
      user={user || undefined}
    />

    {/* Help related modals */}
    <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />
    <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
}
