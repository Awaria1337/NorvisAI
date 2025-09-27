import React from 'react';
import { cn } from '@/lib/utils';

interface TypingSkeletonProps {
  className?: string;
  variant?: 'thinking' | 'typing' | 'waiting';
  message?: string;
}

const TypingDots = ({ className }: { className?: string }) => (
  <div className={cn("flex space-x-1", className)}>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
  </div>
);

const ThinkingAnimation = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center space-x-2", className)}>
    <div className="relative">
      <div className="w-6 h-6 border-2 border-muted-foreground/20 rounded-full animate-spin">
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
      </div>
    </div>
    <span className="text-sm text-muted-foreground animate-pulse">AI düşünüyor...</span>
  </div>
);

const TypingAnimation = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center space-x-3", className)}>
    <div className="flex space-x-1">
      <div className="w-1 h-4 bg-primary rounded-full animate-pulse [animation-delay:0ms]"></div>
      <div className="w-1 h-4 bg-primary/70 rounded-full animate-pulse [animation-delay:150ms]"></div>
      <div className="w-1 h-4 bg-primary/50 rounded-full animate-pulse [animation-delay:300ms]"></div>
    </div>
    <span className="text-sm text-muted-foreground">Yazıyor...</span>
  </div>
);

const WaitingAnimation = ({ className, message }: { className?: string; message?: string }) => (
  <div className={cn("flex items-center space-x-2", className)}>
    <div className="relative">
      <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
    </div>
    <span className="text-sm text-muted-foreground">
      {message || "Lütfen bekleyin, AI cevap hazırlıyor..."}
    </span>
  </div>
);

const TypingSkeleton: React.FC<TypingSkeletonProps> = ({
  className,
  variant = 'thinking',
  message
}) => {
  return (
    <div className={cn(
      "flex items-center justify-start w-full max-w-2xl mx-auto",
      "px-4 py-3 rounded-2xl",
      "bg-muted/50 border border-muted-foreground/10",
      "backdrop-blur-sm",
      className
    )}>
      <div className="flex items-center space-x-3">
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
          </div>
        </div>
        
        {/* Animation Content */}
        <div className="flex-1">
          {variant === 'thinking' && <ThinkingAnimation />}
          {variant === 'typing' && <TypingAnimation />}
          {variant === 'waiting' && <WaitingAnimation message={message} />}
        </div>
      </div>
    </div>
  );
};

export default TypingSkeleton;

// Individual components for more specific use cases
export const AIThinkingIndicator = ({ className }: { className?: string }) => (
  <div className={cn("inline-flex items-center space-x-2 text-muted-foreground", className)}>
    <TypingDots className="text-primary" />
    <span className="text-xs animate-pulse">Düşünüyor</span>
  </div>
);

export const AITypingIndicator = ({ className }: { className?: string }) => (
  <div className={cn("inline-flex items-center space-x-2 text-muted-foreground", className)}>
    <div className="flex space-x-0.5">
      <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse [animation-delay:0ms]"></div>
      <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse [animation-delay:100ms]"></div>
      <div className="w-1 h-3 bg-green-300 rounded-full animate-pulse [animation-delay:200ms]"></div>
    </div>
    <span className="text-xs animate-pulse">Yazıyor</span>
  </div>
);

export const AIWaitingIndicator = ({ className, message }: { className?: string; message?: string }) => (
  <div className={cn("inline-flex items-center space-x-2 text-muted-foreground", className)}>
    <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs">{message || "Bekliyor"}</span>
  </div>
);