'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Bug, Send, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Lütfen bir başlık girin');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Lütfen hatayı açıklayın');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: API call to submit bug report
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast.success('Hata raporu başarıyla gönderildi. Teşekkürler!', {
        duration: 4000
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setIncludeScreenshot(true);
      onClose();
    } catch (error) {
      toast.error('Hata raporu gönderilirken bir sorun oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-2xl border border-border/50 w-[90vw] max-w-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Ne oldu?</h2>
              <p className="text-sm text-muted-foreground">Karşılaştığın sorunu bize aktar</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bug Title */}
          <div className="space-y-2">
            <Label htmlFor="bug-title" className="text-sm font-medium">
              Başlık
            </Label>
            <Input
              id="bug-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kısa ve öz bir başlık yazın"
              className="h-10"
              maxLength={100}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 karakter
            </p>
          </div>

          {/* Bug Description */}
          <div className="space-y-2">
            <Label htmlFor="bug-description" className="text-sm font-medium">
              Açıklama
            </Label>
            <Textarea
              id="bug-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Karşılaştığın sorunu bize aktar"
              className="min-h-[120px] resize-none"
              maxLength={2000}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Ne oldu, nasıl tekrarlanabilir, beklenen davranış nedir?</span>
              <span>{description.length}/2000 karakter kullanıldı</span>
            </div>
          </div>

          {/* Screenshot Option */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Rapora ekran görüntüsü ekle</p>
                <p className="text-xs text-muted-foreground">
                  Sorunu daha iyi anlamamız için mevcut ekranın görüntüsünü ekler
                </p>
              </div>
            </div>
            <Switch
              checked={includeScreenshot}
              onCheckedChange={setIncludeScreenshot}
              disabled={isSubmitting}
            />
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Paylaştığın her bilgi, ChatGPT&apos;yi geliştirmek için incelenebilir.</strong> 
              {' '}Başka soru varsa,{' '}
              <button className="underline hover:no-underline">
                destek ekibiyle iletişime geç.
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50 bg-muted/20">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6"
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="px-6 bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Gönderiliyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Gönder
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BugReportModal;