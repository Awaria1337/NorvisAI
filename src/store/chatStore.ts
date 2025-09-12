import { create } from 'zustand';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  chatId: string;
}

export interface Chat {
  id: string;
  title: string;
  aiModel: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;

  // Actions
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  createChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  isSending: false,

  setChats: (chats) => set({ chats }),

  setCurrentChat: (currentChat) => set({ currentChat }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  setLoading: (isLoading) => set({ isLoading }),

  setSending: (isSending) => set({ isSending }),

  createChat: (chat) => set((state) => ({
    chats: [chat, ...state.chats],
    currentChat: chat
  })),

  updateChat: (chatId, updates) => set((state) => ({
    chats: state.chats.map(chat =>
      chat.id === chatId ? { ...chat, ...updates } : chat
    ),
    currentChat: state.currentChat?.id === chatId
      ? { ...state.currentChat, ...updates }
      : state.currentChat
  })),

  deleteChat: (chatId) => set((state) => ({
    chats: state.chats.filter(chat => chat.id !== chatId),
    currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
    messages: state.currentChat?.id === chatId ? [] : state.messages
  })),

  clearMessages: () => set({ messages: [] })
}));