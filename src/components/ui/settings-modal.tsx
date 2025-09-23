'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import toast from 'react-hot-toast';
import {
  X,
  User,
  Bell,
  Lock,
  Database,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  Settings,
  Archive,
  FileText,
  Shield,
  Key,
  Globe,
  Mail,
  Palette,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const { chats, setChats } = useChatStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDeleteAllChats = async () => {
    if (!window.confirm('Tüm sohbetleriniz kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      // Delete all chats via API
      for (const chat of chats) {
        await fetch(`/api/chats/${chat.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Clear local state
      setChats([]);
      
      toast.success('Tüm sohbetler başarıyla silindi', {
        icon: <CheckCircle className="w-4 h-4" />,
        duration: 3000,
      });
    } catch (error) {
      toast.error('Sohbetler silinirken hata oluştu', {
        icon: <AlertTriangle className="w-4 h-4" />,
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveAllChats = async () => {
    setIsArchiving(true);
    try {
      // Archive all chats logic would go here
      toast.success('Tüm sohbetler arşivlendi', {
        icon: <Archive className="w-4 h-4" />,
        duration: 3000,
      });
    } catch (error) {
      toast.error('Arşivleme sırasında hata oluştu', {
        icon: <AlertTriangle className="w-4 h-4" />,
        duration: 4000,
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Export data logic would go here
      const dataToExport = {
        chats: chats,
        user: user,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `norvis-ai-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Verileriniz başarıyla dışa aktarıldı', {
        icon: <Download className="w-4 h-4" />,
        duration: 3000,
      });
    } catch (error) {
      toast.error('Dışa aktarma sırasında hata oluştu', {
        icon: <AlertTriangle className="w-4 h-4" />,
        duration: 4000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const menuItems = [
    {
      id: 'general',
      title: 'Genel',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'notifications',
      title: 'Bildirimler',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: 'personalization',
      title: 'Kişiselleştirme',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'connections',
      title: 'Bağlı uygulamalar',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'data',
      title: 'Veri kontrolleri',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'security',
      title: 'Güvenlik',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'account',
      title: 'Hesap',
      icon: <User className="w-4 h-4" />,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4 max-w-3xl">
            {/* Theme */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Tema</div>
              </div>
              <select className="bg-background border border-input rounded-md px-3 py-2 text-sm min-w-[120px] h-8">
                <option>Sistem</option>
                <option>Açık</option>
                <option>Koyu</option>
              </select>
            </div>
            
            <div className="border-t border-border/50"></div>
            
            {/* Accent Color */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Vurgu rengi</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                <select className="bg-background border border-input rounded-md px-3 py-2 text-sm min-w-[100px] h-8">
                  <option>Varsayılan</option>
                  <option>Mavi</option>
                  <option>Yeşil</option>
                </select>
              </div>
            </div>
            
            <div className="border-t border-border/50"></div>
            
            {/* Language */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Dil</div>
              </div>
              <select className="bg-background border border-input rounded-md px-3 py-2 text-sm min-w-[140px] h-8">
                <option>Otomatik algıla</option>
                <option>Türkçe</option>
                <option>English</option>
              </select>
            </div>
            
            <div className="border-t border-border/50"></div>
            
            {/* Speech Language */}
            <div className="flex items-start justify-between py-3">
              <div className="flex-1">
                <div className="font-medium text-sm">Konuşulan dil</div>
                <div className="text-xs text-muted-foreground mt-1 pr-4">
                  En iyi sonucu almak için ana dilinizi seç; Listede görünmüyorsa da otomatik algılama yoluyla desteklenebilir.
                </div>
              </div>
              <select className="bg-background border border-input rounded-md px-3 py-2 text-sm min-w-[140px] h-8 flex-shrink-0">
                <option>Otomatik algıla</option>
                <option>Türkçe</option>
                <option>English</option>
              </select>
            </div>
            
            <div className="border-t border-border/50"></div>
            
            {/* Voice */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Ses</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  ▶️
                </Button>
                <select className="bg-background border border-input rounded-md px-3 py-2 text-sm min-w-[100px] h-8">
                  <option>Vale</option>
                  <option>Onyx</option>
                  <option>Shimmer</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Bildirim ayarları</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email bildirimleri</span>
                  <Button variant="outline" size="sm">Açık</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Masaüstü bildirimleri</span>
                  <Button variant="outline" size="sm">Kapalı</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ses bildirimleri</span>
                  <Button variant="outline" size="sm">Açık</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'personalization':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Tema seçimi</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Açık
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Koyu
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  Sistem
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Dil ayarları</h3>
              <Button variant="outline" size="sm">
                Türkçe (TR)
              </Button>
            </div>
          </div>
        );

      case 'connections':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">API Bağlantıları</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">OpenAI</p>
                      <p className="text-xs text-muted-foreground">GPT-4, GPT-3.5 Turbo</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Bağla</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Anthropic</p>
                      <p className="text-xs text-muted-foreground">Claude 3, Claude 2</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Bağla</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            {/* Shared Links */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Paylaşılan bağlantılar</div>
              </div>
              <Button variant="outline" size="sm" className="h-10 px-4">
                Yönet
              </Button>
            </div>
            
            <div className="border-t border-border/50"></div>
            
            {/* Archive */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Arşivlenmiş sohbetler</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4"
                onClick={handleArchiveAllChats}
                disabled={isArchiving}
              >
                {isArchiving ? 'Yükleniyor...' : 'Yönet'}
              </Button>
            </div>
            
            <div className="border-t border-border/50"></div>
            
            {/* Archive All */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Tüm sohbetleri arşivle</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4"
                onClick={handleArchiveAllChats}
                disabled={isArchiving}
              >
                {isArchiving ? 'Arşivleniyor...' : 'Tümünü arşivle'}
              </Button>
            </div>
            
            <div className="border-t border-border/50"></div>
            
            {/* Export */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Verileri dışarı aktar</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? 'Hazırlanıyor...' : 'Dışarı aktar'}
              </Button>
            </div>
            
            <div className="border-t border-border/50 border-red-200 dark:border-red-800"></div>
            
            {/* Danger Zone */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm text-red-600">Tüm sohbetleri sil</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="h-10 px-4 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                onClick={handleDeleteAllChats}
                disabled={isDeleting}
              >
                {isDeleting ? 'Siliniyor...' : 'Tümünü sil'}
              </Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Şifre değiştir</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentPassword">Mevcut şifre</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">Yeni şifre</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Yeni şifreyi onayla</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button size="sm">Şifreyi güncelle</Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">İki faktörlü doğrulama</h3>
              <Button variant="outline" size="sm">
                Etkinleştir
              </Button>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-4 max-w-3xl">
            {/* Profile Header */}
            <div className="flex items-center gap-4 py-3 border-b border-border/50">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'Z'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{user?.name || 'Zileli Mert'}</h3>
                <p className="text-xs text-muted-foreground">
                  {user?.email || 'zilelimert38@gmail.com'}
                </p>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm">Ad</div>
                </div>
                <Input 
                  defaultValue={user?.name || 'Zileli Mert'} 
                  className="h-8 text-sm w-48 text-right bg-transparent border-0 focus:border focus:bg-background"
                />
              </div>
              
              <div className="border-t border-border/50"></div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm">E-posta</div>
                </div>
                <Input 
                  defaultValue={user?.email || 'zilelimert38@gmail.com'} 
                  disabled 
                  className="h-8 text-sm w-48 text-right bg-transparent border-0 text-muted-foreground"
                />
              </div>
              
              <div className="border-t border-border/50"></div>
              
              <div className="flex justify-start py-3">
                <Button size="sm" className="h-8 px-4">
                  Profili güncelle
                </Button>
              </div>
            </div>
            
            <div className="border-t border-red-200 dark:border-red-800 my-4"></div>

            {/* Dangerous Zone */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm text-red-600">Hesabı geçici olarak devre dışı bırak</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  Devre dışı bırak
                </Button>
              </div>
              
              <div className="border-t border-red-200 dark:border-red-800"></div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm text-red-600">Hesabı kalıcı olarak sil</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  onClick={() => {
                    if (window.confirm('Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?')) {
                      // Delete account logic here
                    }
                  }}
                >
                  Hesabı sil
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1400px] w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-[10vh] min-h-[700px]">
          {/* Sidebar */}
          <div className="w-56 bg-muted/10 p-4 border-r border-border/30">
            <div className="mb-4">
              <DialogTitle className="text-base font-semibold">Ayarlar</DialogTitle>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start h-8 px-3 text-sm font-normal transition-colors ${
                    activeTab === item.id 
                      ? 'bg-muted text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="flex items-center justify-center w-4 h-4 mr-2">
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </Button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-6 text-foreground">
                {menuItems.find(item => item.id === activeTab)?.title}
              </h2>
              {renderContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;