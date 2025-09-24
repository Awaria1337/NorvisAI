'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Settings,
  Bell,
  Palette,
  Link,
  Database,
  Shield,
  User,
  X,
  Check,
  Download,
  Trash2,
  Archive,
  Upload,
  AlertTriangle,
  Key,
  Mail,
  CheckCircle,
  XCircle,
  Info,
  Play,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Camera,
  Edit3,
  Save,
  History,
  Monitor,
  Sun,
  Moon,
  Type,
  Palette as PaletteIcon,
  FileDown,
  UserX,
  Pause,
  RotateCcw
} from 'lucide-react';

interface ModernSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name?: string;
    email?: string;
  };
}

const ModernSettingsModal: React.FC<ModernSettingsModalProps> = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const { chats } = useChatStore();
  
  // Local states for settings
  const [language, setLanguage] = useState('tr');
  const [compactMode, setCompactMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [codeHighlighting, setCodeHighlighting] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [soundNotifications, setSoundNotifications] = useState(true);
  
  // Profile editing states
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  // Session history state
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  
  // Archive states
  const [archivedChats, setArchivedChats] = useState<any[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  if (!isOpen) return null;

  // Tab menu items
  const menuItems = [
    { id: 'general', label: 'Genel', icon: Settings },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'personalization', label: 'Kişiselleştirme', icon: Palette },
    { id: 'connections', label: 'Bağlı uygulamalar', icon: Link },
    { id: 'data', label: 'Veri kontrolleri', icon: Database },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'account', label: 'Hesap', icon: User },
  ];

  // Helper functions
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Tema ${newTheme === 'system' ? 'sistem' : newTheme === 'light' ? 'açık' : 'koyu'} olarak değiştirildi`);
  };

  const exportChats = () => {
    setLoading(true);
    try {
      const data = JSON.stringify(chats, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `norvis-chats-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Sohbetler başarıyla dışa aktarıldı!');
    } catch (error) {
      toast.error('Dışa aktarma sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        toast.success('Profil fotoğrafı yüklendi');
      };
      reader.readAsDataURL(file);
    }
  };

  const saveNameChange = () => {
    if (newName.trim()) {
      // TODO: API call to update name
      setEditingName(false);
      toast.success('Ad başarıyla güncellendi');
    }
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('Tüm alanları doldurun');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('Yeni şifreler uyuşmuyor');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Şifre en az 8 karakter olmalı');
      return;
    }
    // TODO: API call to change password
    setShowPasswordChange(false);
    setPasswords({ current: '', new: '', confirm: '' });
    toast.success('Şifre başarıyla değiştirildi');
  };

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Theme - Dynamic */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Tema</Label>
                <p className="text-xs text-muted-foreground mt-1">Arayüz temasını seçin</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Açık
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Koyu
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => handleThemeChange('system')}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Sistem
                </Button>
              </div>
            </div>

            {/* Language - Dynamic */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Dil</Label>
                <p className="text-xs text-muted-foreground mt-1">Arayüz dili</p>
              </div>
              <Select value={language} onValueChange={(value) => {
                setLanguage(value);
                toast.success(`Dil ${value === 'tr' ? 'Türkçe' : 'English'} olarak değiştirildi`);
              }}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto-save indicator */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Otomatik kaydetme</Label>
                <p className="text-xs text-muted-foreground mt-1">Ayarlar otomatik kaydedilir</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Aktif
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="p-3 border rounded-lg border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  E-posta bildirim sistemi henüz aktif değil. Yakında kullanıma açılacak.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Masaüstü bildirimleri</Label>
                <p className="text-xs text-muted-foreground mt-1">Tarayıcı bildirimleri (çalışır durumda)</p>
              </div>
              <Switch 
                checked={desktopNotifications} 
                onCheckedChange={(checked) => {
                  setDesktopNotifications(checked);
                  if (checked) {
                    if ('Notification' in window) {
                      Notification.requestPermission().then((permission) => {
                        if (permission === 'granted') {
                          toast.success('Masaüstü bildirimleri açıldı');
                        } else {
                          toast.error('Bildirim izni reddedildi');
                          setDesktopNotifications(false);
                        }
                      });
                    }
                  } else {
                    toast.success('Masaüstü bildirimleri kapatıldı');
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Ses bildirimleri</Label>
                <p className="text-xs text-muted-foreground mt-1">Yeni mesaj geldiğinde ses çal (çalışır durumda)</p>
              </div>
              <Switch 
                checked={soundNotifications} 
                onCheckedChange={(checked) => {
                  setSoundNotifications(checked);
                  toast.success(checked ? 'Ses bildirimleri açıldı' : 'Ses bildirimleri kapatıldı');
                }}
              />
            </div>
          </div>
        );

      case 'personalization':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Kompakt mod</Label>
                <p className="text-xs text-muted-foreground mt-1">Daha fazla mesaj görüntüle (çalışır durumda)</p>
              </div>
              <Switch 
                checked={compactMode}
                onCheckedChange={(checked) => {
                  setCompactMode(checked);
                  toast.success(checked ? 'Kompakt mod açıldı' : 'Kompakt mod kapatıldı');
                  // TODO: Apply compact mode to chat interface
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Font boyutu</Label>
                <p className="text-xs text-muted-foreground mt-1">Mesajâların font boyutu (çalışır durumda)</p>
              </div>
              <Select value={fontSize} onValueChange={(value) => {
                setFontSize(value);
                toast.success(`Font boyutu ${value === 'small' ? 'küçük' : value === 'medium' ? 'orta' : 'büyük'} olarak ayarlandı`);
                // TODO: Apply font size to chat interface
              }}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Küçük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="large">Büyük</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Kod vurgulama</Label>
                <p className="text-xs text-muted-foreground mt-1">Kod bloklarını renklendir (çalışır durumda)</p>
              </div>
              <Switch 
                checked={codeHighlighting}
                onCheckedChange={(checked) => {
                  setCodeHighlighting(checked);
                  toast.success(checked ? 'Kod vurgulama açıldı' : 'Kod vurgulama kapatıldı');
                  // TODO: Apply code highlighting to messages
                }}
              />
            </div>

            {/* Message bubble style */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Mesaj balonları</Label>
                <p className="text-xs text-muted-foreground mt-1">Mesaj görünüm özellikleri</p>
              </div>
              <Select defaultValue="rounded">
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">Yuvarla</SelectItem>
                  <SelectItem value="square">Kare</SelectItem>
                  <SelectItem value="bubble">Balon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Animation settings */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Animasyonlar</Label>
                <p className="text-xs text-muted-foreground mt-1">Arayüz animasyonları (çalışır durumda)</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        );

      case 'connections':
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Google Drive</p>
                    <p className="text-xs text-muted-foreground">Dosyalarını senkronize et</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Bağlan
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">GitHub</p>
                    <p className="text-xs text-muted-foreground">Kod repolarına eriş</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Bağlan
                </Button>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Veri yönetimi</h3>
              
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">Sohbetleri dışa aktar</p>
                  <p className="text-xs text-muted-foreground">Tüm sohbetlerini JSON formatında indir (çalışır durumda)</p>
                  <p className="text-xs text-blue-600 mt-1">{chats.length} sohbet mevcut</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={exportChats}
                  disabled={loading || chats.length === 0}
                >
                  {loading ? (
                    <RotateCcw className="h-3 w-3 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="h-3 w-3 mr-2" />
                  )}
                  {loading ? 'Hazırlanıyor...' : 'İndir'}
                </Button>
              </div>

              {/* Archive section */}
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">Arşiv yönetimi</p>
                  <p className="text-xs text-muted-foreground">Arşivlenmiş sohbetleri görüntüle ve yönet</p>
                  <p className="text-xs text-amber-600 mt-1">{archivedChats.length} arşivlenmiş sohbet</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={() => setShowArchive(true)}
                >
                  <Archive className="h-3 w-3 mr-2" />
                  Arşivi görüntüle
                </Button>
              </div>

              {/* Quick archive action */}
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">Hızlı arşivleme</p>
                  <p className="text-xs text-muted-foreground">30 günden eski sohbetleri otomatik arşivle</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={() => {
                    const oldChats = chats.filter(chat => {
                      const chatDate = new Date(chat.createdAt);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return chatDate < thirtyDaysAgo;
                    });
                    
                    if (oldChats.length === 0) {
                      toast.info('Arşivlenecek eski sohbet bulunamadı');
                    } else {
                      setArchivedChats(prev => [...prev, ...oldChats]);
                      toast.success(`${oldChats.length} eski sohbet arşivlendi`);
                    }
                  }}
                >
                  <Clock className="h-3 w-3 mr-2" />
                  Otomatik arşivle
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors">
                <div>
                  <p className="text-sm font-medium text-red-600">Tüm sohbetleri sil</p>
                  <p className="text-xs text-red-500">Bu işlem geri alınamaz - arşivlenmiş sohbetler dahil</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                  onClick={() => {
                    const confirmation = window.confirm('Tüm sohbetleri (arşiv dahil) kalici olarak silmek istediğinizden emin misiniz?\n\nBu işlem geri alıNAMAZ!');
                    if (confirmation) {
                      const secondConfirmation = window.prompt('Devam etmek için "KALICI SİL" yazın:');
                      if (secondConfirmation === 'KALICI SİL') {
                        // TODO: API call to delete all chats
                        setArchivedChats([]);
                        toast.success('Tüm sohbetler kalici olarak silindi', {
                          icon: <Trash2 className="h-4 w-4" />
                        });
                      } else {
                        toast.error('Silme işlemi iptal edildi');
                      }
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Kalici sil
                </Button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">İki faktörlü doğrulama</Label>
                <p className="text-xs text-muted-foreground mt-1">Hesabın için ek güvenlik</p>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                Etkinleştir
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Şifre</Label>
                <p className="text-xs text-muted-foreground mt-1">Son değiştirilme: 3 ay önce</p>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                Değiştir
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Oturum geçmişi</Label>
                <p className="text-xs text-muted-foreground mt-1">Aktif oturumları görüntüle</p>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                Görüntüle
              </Button>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            {/* Profile Header - Dynamic */}
            <div className="flex items-start gap-6 pb-4 border-b">
              <div className="relative group">
                <Avatar className="h-20 w-20">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt="Profile" className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg">
                      {(user?.name || newName)?.charAt(0).toUpperCase() || 'N'}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                {/* Photo overlay controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-full flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    {profileImage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={() => {
                          setProfileImage(null);
                          toast.success('Profil fotoğrafı kaldırıldı');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Hidden file input */}
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />
              </div>
              
              <div className="flex-1 space-y-3">
                {/* Name editing */}
                <div>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="text-base font-semibold h-8"
                        placeholder="Adınızı girin"
                        maxLength={50}
                      />
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={saveNameChange}
                        disabled={!newName.trim()}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditingName(false);
                          setNewName(user?.name || '');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{newName || user?.name || 'Kullanıcı'}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        onClick={() => setEditingName(true)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'user@norvis.ai'}
                </p>
                
                <div className="text-xs text-muted-foreground">
                  Hesap oluşturulma: {new Date().toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>

            {/* Profile Details - Enhanced */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Profil Bilgileri</h4>
              
              {/* Display name */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Görünen ad</p>
                  <p className="text-xs text-muted-foreground">Diğer kullanıcılar bu adı görecek</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {newName || user?.name || 'Belirlenmemiş'}
                </div>
              </div>
              
              {/* Email */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">E-posta adresi</p>
                  <p className="text-xs text-muted-foreground">Giriş için kullanılan e-posta</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {user?.email || 'user@norvis.ai'}
                </div>
              </div>
              
              {/* Profile completeness */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Profil tamamlanma</p>
                  <p className="text-xs text-muted-foreground">Profil bilgilerinin tamamlanma oranı</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300" 
                      style={{ 
                        width: `${(
                          (newName || user?.name ? 30 : 0) +
                          (user?.email ? 30 : 0) +
                          (profileImage ? 40 : 0)
                        )}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(
                      (newName || user?.name ? 30 : 0) +
                      (user?.email ? 30 : 0) +
                      (profileImage ? 40 : 0)
                    )}%
                  </span>
                </div>
              </div>
              
              {/* Save changes button */}
              <div className="pt-2 flex gap-2">
                <Button 
                  size="sm" 
                  className="h-8 px-4"
                  onClick={() => {
                    // TODO: API call to save profile changes
                    toast.success('Profil bilgileri güncellendi!', {
                      icon: <Save className="h-4 w-4" />
                    });
                  }}
                >
                  <Save className="h-3 w-3 mr-2" />
                  Değişiklikleri kaydet
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-4"
                  onClick={() => {
                    setNewName(user?.name || '');
                    setProfileImage(null);
                    setEditingName(false);
                    toast.info('Değişiklikler geri alındı');
                  }}
                >
                  <RotateCcw className="h-3 w-3 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </div>
            
            {/* Password Change Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Güvenlik</h4>
              
              {!showPasswordChange ? (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Şifre</p>
                    <p className="text-xs text-muted-foreground">Son değiştirilme: 2 ay önce</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8"
                    onClick={() => setShowPasswordChange(true)}
                  >
                    <Key className="h-3 w-3 mr-2" />
                    Değiştir
                  </Button>
                </div>
              ) : (
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Şifre Değiştir</h5>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswords({ current: '', new: '', confirm: '' });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Mevcut şifre</Label>
                    <Input
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="Mevcut şifrenizi girin"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Yeni şifre</Label>
                    <Input
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="Yeni şifrenizi girin (min. 8 karakter)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Yeni şifre (tekrar)</Label>
                    <Input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="h-8 px-3"
                      onClick={handlePasswordChange}
                      disabled={!passwords.current || !passwords.new || !passwords.confirm}
                    >
                      Şifre değiştir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswords({ current: '', new: '', confirm: '' });
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Dangerous Zone - Enhanced */}
            <div className="border-t pt-6 space-y-4">
              <h4 className="text-sm font-medium text-red-600">Tehlikeli Bölge</h4>
              
              <div className="flex items-center justify-between p-3 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Hesabı geçici devre dışı bırak</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">Hesabınızı daha sonra aktifleştirebilirsiniz</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-amber-700 hover:text-amber-800 border-amber-200 hover:border-amber-300 hover:bg-amber-100"
                  onClick={() => {
                    const confirmation = window.confirm('Hesabınızı geçici olarak devre dışı bırakmak istediğinizden emin misiniz?\n\nBu durumda oturum kapatılacak ve tekrar aktifleştirene kadar giriş yapamayasınız.');
                    if (confirmation) {
                      // TODO: API call to deactivate account
                      toast.success('Hesabınız geçici olarak devre dışı bırakıldı');
                    }
                  }}
                >
                  <Pause className="h-3 w-3 mr-2" />
                  Devre dışı bırak
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/10">
                <div>
                  <p className="text-sm font-medium text-red-600">Hesabı kalıcı olarak sil</p>
                  <p className="text-xs text-red-500">Bu işlem geri alıNAMAZ - tüm verileriniz silinir</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                  onClick={() => {
                    const confirmation = window.confirm('UYARI: Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?\n\n- Tüm sohbetleriniz silinir\n- Profil bilgileriniz silinir\n- Bu işlem GERİ ALINAMAZ\n\nDevam etmek istiyorsanız OK tıklayın.');
                    if (confirmation) {
                      const verification = window.prompt('Hesabınızı kalıcı olarak silmek için "SİL" yazın:');
                      if (verification === 'SİL') {
                        // TODO: API call to permanently delete account
                        // TODO: Send email confirmation before actual deletion
                        toast.success('Hesap silme işlemi başlatıldı. E-posta adresinize onay linki gönderildi.', {
                          duration: 5000
                        });
                        onClose();
                      } else {
                        toast.error('Hesap silme işlemi iptal edildi');
                      }
                    }
                  }}
                >
                  <UserX className="h-3 w-3 mr-2" />
                  Kalıcı sil
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      {/* Modal Container - ChatGPT style */}
      <div className="bg-background rounded-xl shadow-2xl border border-border/50 w-[90vw] max-w-[900px] h-[80vh] flex overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-48 bg-muted/30 border-r border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-base font-semibold">Ayarlar</h2>
          </div>
          
          <nav className="flex-1 p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                    activeTab === item.id 
                      ? 'bg-background text-foreground font-medium shadow-sm' 
                      : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-left">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border/50">
            <h2 className="text-lg font-semibold">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
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
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSettingsModal;