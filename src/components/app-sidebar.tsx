"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "@/components/ui/sidebar";
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
  MessageCircle,
  FileText,
  FolderOpen,
  Clock,
  Share2,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import ModernSettingsModal from "@/components/ui/modern-settings-modal";
import ReportIssueModal from "@/components/ui/report-issue-modal";

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
  onSidebarStateChange?: (state: "expanded" | "collapsed") => void;
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
  onSidebarStateChange,
}: AppSidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { state } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [editingChatId, setEditingChatId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);

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
    setEditTitle("");
  };

  const saveEdit = () => {
    if (editingChatId && editTitle.trim() && onChatRename) {
      onChatRename(editingChatId, editTitle.trim());
    }
    cancelEditing();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
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
            <Link
              href="/chat"
              className="no-draggable hover:bg-sidebar-accent keyboard-focused:bg-sidebar-accent touch:h-12 touch:w-12 flex h-8 w-8 items-center justify-center rounded-lg focus:outline-none disabled:opacity-50 ml-2 transition-colors group-data-[collapsible=icon]:hidden"
            >
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
                {state === "expanded"
                  ? "Kenar çubuğunu kapat"
                  : "Kenar çubuğunu aç"}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="px-1 pb-3 space-y-0.5">
            <Button
              className="w-full justify-start text-left px-2 py-2 h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0"
              variant="ghost"
              onClick={handleNewChat}
            >
              <PenSquare className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden font-medium">
                Yeni sohbet
              </span>
            </Button>

            <Button
              className="w-full justify-start text-left px-2 py-2 h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0"
              variant="ghost"
              onClick={onSearchOpen}
            >
              <Search className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden font-medium">
                Sohbetleri ara
              </span>
            </Button>
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs text-muted-foreground px-2 group-data-[collapsible=icon]:hidden font-semibold">
                Sohbetler
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chats.length === 0 ? (
                    <div className="px-2 py-4 text-center group-data-[collapsible=icon]:hidden">
                      <p className="text-xs text-muted-foreground">
                        No conversations yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start a new chat to begin
                      </p>
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
                            <div
                              className={`flex items-center w-full hover:bg-sidebar-accent rounded-md transition-colors px-2 py-1 ${
                                currentChatId === chat.id
                                  ? "bg-sidebar-accent"
                                  : ""
                              }`}
                            >
                              <div
                                className="flex-1 cursor-pointer py-1 truncate"
                                onClick={() => handleChatClick(chat.id)}
                              >
                                <span className="truncate group-data-[collapsible=icon]:hidden text-sm font-medium">
                                  {chat.title}
                                </span>
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
                                <DropdownMenuContent
                                  align="start"
                                  side="right"
                                  className="w-48 p-1 rounded-xl border-0 shadow-lg"
                                  sideOffset={8}
                                  alignOffset={0}
                                  style={{
                                    backgroundColor: "#525252",
                                    animationDuration: "0ms",
                                    animationFillMode: "both",
                                  }}
                                >
                                  <div className="p-0 space-y-0.5">
                                    <DropdownMenuItem
                                      onClick={() => startEditing(chat)}
                                      className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                                    >
                                      <Edit className="mr-2 h-3.5 w-3.5 text-white" />
                                      <span className="text-white text-sm">Yeniden adlandır</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        onChatArchive && onChatArchive(chat.id)
                                      }
                                      className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                                    >
                                      <Archive className="mr-2 h-3.5 w-3.5 text-white" />
                                      <span className="text-white text-sm">Arşivle</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        onChatDelete && onChatDelete(chat.id)
                                      }
                                      className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                                    >
                                      <Trash2 className="mr-2 h-3.5 w-3.5 text-white" />
                                      <span className="text-white text-sm">Sil</span>
                                    </DropdownMenuItem>
                                  </div>
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
                          {user?.name?.charAt(0).toUpperCase() || "N"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-semibold text-sidebar-foreground truncate">
                          {user?.name || "Kullanıcı"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ücretsiz
                        </p>
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="top"
                className="w-44 mb-2 p-1 rounded-xl border-0 shadow-lg"
                sideOffset={12}
                alignOffset={85}
                style={{
                  backgroundColor: "#525252",
                  animationDuration: "0ms",
                  animationFillMode: "both",
                  position: "absolute",
                  bottom: "100%",
                  left: "-62px",
                }}
              >
                <div className="p-0 space-y-0.5">
                  <DropdownMenuItem
                    className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                    onClick={() => setShowSettingsModal(true)}
                  >
                    <Settings className="mr-2 h-3.5 w-3.5 text-white" />
                    <span className="text-white text-sm">Ayarlar</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                    onClick={() => setShowReportModal(true)}
                  >
                    <MessageCircle className="mr-2 h-3.5 w-3.5 text-white" />
                    <span className="text-white text-sm">Sorunu Rapor Et</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                    onClick={() => {
                      /* TODO: Add tasks function */
                    }}
                  >
                    <FileText className="mr-2 h-3.5 w-3.5 text-white" />
                    <span className="text-white text-sm">Tasks</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                    onClick={() => {
                      /* TODO: Add files function */
                    }}
                  >
                    <FolderOpen className="mr-2 h-3.5 w-3.5 text-white" />
                    <span className="text-white text-sm">Files</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                    onClick={() => {
                      // TODO: SSS sayfasına yönlendir
                      window.open("/faq", "_blank");
                    }}
                  >
                    <HelpCircle className="mr-2 h-3.5 w-3.5 text-white" />
                    <span className="text-white text-sm">SSS</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                    onClick={() => {
                      /* TODO: Add changelog function */
                    }}
                  >
                    <Clock className="mr-2 h-3.5 w-3.5 text-white" />
                    <span className="text-white text-sm">Changelog</span>
                  </DropdownMenuItem>

                  <Link href={ROUTES.PRICING}>
                    <DropdownMenuItem className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors">
                      <CreditCard className="mr-2 h-3.5 w-3.5 text-white" />
                      <span className="text-white text-sm">Planı Yükselt</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem
                    className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 py-2 px-3 rounded-lg mx-1 flex items-center transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5 text-white" />
                    <span className="text-white text-sm">Çıkış Yap</span>
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
      
      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </>
  );
}
