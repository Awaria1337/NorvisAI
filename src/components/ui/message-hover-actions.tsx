'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'

interface MessageHoverActionsProps {
  messageId: string
  content: string
  onEdit: (messageId: string) => void
  className?: string
}

const MessageHoverActions: React.FC<MessageHoverActionsProps> = ({
  messageId,
  content,
  onEdit,
  className = ''
}) => {
  // Copy message handler
  const handleCopyMessage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(content)
      toast.success('Mesaj panoya kopyalandı!')
    } catch (error) {
      toast.error('Kopyalama başarısız!')
    }
  }

  // Edit message handler
  const handleEditMessage = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(messageId)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Copy Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={handleCopyMessage}
        title="Kopyala"
      >
        <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
      </Button>

      {/* Edit Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={handleEditMessage}
        title="Düzenle"
      >
        <Edit3 className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
      </Button>
    </div>
  )
}

export default MessageHoverActions