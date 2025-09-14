import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  model?: string;
  tokensUsed?: number;
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  // State
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed
  currentChat: Chat | null;
  
  // Actions
  setChats: (chats: Chat[]) => void;
  setCurrentChatId: (chatId: string | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // API Actions
  fetchChats: () => Promise<void>;
  createNewChat: (title?: string, model?: string) => Promise<Chat>;
  sendMessage: (content: string) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial State
      chats: [],
      currentChatId: null,
      isLoading: false,
      error: null,
      
      // Computed
      get currentChat() {
        const { chats, currentChatId } = get();
        return chats.find(chat => chat.id === currentChatId) || null;
      },
      
      // Basic Actions
      setChats: (chats) => set({ chats }),
      
      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
      
      addChat: (chat) => set((state) => ({
        chats: [chat, ...state.chats]
      })),
      
      updateChat: (chatId, updates) => set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId ? { ...chat, ...updates, updatedAt: new Date() } : chat
        )
      })),
      
      deleteChat: (chatId) => set((state) => ({
        chats: state.chats.filter(chat => chat.id !== chatId),
        currentChatId: state.currentChatId === chatId ? null : state.currentChatId
      })),
      
      addMessage: (chatId, message) => set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date()
              }
            : chat
        )
      })),
      
      updateMessage: (chatId, messageId, updates) => set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
                updatedAt: new Date()
              }
            : chat
        )
      })),
      
      deleteMessage: (chatId, messageId) => set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.filter(msg => msg.id !== messageId),
                updatedAt: new Date()
              }
            : chat
        )
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      // API Actions
      fetchChats: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock data for now
          const mockChats: Chat[] = [
            {
              id: '1',
              title: 'Create Html Game Environment...',
              model: 'gpt-3.5-turbo',
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '2',
              title: 'Apply To Leave For Emergency',
              model: 'gpt-4',
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '3',
              title: 'What Is UI UX Design?',
              model: 'gpt-3.5-turbo',
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '4',
              title: 'Create Chatbot GPT...',
              model: 'gpt-4',
              messages: [
                {
                  id: '1',
                  content: 'Create a chatbot gpt using python language what will be step for that',
                  role: 'user',
                  createdAt: new Date()
                },
                {
                  id: '2',
                  content: `Sure, I can help you get started with creating a chatbot using GPT in Python. Here are the basic steps you'll need to follow:

1. Install the required libraries: You'll need to install the transformers library from Hugging Face to use GPT. You can install it using pip.

2. Load the pre-trained model: GPT comes in several sizes and versions, so you'll need to choose the one that fits your needs. You can load a pre-trained GPT model.

3. Create a chatbot loop: You'll need to create a loop that takes user input, generates a response using the GPT model, and outputs it to the user.

4. Add some personality to the chatbot: While GPT can generate text, it doesn't have any inherent personality or style.

These are just the basic steps to get started with a GPT chatbot in Python. Good luck!`,
                  role: 'assistant',
                  model: 'gpt-4',
                  createdAt: new Date()
                }
              ],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          
          set({ chats: mockChats, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch chats',
            isLoading: false 
          });
        }
      },
      
      createNewChat: async (title = 'New Chat', model = 'gpt-3.5-turbo') => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock new chat creation
          const newChat: Chat = {
            id: `chat-${Date.now()}`,
            title,
            model,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          set((state) => ({
            chats: [newChat, ...state.chats],
            currentChatId: newChat.id,
            isLoading: false
          }));
          
          return newChat;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create chat',
            isLoading: false 
          });
          throw error;
        }
      },
      
      sendMessage: async (content) => {
        const { currentChatId, currentChat } = get();
        
        if (!currentChatId || !currentChat) {
          throw new Error('No active chat');
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Add user message immediately
          const userMessage: Message = {
            id: `msg-${Date.now()}`,
            content,
            role: 'user',
            createdAt: new Date()
          };
          
          get().addMessage(currentChatId, userMessage);
          
          // Simulate AI response
          setTimeout(() => {
            const aiMessage: Message = {
              id: `msg-${Date.now() + 1}`,
              content: "I'm a demo AI assistant. This is a sample response to show the chat interface working with the new dynamic system!",
              role: 'assistant',
              model: currentChat.model,
              createdAt: new Date()
            };
            
            get().addMessage(currentChatId, aiMessage);
            set({ isLoading: false });
          }, 1000);
          
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send message',
            isLoading: false 
          });
          throw error;
        }
      },
      
      regenerateMessage: async (messageId) => {
        const { currentChatId } = get();
        
        if (!currentChatId) {
          throw new Error('No active chat');
        }
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/chats/${currentChatId}/messages/${messageId}/regenerate`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to regenerate message');
          }
          
          const newMessage = await response.json();
          
          get().updateMessage(currentChatId, messageId, newMessage);
          set({ isLoading: false });
          
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to regenerate message',
            isLoading: false 
          });
          throw error;
        }
      }
    }),
    {
      name: 'chat-store'
    }
  )
);