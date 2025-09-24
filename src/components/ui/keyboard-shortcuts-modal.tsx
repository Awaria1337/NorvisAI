'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Keyboard, Search, Plus, Trash2, ArrowUpDown, Archive, Camera, Command, Shift } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  category: string;
  shortcuts: {
    action: string;
    keys: string[];
    icon?: React.ReactNode;
  }[];
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const shortcuts: ShortcutItem[] = [
    {
      category: 'Sohbetleri ara',
      shortcuts: [
        {
          action: 'Sohbetleri ara',
          keys: ['Ctrl', 'K'],
          icon: <Search className="h-4 w-4" />
        }
      ]
    },
    {
      category: 'Sohbet',
      shortcuts: [
        {
          action: 'Yeni sohbet aç',
          keys: ['Ctrl', 'Shift', 'O'],
          icon: <Plus className="h-4 w-4" />
        },
        {
          action: 'Kenar çubuğunu değiştir',
          keys: ['Ctrl', 'Shift', 'S'],
          icon: <ArrowUpDown className="h-4 w-4" />
        },
        {
          action: 'Son kod blokunu kopyala',
          keys: ['Ctrl', 'Shift', ';'],
          icon: <Command className="h-4 w-4" />
        },
        {
          action: 'Sohbeti sil',
          keys: ['Ctrl', 'Shift', '⌫'],
          icon: <Trash2 className="h-4 w-4" />
        },
        {
          action: 'Sohbet girdisini odakla',
          keys: ['Shift', 'Esc'],
          icon: <ArrowUpDown className="h-4 w-4" />
        },
        {
          action: 'Fotoğraf ve dosya ekle',
          keys: ['Ctrl', 'U'],
          icon: <Camera className="h-4 w-4" />
        }
      ]
    },
    {
      category: 'Ayarlar',
      shortcuts: [
        {
          action: 'Kısayolları göster',
          keys: ['Ctrl', '/'],
          icon: <Keyboard className="h-4 w-4" />
        },
        {
          action: 'Özel talimatlar belirle',
          keys: ['Ctrl', 'Shift', 'I'],
          icon: <Command className="h-4 w-4" />
        }
      ]
    }
  ];

  const renderKey = (key: string) => {
    // Special key mapping for better display
    const keyMap: { [key: string]: string } = {
      'Ctrl': '⌃',
      'Shift': '⇧',
      'Alt': '⌥',
      'Cmd': '⌘',
      '⌫': '⌫'
    };

    return (
      <kbd className="inline-flex items-center justify-center h-6 px-2 text-xs font-medium text-muted-foreground bg-muted border border-border rounded min-w-[24px]">
        {keyMap[key] || key}
      </kbd>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-2xl border border-border/50 w-[90vw] max-w-[650px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Keyboard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold">Klavye kısayolları</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-8">
            {shortcuts.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {shortcut.icon && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                            {shortcut.icon}
                          </div>
                        )}
                        <span className="text-sm font-medium">{shortcut.action}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-xs text-muted-foreground mx-1">+</span>
                            )}
                            {renderKey(key)}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center p-6 border-t border-border/50 bg-muted/20">
          <p className="text-sm text-muted-foreground text-center">
            Bu kısayollar tüm platformlarda çalışır. 
            <br />
            Mac&apos;te {renderKey('Ctrl')} yerine {renderKey('⌘')} kullanın.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;