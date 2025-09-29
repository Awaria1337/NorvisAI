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
  isTypingEffect: boolean; // For post-streaming typing effect
  streamingMessageId: string | null;
  streamingContent: string;
  streamingAbortController: AbortController | null;
  isStreamingStopped: boolean;
  
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
  setTypingEffect: (typing: boolean) => void;
  resetAIStates: () => void;
  
  // Streaming Actions
  startStreaming: (messageId: string) => void;
  updateStreamingContent: (content: string) => void;
  finishStreaming: () => void;
  stopStreaming: () => void;
  
  // API Actions
  fetchChats: () => Promise<void>;
  createNewChat: (title?: string, model?: string) => Promise<Chat>;
  sendMessage: (content: string, createNewChatIfNeeded?: boolean, files?: File[]) => Promise<void>;
  sendMessageStreaming: (content: string, createNewChatIfNeeded?: boolean, files?: File[]) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  
  // Cleanup Actions
  cleanup: () => void;
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
      isTypingEffect: false,
      streamingMessageId: null,
      streamingContent: '',
      streamingAbortController: null,
      isStreamingStopped: false,
      
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
      
      setTypingEffect: (typing) => set({ isTypingEffect: typing }),
      
      resetAIStates: () => {
        console.log('🧼 Resetting all AI states...');
        const { streamingAbortController } = get();
        if (streamingAbortController) {
          try {
            streamingAbortController.abort();
          } catch (error) {
            console.warn('Error aborting in reset:', error);
          }
        }
        set({ 
          isAIThinking: false, 
          isAIResponding: false, 
          showWaitingMessage: false,
          isTypingEffect: false,
          streamingMessageId: null,
          streamingContent: '',
          streamingAbortController: null,
          isStreamingStopped: false
        });
        console.log('✅ All AI states have been reset');
      },
      
      // Streaming Actions
      startStreaming: (messageId: string) => {
        console.log('🎉 Starting NEW streaming for message:', messageId.substring(0, 20) + '...');
        const abortController = new AbortController();
        set({ 
          streamingMessageId: messageId, 
          streamingContent: '', 
          isAIResponding: true,
          streamingAbortController: abortController,
          isStreamingStopped: false
        });
      },
      
      updateStreamingContent: (content: string) => {
        const currentState = get();
        // Don't update if streaming was stopped or not active
        if (currentState.isStreamingStopped || (!currentState.isAIResponding && !currentState.isAIThinking)) {
          console.log('🛑 Ignoring streaming update - stopped or not active');
          return;
        }
        set({ streamingContent: content });
      },
      
      finishStreaming: () => {
        console.log('🏁 Finishing streaming - keeping typing effect active');
        // Keep isTypingEffect true so stop button stays visible during typing animation
        set({ 
          streamingMessageId: null, 
          streamingContent: '', 
          isAIResponding: false,
          isAIThinking: false,
          showWaitingMessage: false,
          isTypingEffect: true, // Keep true for typing animation
          streamingAbortController: null,
          isStreamingStopped: false
        });
        
        // Reset typing effect after enough time for fast typing to complete
        // At 5ms per char, 1000 chars = 5 seconds max
        setTimeout(() => {
          const currentState = get();
          if (currentState.isTypingEffect) {
            console.log('🏁 Typing animation time complete - resetting typing state');
            set({ isTypingEffect: false });
          }
        }, 3000); // 3 seconds should be enough for most messages
      },
      
      stopStreaming: () => {
        const { streamingAbortController, streamingMessageId, currentChatId } = get();
        
        console.log('🛑 IMMEDIATE STOP - Stopping current streaming, ID:', streamingMessageId);
        
        // FIRST: Immediately set stopped flag to prevent further updates
        set({ isStreamingStopped: true });
        
        if (streamingAbortController) {
          console.log('🛑 Aborting streaming request...');
          try {
            streamingAbortController.abort();
          } catch (error) {
            console.warn('Error aborting stream:', error);
          }
        }
        
        // Save current streaming content to message if exists (to preserve partial response)
        if (streamingMessageId && currentChatId) {
          const currentContent = get().streamingContent;
          if (currentContent.trim()) {
            console.log('💾 Finalizing stopped message:', streamingMessageId.substring(0, 20) + '...');
            get().updateMessage(currentChatId, streamingMessageId, {
              content: currentContent
            });
          } else {
            // If no content, remove the empty AI message
            console.log('🗑️ Removing empty stopped message:', streamingMessageId.substring(0, 20) + '...');
            get().deleteMessage(currentChatId, streamingMessageId);
          }
        }
        
        // Reset ALL AI-related states immediately
        set({ 
          isAIThinking: false,
          isAIResponding: false,
          showWaitingMessage: false,
          isTypingEffect: false,
          streamingMessageId: null, 
          streamingContent: '', 
          streamingAbortController: null,
          isStreamingStopped: false // Reset this after cleanup
        });
        
        console.log('✅ Streaming stopped completely - Message finalized');
        
        // Small timeout to ensure UI has time to update
        setTimeout(() => {
          const finalState = get();
          if (finalState.isAIThinking || finalState.isAIResponding || finalState.isTypingEffect) {
            console.warn('⚠️ States not properly reset, forcing final cleanup');
            set({ 
              isAIThinking: false,
              isAIResponding: false,
              showWaitingMessage: false,
              isTypingEffect: false
            });
          }
        }, 100);
      },
      
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
        return get().sendMessageStreaming(content, createNewChatIfNeeded, files);
      },

      sendMessageStreaming: async (content: string, createNewChatIfNeeded = false, files: any[] = []) => {
        console.log('🚀 Starting STREAMING message send with:', { content, createNewChatIfNeeded, files: files.length });
        
        // CRITICAL: Stop any existing streaming immediately before starting new message
        const { streamingAbortController, isAIResponding, isAIThinking } = get();
        if (streamingAbortController || isAIResponding || isAIThinking) {
          console.log('🛑 Stopping previous streaming before starting new message');
          get().stopStreaming();
          // Small delay to ensure cleanup completes
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
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
          console.log('📎 Processed', processedFiles.length, 'files for streaming upload');
        }
        
        let timeoutId: NodeJS.Timeout | null = null;
        let streamingMessageId: string | null = null;
        
        try {
          // Reset AI states and start thinking
          get().resetAIStates();
          set({ 
            isAIThinking: true,
            isAIResponding: false,
            showWaitingMessage: false,
            isTypingEffect: false,
            streamingMessageId: null,
            streamingContent: '',
            isStreamingStopped: false
          });
          
          // Create new chat if needed
          if (createNewChatIfNeeded || (!currentChatId && get().chats.length === 0)) {
            console.log('🆕 Creating new chat for streaming...');
            const smartTitle = generateChatTitle(content);
            const newChat = await get().createNewChat(smartTitle, 'google/gemma-2-9b-it:free');
            currentChatId = newChat.id;
            currentChat = newChat;
            console.log('✅ New chat created for streaming:', smartTitle, 'ID:', currentChatId);
          } else if (!currentChatId && get().chats.length > 0) {
            const firstChat = get().chats[0];
            currentChatId = firstChat.id;
            set({ currentChatId: firstChat.id });
            currentChat = get().getCurrentChat();
            console.log('📌 Selected existing chat for streaming:', currentChatId);
          }
          
          if (!currentChatId) {
            console.error('❌ No active chat for streaming');
            get().resetAIStates();
            throw new Error('No active chat available');
          }

          // Add user message immediately
          const userMessage: Message = {
            id: `user-${Date.now()}`,
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
          
          get().addMessage(currentChatId, userMessage);
          console.log('✅ User message added for streaming');

          // Set timeout for thinking state
          timeoutId = setTimeout(() => {
            if (get().isAIThinking) {
              get().setAIThinking(false);
              get().setShowWaitingMessage(true);
              console.log('⏰ Switched to waiting for streaming response');
            }
          }, 3000);
          
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('❌ No authentication token for streaming');
            get().resetAIStates();
            throw new Error('No authentication token');
          }

          const requestBody: any = {
            content,
            role: 'user'
          };
          
          if (processedFiles.length > 0) {
            requestBody.files = processedFiles;
            console.log('📁 Including', processedFiles.length, 'files in streaming request');
          }
          
          console.log('🌊 Starting Server-Sent Events connection...');
          
          // Get AbortController for this streaming request
          const { streamingAbortController } = get();
          
          // Use the streaming endpoint
          const response = await fetch(`/api/chats/${currentChatId}/messages/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody),
            signal: streamingAbortController?.signal
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log('📡 Streaming response started');
          
          // Clear timeouts since we got a response
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          
          // Switch to AI responding state
          get().setAIThinking(false);
          get().setShowWaitingMessage(false);
          
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          
          if (!reader) {
            throw new Error('No reader available for streaming response');
          }
          
          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('✅ Streaming completed');
              break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep the incomplete line in buffer
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.substring(6));
                  console.log('📥 Streaming data:', data.type);
                  
                  switch (data.type) {
                    case 'userMessage':
                      // User message already added, skip
                      break;
                    
                    case 'aiMessageStart':
                      // CRITICAL: Only start NEW streaming if no other streaming is active
                      const currentStreamingState = get();
                      if (currentStreamingState.streamingMessageId && currentStreamingState.streamingMessageId !== data.data.id) {
                        console.log('⚠️ Ignoring aiMessageStart - another streaming already active:', currentStreamingState.streamingMessageId?.substring(0, 20));
                        break;
                      }
                      
                      // Create empty AI message and start streaming
                      streamingMessageId = data.data.id;
                      if (streamingMessageId) {
                        const aiMessage: Message = {
                          id: streamingMessageId,
                          content: '',
                          role: 'assistant',
                          createdAt: new Date()
                        };
                        get().addMessage(currentChatId!, aiMessage);
                        get().startStreaming(streamingMessageId);
                        console.log('🤖 AI message started, ID:', streamingMessageId.substring(0, 20) + '...');
                      }
                      break;
                    
                    case 'chunk':
                      // CRITICAL: Check if this chunk belongs to the CURRENT active streaming
                      const currentState = get();
                      const activeStreamingId = currentState.streamingMessageId;
                      
                      // Ignore if streaming was stopped or message ID doesn't match
                      if (currentState.isStreamingStopped || (!currentState.isAIResponding && !currentState.isAIThinking)) {
                        console.log('🛑 Chunk REJECTED - streaming stopped or not active, chunk ID:', data.data.id?.substring(0, 20));
                        break;
                      }
                      
                      // CRITICAL: Only accept chunks for the CURRENTLY ACTIVE streaming message
                      if (!activeStreamingId || data.data.id !== activeStreamingId) {
                        console.log('🛑 Chunk REJECTED - ID mismatch. Active:', activeStreamingId?.substring(0, 20), 'Chunk:', data.data.id?.substring(0, 20));
                        break;
                      }
                      
                      // Update the streaming content (only if ID matches)
                      if (streamingMessageId && data.data.id === streamingMessageId && data.data.id === activeStreamingId) {
                        get().updateStreamingContent(data.data.fullContent);
                        
                        // Update the actual message in the chat
                        get().updateMessage(currentChatId!, streamingMessageId, {
                          content: data.data.fullContent
                        });
                      }
                      break;
                    
                    case 'complete':
                      // Streaming completed - only accept if it matches active streaming
                      const completeState = get();
                      const activeCompleteId = completeState.streamingMessageId;
                      
                      if (streamingMessageId && data.data.id === streamingMessageId && data.data.id === activeCompleteId) {
                        console.log('🎉 Streaming message completed for ID:', streamingMessageId.substring(0, 20) + '...');
                        get().finishStreaming();
                      } else {
                        console.log('⚠️ Ignoring complete - ID mismatch. Active:', activeCompleteId?.substring(0, 20), 'Complete:', data.data.id?.substring(0, 20));
                      }
                      break;
                    
                    case 'error':
                      // Handle error - only accept if it matches active streaming
                      const errorState = get();
                      const activeErrorId = errorState.streamingMessageId;
                      
                      console.error('❌ Streaming error:', data.data.error);
                      if (streamingMessageId && data.data.id === streamingMessageId && data.data.id === activeErrorId) {
                        get().updateMessage(currentChatId!, streamingMessageId, {
                          content: data.data.content
                        });
                        get().finishStreaming();
                      } else {
                        console.log('⚠️ Ignoring error - ID mismatch. Active:', activeErrorId?.substring(0, 20), 'Error:', data.data.id?.substring(0, 20));
                      }
                      break;
                  }
                } catch (parseError) {
                  console.error('Error parsing streaming data:', parseError);
                }
              }
            }
          }
          
          // Final cleanup
          get().resetAIStates();
          set({ isLoading: false });
          console.log('🎊 Streaming message flow completed');
          
        } catch (error) {
          // Clear timeout on error
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          
          // Check if error is from abort (user stopped streaming)
          const isAbortError = error instanceof Error && 
            (error.name === 'AbortError' || error.message.includes('aborted'));
          
          if (isAbortError) {
            console.log('🛑 Streaming aborted by user - cleanup already done');
            get().resetAIStates();
            set({ isLoading: false });
            return; // Don't show error message for user-initiated stops
          }
          
          // For actual errors (not user abort), show error message
          get().resetAIStates();
          
          let errorMessage = 'Sorry, I encountered an error with streaming. Please try again.';
          
          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
              errorMessage = 'Network error: Unable to connect to the streaming service.';
            } else {
              errorMessage = `Streaming error: ${error.message}`;
            }
            
            console.error('❗ Streaming error details:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
          }
          
          // Add error message to chat (only for real errors, not aborts)
          if (currentChatId) {
            const chatErrorMessage: Message = {
              id: `error-${Date.now()}`,
              content: errorMessage,
              role: 'assistant',
              createdAt: new Date()
            };
            get().addMessage(currentChatId, chatErrorMessage);
          }
          
          set({ 
            error: error instanceof Error ? error.message : 'Streaming failed',
            isLoading: false 
          });
          console.error('❌ sendMessageStreaming error:', error);
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
      },
      
      editMessage: async (messageId: string, newContent: string) => {
        console.log('✏️ Starting message edit:', messageId);
        const { currentChatId } = get();
        
        if (!currentChatId) {
          throw new Error('No active chat');
        }
        
        const currentChat = get().getCurrentChat();
        if (!currentChat) {
          throw new Error('Chat not found');
        }
        
        // Find the message to edit
        const messageIndex = currentChat.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) {
          throw new Error('Message not found');
        }
        
        const originalMessage = currentChat.messages[messageIndex];
        if (originalMessage.role !== 'user') {
          throw new Error('Only user messages can be edited');
        }
        
        try {
          console.log('📝 Updating message content');
          
          // Update the user message content locally
          get().updateMessage(currentChatId, messageId, {
            content: newContent,
            createdAt: new Date()
          });
          
          // Remove all messages after the edited message (including AI responses)
          const messagesToKeep = currentChat.messages.slice(0, messageIndex + 1);
          const updatedMessages = [...messagesToKeep];
          updatedMessages[messageIndex] = { ...originalMessage, content: newContent, createdAt: new Date() };
          
          // Update the chat with only messages up to the edited one
          get().updateChat(currentChatId, {
            messages: updatedMessages
          });
          
          console.log('🔄 Generating new AI response for edited message');
          
          // Generate new AI response for the edited message
          await get().sendMessageStreaming(newContent, false, []);
          
          console.log('✅ Message edit and regeneration completed');
          
        } catch (error) {
          console.error('❌ Message edit failed:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to edit message'
          });
          throw error;
        }
      },
      
      // Cleanup function - stops speech synthesis and resets states
      cleanup: () => {
        // Stop any ongoing speech synthesis safely
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            // Check if speech synthesis is speaking before canceling
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.cancel();
            }
          } catch (error) {
            // Silent error handling for speech synthesis cleanup
            console.log('Speech synthesis cleanup completed');
          }
        }
        
        // Stop streaming if active
        const { streamingAbortController } = get();
        if (streamingAbortController) {
          streamingAbortController.abort();
        }
        
        // Reset AI states
        get().resetAIStates();
        
        console.log('🧹 Chat store cleanup completed');
      }
    }),
    {
      name: 'chat-store'
    }
  )
);


