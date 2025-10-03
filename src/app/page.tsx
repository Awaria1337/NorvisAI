'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useGuestStore } from '@/store/guestStore';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, Paperclip, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import VoiceInput from '@/components/ui/voice-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MessageBubble from '@/components/ui/message-bubble';
import AILoadingStates from '@/components/ui/ai-loading-states';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const { messages, messageCount, isLoading: isGuestLoading, isTyping, sendGuestMessage, canSendMessage, getRemainingMessages } = useGuestStore();
  
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleVoiceTranscript = (transcript: string) => {
    setInputMessage(transcript);
  };

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(ROUTES.CHAT);
    }
  }, [isAuthenticated, isLoading, router]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGuestLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    // Check limit after clearing input
    if (!canSendMessage()) {
      toast.error('Ücretsiz mesaj hakkınız doldu! Lütfen kayıt olun veya giriş yapın.');
      return;
    }
    
    await sendGuestMessage(message);
  };

  const handleSendClick = async () => {
    await handleSendMessage();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen text-white" style={{ backgroundColor: '#0a0a0a' }}>
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">NorvisAI</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-full"
              onClick={() => router.push(ROUTES.LOGIN)}
            >
              Oturum aç
            </Button>
            <Button
              className="bg-gray-800 text-white hover:bg-gray-700 rounded-full px-6"
              onClick={() => router.push(ROUTES.REGISTER)}
            >
              Üye ol
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            /* Empty State - Centered like Grok */
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {/* Logo and Title */}
              <div className="flex items-center mb-5">
                <img
                  src="/norvis_logo.png"
                  alt="Norvis AI"
                  className="h-16 w-16 object-contain brightness-0 invert"
                />
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  NorvisAI
                </h1>
              </div>
              
              {/* Input centered */}
              <div className="w-full max-w-3xl px-4 mb-4">
                <div className="border border-gray-600 px-2 shadow-lg p-1 mb-2" style={{
                  backgroundColor: '#242628', 
                  borderRadius: '28px',
                  minHeight: '60px', 
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                                  }}>
                  <div className="flex flex-col">
                    <div className="flex items-end justify-between gap-2" style={{ minHeight: '48px' }}>
                      {/* Left Side - Paperclip (disabled) */}
                      <div className="flex items-center justify-center pb-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full hover:bg-gray-600 text-gray-500 p-0 flex items-center justify-center flex-shrink-0 cursor-not-allowed"
                              disabled={true}
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Üye ol ve dosya yükle</TooltipContent>
                        </Tooltip>
                      </div>
                      
                      {/* Center - Input Area */}
                      <div className="flex-1 flex items-end pb-2">
                        <textarea
                          value={inputMessage}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 2000) {
                              setInputMessage(value);
                              const textarea = e.target as HTMLTextAreaElement;
                              textarea.style.height = 'auto';
                              const scrollHeight = Math.min(textarea.scrollHeight, 312);
                              textarea.style.height = scrollHeight + 'px';
                            }
                          }}
                          placeholder="Norvis nasıl yardımcı olabilir?"
                          className="w-full min-h-[26px] max-h-[312px] resize-none border-0 bg-transparent text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-0 text-base py-0 overflow-y-auto"
                          maxLength={2000}
                          rows={1}
                          disabled={!canSendMessage()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          style={{
                            lineHeight: '18px',
                            outline: 'none',
                            border: 'none'
                          }}
                        />
                      </div>
                      
                      {/* Right Side - Voice/Send Button */}
                      <div className="flex items-center justify-center pb-1">
                        {inputMessage.trim() && canSendMessage() ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleSendClick}
                                size="sm"
                                className="h-10 w-10 rounded-full hover:bg-gray-600 text-black hover:text-white p-0 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Gönder</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center flex-shrink-0" style={{ marginLeft: '6px' }}>
                                <VoiceInput
                                  onTranscript={handleVoiceTranscript}
                                  disabled={!canSendMessage()}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Sesli giriş</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Suggestion Buttons */}
              <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
                <Button
                  variant="outline"
                  onClick={() => handleSendMessage()}
                  className="px-4 py-5 rounded-2xl bg-transparent backdrop-blur-sm border border-gray-700 hover:bg-gray-800/50 text-white text-sm font-medium transition-all"
                  disabled={!canSendMessage()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Kod yardımı
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSendMessage()}
                  className="px-4 py-5 rounded-2xl bg-transparent backdrop-blur-sm border border-gray-700 hover:bg-gray-800/50 text-white text-sm font-medium transition-all"
                  disabled={!canSendMessage()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Hikaye yaz
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSendMessage()}
                  className="px-4 py-5 rounded-2xl bg-transparent backdrop-blur-sm border border-gray-700 hover:bg-gray-800/50 text-white text-sm font-medium transition-all"
                  disabled={!canSendMessage()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Öğren
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="outside-1 p-6 pt-16 space-y-6 mx-auto min-h-full transition-all duration-300 max-w-3xl pb-32">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={{
                      id: msg.id,
                      content: msg.content,
                      role: msg.role,
                      chatId: 'guest',
                      createdAt: msg.timestamp,
                      model: undefined,
                      tokensUsed: undefined
                    }}
                    isUser={msg.role === 'user'}
                  />
                ))}
                
                <AILoadingStates
                  isAIThinking={false}
                  showWaitingMessage={false}
                  isAIResponding={isGuestLoading}
                  streamingMessageId={null}
                  streamingContent={isTyping ? '...' : ''}
                />
                
                {!canSendMessage() && (
                  <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl text-center">
                    <p className="text-yellow-400 font-medium mb-2">Ücretsiz mesaj hakkınız doldu!</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Sınırsız mesaj, dosya yükleme ve daha fazlası için kayıt olun.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push(ROUTES.LOGIN)}
                        className="border-gray-600 text-white hover:bg-gray-700 rounded-full"
                      >
                        Oturum aç
                      </Button>
                      <Button
                        onClick={() => router.push(ROUTES.REGISTER)}
                        className="bg-gray-700 text-white hover:bg-gray-600 rounded-full"
                      >
                        Üye ol
                      </Button>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area - Only show at bottom when messages exist */}
        {messages.length > 0 && (
          <div className="w-full" style={{ backgroundColor: '#0a0a0a' }}>
            <div className="max-w-3xl mx-auto px-4 py-4">
              {messageCount > 0 && canSendMessage() && (
                <div className="text-center mb-3 text-sm text-gray-500">
                  Kalan mesaj: {getRemainingMessages()}/3
                </div>
              )}
              
              <div className="border border-gray-600 px-2 shadow-lg p-1 mb-2" style={{
                backgroundColor: '#242628', 
                borderRadius: '28px',
                minHeight: '60px', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '15px'
              }}>
                <div className="flex flex-col">
                  <div className="flex items-end justify-between gap-2" style={{ minHeight: '48px' }}>
                    <div className="flex items-center justify-center pb-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-full hover:bg-gray-600 text-gray-500 p-0 flex items-center justify-center flex-shrink-0 cursor-not-allowed"
                            disabled={true}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Üye ol ve dosya yükle</TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div className="flex-1 flex items-end pb-2">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 2000) {
                            setInputMessage(value);
                            const textarea = e.target as HTMLTextAreaElement;
                            textarea.style.height = 'auto';
                            const scrollHeight = Math.min(textarea.scrollHeight, 312);
                            textarea.style.height = scrollHeight + 'px';
                          }
                        }}
                        placeholder={!canSendMessage() ? 'Mesaj limiti doldu - Lütfen kayıt olun' : 'Norvis nasıl yardımcı olabilir?'}
                        className="w-full min-h-[26px] max-h-[312px] resize-none border-0 bg-transparent text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-0 text-base py-0 overflow-y-auto"
                        maxLength={2000}
                        rows={1}
                        disabled={!canSendMessage()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        style={{
                          lineHeight: '18px',
                          outline: 'none',
                          border: 'none'
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-center pb-1">
                      {inputMessage.trim() && canSendMessage() ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleSendClick}
                              size="sm"
                              className="h-10 w-10 rounded-full hover:bg-gray-600 text-black hover:text-white p-0 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Gönder</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center flex-shrink-0" style={{ marginLeft: '6px' }}>
                              <VoiceInput
                                onTranscript={handleVoiceTranscript}
                                disabled={!canSendMessage()}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Sesli giriş</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Norvis AI hatalar yapabilir. Önemli bilgileri doğrulayın.
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
