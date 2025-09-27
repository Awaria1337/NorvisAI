'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';

interface PromptInputProps {
  onSendMessage?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  onSendMessage,
  placeholder = "Herhangi bir şey sor",
  disabled = false,
  className
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get streaming state from chat store
  const { isAIResponding, stopStreaming } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage?.(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  
  const handleStopStreaming = () => {
    stopStreaming();
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Main Input Container */}
        <div className="relative bg-background border border-border rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
          <div className="flex items-end p-4 gap-3">
            {/* Plus Button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 rounded-full w-8 h-8 p-0 flex items-center justify-center hover:bg-muted transition-colors"
              disabled={disabled}
              title="Dosya ekle"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* Text Input */}
            <div className="flex-1 min-h-[50px] flex items-center">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "w-full min-h-[50px] max-h-[200px] resize-none",
                  "bg-transparent border-0 outline-none",
                  "text-base leading-6 text-foreground",
                  "placeholder:text-muted-foreground/70",
                  "py-3 px-0",
                  "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                rows={1}
                style={{
                  lineHeight: '1.5',
                  scrollbarWidth: 'thin'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isAIResponding ? (
                /* Stop Streaming Button - Show when AI is responding */
                <Button
                  onClick={handleStopStreaming}
                  size="sm"
                  className={cn(
                    "rounded-full w-8 h-8 p-0 flex items-center justify-center",
                    "bg-red-600 hover:bg-red-700 text-white",
                    "transition-all duration-200"
                  )}
                  title="Mesajı durdur"
                >
                  <Square className="h-3 w-3 fill-current" />
                </Button>
              ) : message.trim() ? (
                /* Send Button - Round like ChatGPT */
                <Button
                  onClick={handleSend}
                  size="sm"
                  disabled={disabled}
                  className={cn(
                    "rounded-full w-8 h-8 p-0 flex items-center justify-center",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  title="Mesajı gönder"
                >
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Microphone Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                    disabled={disabled}
                    className={cn(
                      "rounded-full w-8 h-8 p-0 flex items-center justify-center hover:bg-muted transition-colors",
                      isRecording && "bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                    )}
                    title={isRecording ? "Kaydı durdur" : "Sesli mesaj kaydet"}
                  >
                    <Mic className={cn(
                      "h-4 w-4",
                      isRecording ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                    )} />
                  </Button>

                  {/* Placeholder Stop Button (inactive when not streaming) */}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={true}
                    className="rounded-full w-8 h-8 p-0 flex items-center justify-center opacity-30 cursor-not-allowed"
                    title="AI yanıt verirken durdurmak için kullanılabilir"
                  >
                    <Square className="h-3 w-3 text-muted-foreground fill-current" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center mt-3 gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ✨ Surprise me
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            💡 Give me ideas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            📝 Help me write
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;