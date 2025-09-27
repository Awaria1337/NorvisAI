'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface MessageEditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  originalMessage: string;
  messageId: string;
  onSave?: (messageId: string, newContent: string) => void;
}

export const MessageEditSidebar: React.FC<MessageEditSidebarProps> = ({
  isOpen,
  onClose,
  originalMessage,
  messageId,
  onSave
}) => {
  const [editedContent, setEditedContent] = useState(originalMessage);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset content when opening with new message
  useEffect(() => {
    setEditedContent(originalMessage);
    setHasChanges(false);
  }, [originalMessage, isOpen]);

  // Track changes
  useEffect(() => {
    setHasChanges(editedContent.trim() !== originalMessage.trim());
  }, [editedContent, originalMessage]);

  const handleSave = () => {
    if (!hasChanges) {
      toast.error('Hiçbir değişiklik yapılmadı!');
      return;
    }

    if (editedContent.trim() === '') {
      toast.error('Mesaj boş olamaz!');
      return;
    }

    if (onSave) {
      onSave(messageId, editedContent.trim());
      toast.success('Mesaj güncellendi! 💾');
      onClose();
    } else {
      toast.success('Kaydetme özelliği yakında! 💾');
    }
  };

  const handleReset = () => {
    setEditedContent(originalMessage);
    toast.success('Orijinal içerik geri yüklendi! 🔄');
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirm = window.confirm('Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinizden emin misiniz?');
      if (!confirm) return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full w-96 max-w-[90vw] bg-background border-l border-border
        shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Mesajı Düzenle</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Editor Area */}
          <div className="flex-1 p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Mesaj İçeriği
              </label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-64 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Mesajınızı buraya yazın..."
                autoFocus
              />
            </div>

            {/* Character Counter */}
            <div className="text-xs text-muted-foreground">
              {editedContent.length} karakter • {editedContent.split('\n').length} satır
            </div>

            {/* Changes Indicator */}
            {hasChanges && (
              <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Kaydedilmemiş değişiklikler var</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-border bg-muted/30 space-y-3">
            {/* Primary Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={!hasChanges}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Sıfırla
              </Button>
            </div>

            {/* Cancel Button */}
            <Button
              onClick={handleClose}
              variant="ghost"
              className="w-full"
            >
              İptal
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageEditSidebar;