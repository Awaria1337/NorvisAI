/**
 * Guest Chat Store
 * Manages chat for non-authenticated users with 3 message limit
 */

import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GuestStore {
  messages: Message[];
  messageCount: number;
  isLoading: boolean;
  isTyping: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  sendGuestMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  canSendMessage: () => boolean;
  getRemainingMessages: () => number;
}

const MAX_GUEST_MESSAGES = 3;

export const useGuestStore = create<GuestStore>((set, get) => ({
  messages: [],
  messageCount: 0,
  isLoading: false,
  isTyping: false,

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  sendGuestMessage: async (content: string) => {
    const state = get();
    
    // Check if can send message
    if (!state.canSendMessage()) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    set({ isLoading: true });
    state.addMessage(userMessage);
    set((state) => ({ messageCount: state.messageCount + 1 }));

    try {
      // Call guest API
      const response = await fetch('/api/guest/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          messageCount: get().messageCount
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add AI response
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.data.content,
          timestamp: new Date()
        };
        
        set({ isTyping: true });
        
        // Simulate typing effect
        setTimeout(() => {
          state.addMessage(aiMessage);
          set({ isTyping: false, isLoading: false });
        }, 500);
      } else {
        // Handle error response
        const errorMessage = data.error || data.message || 'Bir hata oluştu';
        set({ isLoading: false, isTyping: false });
        
        // Add error as assistant message
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        };
        state.addMessage(errorMsg);
        return;
      }
    } catch (error) {
      console.error('Guest chat error:', error);
      set({ isLoading: false, isTyping: false });
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };
      state.addMessage(errorMessage);
    }
  },

  clearMessages: () => {
    set({ messages: [], messageCount: 0 });
  },

  canSendMessage: () => {
    return get().messageCount < MAX_GUEST_MESSAGES;
  },

  getRemainingMessages: () => {
    return MAX_GUEST_MESSAGES - get().messageCount;
  }
}));
