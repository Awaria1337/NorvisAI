import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateChatTitle } from '@/utils/titleGenerator';
import { generateChatId } from '@/utils/uuid';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  model?: string;
  tokensUsed?: number;
  createdAt: Date;
  images?: string[]; // Array of image URLs or base64 strings
  files?: Array<{
    name: string;
    type: string;
    size: number;
    preview?: string;
  }>; // Array of attached files info
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
  
  // AI Loading States
  isAIThinking: boolean;
  isAIResponding: boolean;
  showWaitingMessage: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
  
  // Computed
  getCurrentChat: () => Chat | null;
  
  // Actions
  setChats: (chats: Chat[]) => void;
  setCurrentChatId: (chatId: string | null) => void;
  navigateToChat: (chatId: string) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, newTitle: string) => Promise<void>;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // AI Loading Actions
  setAIThinking: (thinking: boolean) => void;
  setAIResponding: (responding: boolean) => void;
  setShowWaitingMessage: (show: boolean) => void;
  resetAIStates: () => void;
  
  // Streaming Actions
  startStreaming: (messageId: string) => void;
  updateStreamingContent: (content: string) => void;
  finishStreaming: () => void;
  
  // API Actions
  fetchChats: () => Promise<void>;
  createNewChat: (title?: string, model?: string) => Promise<Chat>;
  sendMessage: (content: string, createNewChatIfNeeded?: boolean, files?: File[]) => Promise<void>;
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
      
      // AI Loading States
      isAIThinking: false,
      isAIResponding: false,
      showWaitingMessage: false,
      streamingMessageId: null,
      streamingContent: '',
      
      // Computed
      getCurrentChat: () => {
        const { chats, currentChatId } = get();
        return chats.find(chat => chat.id === currentChatId) || null;
      },
      
      // Basic Actions
      setChats: (chats) => set({ chats }),
      
      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
      
      navigateToChat: (chatId) => {
        set({ currentChatId: chatId });
        // Update URL without causing page reload
        if (typeof window !== 'undefined') {
          const newUrl = `/chat/${chatId}`;
          window.history.pushState({}, '', newUrl);
        }
      },
      
      addChat: (chat) => set((state) => ({
        chats: [chat, ...state.chats]
      })),
      
      updateChat: (chatId, updates) => set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === chatId ? { ...chat, ...updates, updatedAt: new Date() } : chat
        )
      })),
      
      deleteChat: async (chatId) => {
        try {
          console.log('🗑️ Starting chat deletion:', chatId);
          set({ isLoading: true, error: null });
          
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('❌ No authentication token for delete');
            throw new Error('No authentication token');
          }
          
          console.log('📤 Making DELETE request to API');
          const response = await fetch(`/api/chats/${chatId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('📥 Delete response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Delete API error:', errorData);
            throw new Error(errorData.error || `Failed to delete chat: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('✅ Chat deleted successfully from database:', result);
          
          // Update local state after successful API call
          set((state) => ({
            chats: state.chats.filter(chat => chat.id !== chatId),
            currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
            isLoading: false
          }));
          
          // Navigate away from deleted chat if we're currently viewing it
          if (get().currentChatId === chatId && typeof window !== 'undefined') {
            window.history.pushState({}, '', '/chat');
          }
          
          console.log('✅ Local state updated after chat deletion');
          
        } catch (error) {
          console.error('❌ Chat deletion failed:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete chat',
            isLoading: false 
          });
          throw error;
        }
      },
      
      renameChat: async (chatId: string, newTitle: string) => {
        try {
          console.log('✏️ Renaming chat:', chatId, 'to:', newTitle);
          set({ error: null });
          
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('❌ No authentication token for rename');
            throw new Error('No authentication token');
          }
          
          console.log('📤 Making PATCH request to API');
          const response = await fetch(`/api/chats/${chatId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: newTitle })
          });
          
          console.log('📥 Rename response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Rename API error:', errorData);
            throw new Error(errorData.error || `Failed to rename chat: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('✅ Chat renamed successfully in database:', result);
          
          // Update local state after successful API call
          set((state) => ({
            chats: state.chats.map(chat =>
              chat.id === chatId 
                ? { ...chat, title: newTitle, updatedAt: new Date() }
                : chat
            )
          }));
          
          console.log('✅ Local state updated after chat rename');
          
        } catch (error) {
          console.error('❌ Chat rename failed:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to rename chat'
          });
          throw error;
        }
      },
      
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
      
      // AI Loading Actions
      setAIThinking: (thinking) => set({ isAIThinking: thinking }),
      
      setAIResponding: (responding) => set({ isAIResponding: responding }),
      
      setShowWaitingMessage: (show) => set({ showWaitingMessage: show }),
      
      resetAIStates: () => set({ 
        isAIThinking: false, 
        isAIResponding: false, 
        showWaitingMessage: false,
        streamingMessageId: null,
        streamingContent: ''
      }),
      
      // Streaming Actions
      startStreaming: (messageId: string) => set({ 
        streamingMessageId: messageId, 
        streamingContent: '', 
        isAIResponding: true 
      }),
      
      updateStreamingContent: (content: string) => set({ streamingContent: content }),
      
      finishStreaming: () => set({ 
        streamingMessageId: null, 
        streamingContent: '', 
        isAIResponding: false 
      }),
      
      // API Actions
      fetchChats: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token');
          }

          const response = await fetch('/api/chats', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch chats');
          }

          const result = await response.json();
          set({ chats: result.data || [], isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch chats',
            isLoading: false 
          });
        }
      },
      
      createNewChat: async (title = 'New Chat', model = 'google/gemma-2-9b-it:free') => {
        try {
          console.log('🆕 Creating new chat with:', { title, model });
          set({ isLoading: true, error: null });
          
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('❌ No authentication token for new chat');
            throw new Error('No authentication token');
          }
          console.log('🔑 Token found for new chat, length:', token.length);

          const requestBody = {
            title,
            aiModel: model
          };
          console.log('📤 Sending new chat request:', requestBody);

          const response = await fetch('/api/chats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
          });

          console.log('📥 New chat response status:', response.status);

          if (!response.ok) {
            const errorData = await response.text();
            console.error('❌ New chat API error:', {
              status: response.status,
              statusText: response.statusText,
              body: errorData
            });
            throw new Error(`Failed to create chat: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          console.log('✅ New chat created successfully:', result);
          const newChat = result.data;
          
          set((state) => ({
            chats: [newChat, ...state.chats],
            currentChatId: newChat.id,
            isLoading: false
          }));
          
          // Navigate to the new chat URL
          if (typeof window !== 'undefined') {
            const newUrl = `/chat/${newChat.id}`;
            window.history.pushState({}, '', newUrl);
          }
          
          return newChat;
        } catch (error) {
          console.error('❌ New chat creation failed:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create chat',
            isLoading: false 
          });
          throw error;
        }
      },
      
      sendMessage: async (content: string, createNewChatIfNeeded = false, files: any[] = []) => {
        console.log('🚀 sendMessage called with:', { content, createNewChatIfNeeded, files: files.length });
        let { currentChatId } = get();
        let currentChat = get().getCurrentChat();
        console.log('📝 Current chat ID:', currentChatId);
        
        // Process files for AI consumption
        let processedFiles: any[] = [];
        if (files.length > 0) {
          for (const fileItem of files) {
            const file = fileItem.file || fileItem;
            if (file instanceof File) {
              try {
                // Convert file to buffer format for API
                const buffer = await file.arrayBuffer();
                const base64Buffer = Buffer.from(buffer).toString('base64');
                
                processedFiles.push({
                  buffer: base64Buffer,
                  filename: file.name,
                  mimeType: file.type,
                  size: file.size
                });
              } catch (error) {
                console.error('Error processing file:', file.name, error);
              }
            }
          }
          console.log('📎 Processed', processedFiles.length, 'files for upload');
        }
        
        // Declare timeout variable in the correct scope
        let timeoutId: NodeJS.Timeout | null = null;
        
        try {
          // Reset AI states and start thinking animation immediately
          get().resetAIStates();
          get().setAIThinking(true);
          
          // Only create a new chat if explicitly requested or if there are no chats at all
          if (createNewChatIfNeeded || (!currentChatId && get().chats.length === 0)) {
            console.log('🆕 Creating new chat...');
            // Generate smart title from user message
            const smartTitle = generateChatTitle(content);
            const newChat = await get().createNewChat(smartTitle, 'google/gemma-2-9b-it:free');
            currentChatId = newChat.id;
            currentChat = newChat;
            console.log('✅ New chat created with smart title:', smartTitle, 'ID:', currentChatId);
          } else if (!currentChatId && get().chats.length > 0) {
            // If no current chat selected but chats exist, select the first one
            const firstChat = get().chats[0];
            currentChatId = firstChat.id;
            set({ currentChatId: firstChat.id });
            currentChat = get().getCurrentChat();
            console.log('📌 Selected existing chat with ID:', currentChatId);
          }
          
          if (!currentChatId) {
            console.error('❌ No active chat available');
            get().resetAIStates();
            throw new Error('No active chat available');
          }

          // 1. FIRST: Add user message to UI immediately (ChatGPT style)
          const userMessage: Message = {
            id: `temp-${Date.now()}`,
            content,
            role: 'user',
            createdAt: new Date(),
            images: files.filter(f => f.file?.type?.startsWith('image/')).map(f => f.preview).filter(Boolean),
            files: files.map(fileItem => {
              const file = fileItem.file || fileItem;
              return {
                name: file.name || 'Unknown',
                type: file.type || 'unknown',
                size: file.size || 0,
                preview: fileItem.preview
              };
            }).filter(f => f.name !== 'Unknown')
          };
          
          // Add user message to UI instantly
          get().addMessage(currentChatId, userMessage);
          console.log('✅ User message added to UI instantly');

          // 2. SECOND: Start AI thinking state
          const startTime = Date.now();
          
          // Set up a timeout to switch to waiting message after 3 seconds max
          timeoutId = setTimeout(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= 3000 && get().isAIThinking) {
              get().setAIThinking(false);
              get().setShowWaitingMessage(true);
              console.log('⏰ Switched to waiting message after 3s');
            }
          }, 3000);
          
          // Add timeout for maximum wait time (75 seconds for AI responses)
          const maxTimeoutId = setTimeout(() => {
            if (get().isAIThinking || get().showWaitingMessage || get().isAIResponding) {
              console.log('⚠️ Maximum timeout reached (75s)');
              get().resetAIStates();
              // Add error message to chat
              const errorMessage: Message = {
                id: `error-${Date.now()}`,
                content: 'Request timed out. The AI service might be busy. Please try again.',
                role: 'assistant',
                createdAt: new Date()
              };
              get().addMessage(currentChatId!, errorMessage);
            }
          }, 75000);
          
          set({ isLoading: true, error: null });
          
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('❌ No authentication token');
            get().resetAIStates();
            throw new Error('No authentication token');
          }
          console.log('🔑 Token found, making API request...');

          // 3. THIRD: Make API request with timeout
          console.log('🌐 Making API request to:', `/api/chats/${currentChatId}/messages`);
          const requestBody: any = {
            content
          };
          
          // Add processed files if any
          if (processedFiles.length > 0) {
            requestBody.files = processedFiles;
            console.log('📁 Including', processedFiles.length, 'files in request');
          }
          
          // Create fetch with timeout (70s - longer than typical AI response)
          const controller = new AbortController();
          const fetchTimeout = setTimeout(() => {
            controller.abort();
            console.log('⚠️ Fetch request aborted due to timeout');
          }, 70000); // 70 seconds timeout for fetch
          
          const response = await fetch(`/api/chats/${currentChatId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
          
          clearTimeout(fetchTimeout);

          console.log('📡 API response status:', response.status);
          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ API error:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('✅ API response received:', result);
          
          // Clear both timeouts since we got a response
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          clearTimeout(maxTimeoutId);
          
          // 4. FOURTH: Switch to responding state for typing effect
          get().setAIThinking(false);
          get().setShowWaitingMessage(false);
          get().setAIResponding(true);
          
          // 5. FIFTH: Update chat with actual messages from server (PRESERVE FILE ATTACHMENTS)
          const updatedChat = result.data.chat;
          if (updatedChat && updatedChat.messages) {
            set(state => ({
              chats: state.chats.map(chat => {
                if (chat.id === updatedChat.id) {
                  // Merge server messages with local file attachments
                  const localMessages = chat.messages;
                  const mergedMessages = updatedChat.messages.map((serverMsg: any) => {
                    // Find corresponding local message by content or timestamp
                    const localMsg = localMessages.find(
                      localM => localM.role === serverMsg.role && 
                      (localM.content === serverMsg.content || 
                       Math.abs(new Date(localM.createdAt).getTime() - new Date(serverMsg.createdAt).getTime()) < 5000)
                    );
                    
                    return {
                      ...serverMsg,
                      createdAt: new Date(serverMsg.createdAt),
                      // Preserve file attachments from local message
                      images: localMsg?.images || serverMsg.images || undefined,
                      files: localMsg?.files || serverMsg.files || undefined
                    };
                  });
                  
                  return {
                    ...updatedChat,
                    messages: mergedMessages
                  };
                }
                return chat;
              }),
              isLoading: false
            }));
          }
          
          // 6. FINAL: Reset AI states after brief delay for smooth UX
          setTimeout(() => {
            get().resetAIStates();
            console.log('🎉 Message flow completed successfully');
          }, 300);
          
        } catch (error) {
          // Clear timeout on error
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          // Also clear max wait timer so it doesn't fire after error
          try { clearTimeout(maxTimeoutId); } catch {}
          get().resetAIStates();
          
          let errorMessage = 'Sorry, I encountered an error. Please try again.';
          
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              errorMessage = 'Request timed out. The AI service might be busy. Please try again.';
            } else if (error.message.includes('Failed to fetch')) {
              errorMessage = 'Network error: Unable to connect to the AI service. Please check your connection and try again.';
            } else if (error.message.includes('NetworkError')) {
              errorMessage = 'Network error: Please check your internet connection.';
            } else {
              errorMessage = `Error: ${error.message}`;
            }
            
            console.error('❗ Detailed error info:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
          }
          
          // Add error message to chat if we have a currentChatId and it's not just an abort timeout
          if (currentChatId && !(error instanceof Error && error.name === 'AbortError')) {
            const chatErrorMessage: Message = {
              id: `error-${Date.now()}`,
              content: errorMessage,
              role: 'assistant',
              createdAt: new Date()
            };
            get().addMessage(currentChatId, chatErrorMessage);
          }
          
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send message',
            isLoading: false 
          });
          console.error('❌ sendMessage error:', error);
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


