'use client';

import React, { useState } from 'react';
import { Copy, Edit, MoreHorizontal, Check, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';

interface MessageActionsProps {
  content: string;
  isUser: boolean;
  messageId: string;
  onEdit?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onRate?: (messageId: string, rating: 'up' | 'down') => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  isUser,
  messageId,
  onEdit,
  onRegenerate,
  onRate,
}) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Mesaj kopyalandı! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Kopyalama başarısız! ❌');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(messageId);
      toast.success('Düzenleme modu açıldı! ✏️');
    } else {
      toast.success('Düzenleme özelliği yakında! ✏️');
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(messageId);
      toast.success('Yanıt yeniden üretiliyor... 🔄');
    } else {
      toast.success('Yeniden üretme özelliği yakında! 🔄');
    }
  };

  const handleRate = (rating: 'up' | 'down') => {
    if (onRate) {
      onRate(messageId, rating);
      const emoji = rating === 'up' ? '👍' : '👎';
      toast.success(`Geri bildirim kaydedildi! ${emoji}`);
    } else {
      const emoji = rating === 'up' ? '👍' : '👎';
      toast.success(`Geri bildirim özelliği yakında! ${emoji}`);
    }
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Hover Actions */}
      <div
        className={`
          absolute -top-2 right-2 flex items-center space-x-1 bg-background/95 backdrop-blur-sm 
          border border-border rounded-lg shadow-lg px-2 py-1 transition-all duration-200
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
        `}
      >
        {/* Copy Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 w-7 p-0 hover:bg-muted"
          title={copied ? "Kopyalandı!" : "Mesajı kopyala"}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </Button>

        {/* Edit Button (for user messages) */}
        {isUser && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-7 w-7 p-0 hover:bg-muted"
            title="Mesajı düzenle"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
        )}

        {/* Regenerate Button (for AI messages) */}
        {!isUser && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            className="h-7 w-7 p-0 hover:bg-muted"
            title="Yanıtı yeniden üret"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        )}

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Daha fazla eylem"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* AI message specific actions */}
            {!isUser && (
              <>
                <DropdownMenuItem onClick={() => handleRate('up')}>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  İyi yanıt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRate('down')}>
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Kötü yanıt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            {/* Common actions */}
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Kopyala
            </DropdownMenuItem>
            
            {isUser ? (
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleRegenerate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Yeniden üret
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MessageActions;