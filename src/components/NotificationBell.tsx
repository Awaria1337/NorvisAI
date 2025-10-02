'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Info, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  sentAt: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unreadCount);
      }
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      // Update local state
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Bildirim işaretlenemedi:', error);
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'MAINTENANCE':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-950/30 border-green-800/50';
      case 'WARNING':
        return 'bg-yellow-950/30 border-yellow-800/50';
      case 'ERROR':
        return 'bg-red-950/30 border-red-800/50';
      case 'MAINTENANCE':
        return 'bg-orange-950/30 border-orange-800/50';
      default:
        return 'bg-[#1a1b1e] border-[rgba(255, 255, 255, 0.1)]';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="notify-c9EMKlws absolute right-0 mt-2 w-80 sm:w-96 bg-[#1a1b1e] rounded-lg shadow-xl border border-gray-800 z-50 max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="font-semibold text-lg text-white">Bildirimler</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-white hover:text-blue-300 font-medium"
              >
                Tümünü Temizle
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 border border-gray-800 rounded-lg">
                    <div className="h-4 bg-gray-800 animate-pulse rounded mb-2"></div>
                    <div className="h-3 bg-gray-800 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="h-12 w-12 text-gray-700 mb-3" />
                <p className="text-sm font-medium text-white">
                  Yeni bildiriminiz yok
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Yeni bildirimler burada görünecek
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative p-3 rounded-lg border transition-colors hover:shadow-sm ${getTypeColor(notification.type)}`}
                  >
                    {/* Close button */}
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
                      aria-label="Kapat"
                    >
                      <X className="h-3 w-3 text-gray-400 hover:text-white" />
                    </button>

                    <div className="flex gap-3 pr-6">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white mb-1 pr-2">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.sentAt || notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-white hover:text-gray-400 font-medium py-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                Tümünü Gör
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
