'use client'

import React, { useState, useEffect } from 'react'
import { Search, MessageSquare, Clock, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/store/chatStore'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onChatSelect: (chatId: string) => void
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onChatSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { chats } = useChatStore()
  
  // Filter chats based on search query
  const filteredChats = chats.filter(chat => {
    const titleMatch = chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    const messageMatch = chat.messages?.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return titleMatch || messageMatch
  })

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
      if (e.key === 'Enter' && filteredChats.length > 0 && searchQuery) {
        handleChatClick(filteredChats[0].id)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, searchQuery, filteredChats, onClose])

  const handleChatClick = (chatId: string) => {
    onChatSelect(chatId)
    onClose()
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const chatDate = new Date(date)
    const diffTime = Math.abs(now.getTime() - chatDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Bugün'
    if (diffDays === 2) return 'Dün'
    if (diffDays <= 7) return `${diffDays} gün önce`
    return chatDate.toLocaleDateString('tr-TR')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[80vh] p-0 gap-0 bg-background border shadow-lg rounded-lg overflow-hidden">
        <DialogTitle className="sr-only">Sohbetleri Ara</DialogTitle>
        {/* Search Header */}
        <div className="p-4 border-b bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sohbetleri ara..."
              className="pl-10 pr-4 h-11 text-base rounded-md"
              autoFocus
            />
          </div>
          
          {/* Search Stats */}
          {searchQuery && (
            <div className="mt-3 text-sm text-muted-foreground">
              <span>{filteredChats.length} sonuç bulundu</span>
            </div>
          )}
        </div>

        {/* Search Results */}
        <ScrollArea className="flex-1 max-h-[400px]">
          <div className="p-4">
            {searchQuery === '' ? (
              /* Recent Chats */
              <div>
                <div className="space-y-1">
                  {chats.slice(0, 8).map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground group-hover:text-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">
                            {chat.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(chat.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Search Results */
              <div>
                {filteredChats.length > 0 ? (
                  <div className="space-y-1">
                    {filteredChats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleChatClick(chat.id)}
                        className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors group"
                      >
                        <div className="flex items-start space-x-3">
                          <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground group-hover:text-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground">
                              {chat.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDate(chat.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-foreground mb-2">
                      Sonuç bulunamadı
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      &ldquo;{searchQuery}&rdquo; için eşleşen sohbet bulunamadı
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  )
}

export default SearchModal