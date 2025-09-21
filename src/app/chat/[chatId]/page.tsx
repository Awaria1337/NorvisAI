'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { isValidChatId } from '@/utils/uuid';
import { ROUTES } from '@/constants';
import ChatPage from '../page';

/**
 * Dynamic Chat Page Component
 * Handles individual chat URLs like /chat/68cf0f08-63f8-832f-8ed2-d5a2594d0b2d
 */
export default function DynamicChatPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { setCurrentChatId, fetchChats, chats, getCurrentChat } = useChatStore();
  
  const chatId = params.chatId as string;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // Validate chat ID format
    if (chatId && !isValidChatId(chatId)) {
      console.warn('Invalid chat ID format:', chatId);
      router.push('/chat');
      return;
    }

    // Set current chat ID if valid
    if (chatId && isValidChatId(chatId)) {
      console.log('Setting current chat ID from URL:', chatId);
      setCurrentChatId(chatId);
    }
  }, [chatId, isAuthenticated, isLoading, router, setCurrentChatId]);

  // Fetch chats if authenticated and chats not loaded
  useEffect(() => {
    if (isAuthenticated && chats.length === 0) {
      fetchChats();
    }
  }, [isAuthenticated, chats.length, fetchChats]);

  // Check if chat exists after chats are loaded
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const currentChat = getCurrentChat();
      if (!currentChat) {
        console.warn('Chat not found:', chatId);
        // Chat doesn't exist, redirect to main chat page
        router.push('/chat');
      }
    }
  }, [chatId, chats, getCurrentChat, router]);

  // Show loading while authenticating or validating
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading chat...</p>
          <p className="mt-2 text-sm text-muted-foreground">Validating chat ID...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Render the main chat page component
  return <ChatPage />;
}