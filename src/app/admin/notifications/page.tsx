'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Plus, Send, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  targetType: string;
  targetSegment: string | null;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  createdBy: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO',
    targetType: 'ALL_USERS',
    targetSegment: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/notifications?status=${statusFilter}`);
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data.notifications);
      }
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.message) {
      alert('Başlık ve mesaj gerekli!');
      return;
    }

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        alert('Bildirim oluşturuldu!');
        setShowCreateModal(false);
        setFormData({ title: '', message: '', type: 'INFO', targetType: 'ALL_USERS', targetSegment: '' });
        fetchNotifications();
      }
    } catch (error) {
      console.error('Bildirim oluşturulamadı:', error);
      alert('Bildirim oluşturulamadı!');
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Bu bildirimi şimdi göndermek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send' })
      });

      const result = await response.json();
      if (result.success) {
        alert('Bildirim gönderildi!');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu bildirimi silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        alert('Bildirim silindi!');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Bildirim silinemedi:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'ERROR': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      SENT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const getTargetText = (targetType: string, segment: string | null) => {
    if (targetType === 'ALL_USERS') return 'Tüm Kullanıcılar';
    if (targetType === 'PREMIUM_USERS') return 'Premium Kullanıcılar';
    if (targetType === 'FREE_USERS') return 'Ücretsiz Kullanıcılar';
    if (targetType === 'SEGMENT' && segment) return `Segment: ${segment}`;
    return targetType;
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bildirimler</h2>
            <p className="text-muted-foreground">Kullanıcılara bildirim gönderin ve yönetin</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Bildirim
          </Button>
        </div>

        {/* Filtreler */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filtreler</CardTitle>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Tümü</option>
                <option value="DRAFT">Taslak</option>
                <option value="SCHEDULED">Zamanlanmış</option>
                <option value="SENT">Gönderildi</option>
              </select>
            </div>
          </CardHeader>
        </Card>

        {/* Bildirimler Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Tüm Bildirimler</CardTitle>
            <CardDescription>{notifications.length} bildirim bulundu</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="h-5 bg-muted animate-pulse rounded w-48 mb-2"></div>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Henüz bildirim yok</p>
                <p className="text-sm text-muted-foreground">İlk bildiriminizi oluşturun</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(notification.type)}
                          <h3 className="font-semibold">{notification.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(notification.status)}`}>
                            {notification.status === 'DRAFT' && 'Taslak'}
                            {notification.status === 'SCHEDULED' && 'Zamanlanmış'}
                            {notification.status === 'SENT' && 'Gönderildi'}
                            {notification.status === 'FAILED' && 'Başarısız'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Hedef: {getTargetText(notification.targetType, notification.targetSegment)}</span>
                          <span>Oluşturma: {new Date(notification.createdAt).toLocaleDateString('tr-TR')}</span>
                          {notification.sentAt && (
                            <span>Gönderim: {new Date(notification.sentAt).toLocaleDateString('tr-TR')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {notification.status === 'DRAFT' && (
                          <Button size="sm" onClick={() => handleSend(notification.id)}>
                            <Send className="h-4 w-4 mr-1" />
                            Gönder
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(notification.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Yeni Bildirim Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Yeni Bildirim Oluştur</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Başlık</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Bildirim başlığı"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Mesaj</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Bildirim mesajı"
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tip</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="INFO">Bilgi</option>
                      <option value="SUCCESS">Başarı</option>
                      <option value="WARNING">Uyarı</option>
                      <option value="ERROR">Hata</option>
                      <option value="MAINTENANCE">Bakım</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Hedef Kitle</label>
                    <select
                      value={formData.targetType}
                      onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="ALL_USERS">Tüm Kullanıcılar</option>
                      <option value="PREMIUM_USERS">Premium Kullanıcılar</option>
                      <option value="FREE_USERS">Ücretsiz Kullanıcılar</option>
                      <option value="SEGMENT">Özel Segment</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Oluştur
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
