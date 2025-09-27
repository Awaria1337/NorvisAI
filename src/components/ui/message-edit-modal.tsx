'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface MessageEditModalProps {
  isOpen: boolean
  onClose: () => void
  originalMessage: string
  onSave: (newMessage: string) => void
}

const MessageEditModal: React.FC<MessageEditModalProps> = ({
  isOpen,
  onClose,
  originalMessage,
  onSave
}) => {
  const [editedMessage, setEditedMessage] = useState(originalMessage)

  // Update edited message when original changes
  useEffect(() => {
    setEditedMessage(originalMessage)
  }, [originalMessage])

  const handleSave = () => {
    if (editedMessage.trim() && editedMessage.trim() !== originalMessage.trim()) {
      onSave(editedMessage.trim())
    }
    onClose()
  }

  const handleCancel = () => {
    setEditedMessage(originalMessage)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mesajı Düzenle</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı düzenleyin..."
            className="min-h-[120px] resize-none"
            autoFocus
          />
          
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+Enter</kbd> ile kaydet, 
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-2">Esc</kbd> ile iptal et
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editedMessage.trim() || editedMessage.trim() === originalMessage.trim()}
          >
            Kaydet ve Yeniden Sor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MessageEditModal