'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Clock
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

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Tema</Label>
              <Select defaultValue="system">
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Sistem</SelectItem>
                  <SelectItem value="light">Açık</SelectItem>
                  <SelectItem value="dark">Koyu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Accent Color */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Vurgu rengi</Label>
              <Select defaultValue="default">
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Varsayılan</SelectItem>
                  <SelectItem value="blue">Mavi</SelectItem>
                  <SelectItem value="purple">Mor</SelectItem>
                  <SelectItem value="green">Yeşil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Dil</Label>
              <Select defaultValue="auto">
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Otomatik algıla</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Speech Language */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Konuşulan dil</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  En iyi sonucu almak için ana dilini seç. Listede görünmüyorsa da otomatik algılama yoluyla desteklenebilir.
                </p>
              </div>
              <Select defaultValue="auto">
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Otomatik algıla</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Ses</Label>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Play className="h-4 w-4" />
                </Button>
                <Select defaultValue="vale">
                  <SelectTrigger className="w-32 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vale">Vale</SelectItem>
                    <SelectItem value="sky">Sky</SelectItem>
                    <SelectItem value="breeze">Breeze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">E-posta bildirimleri</Label>
                <p className="text-xs text-muted-foreground mt-1">Önemli güncellemeler için e-posta al</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Masaüstü bildirimleri</Label>
                <p className="text-xs text-muted-foreground mt-1">Tarayıcı bildirimleri</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Ses bildirimleri</Label>
                <p className="text-xs text-muted-foreground mt-1">Yeni mesaj geldiğinde ses çal</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        );

      case 'personalization':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Kompakt mod</Label>
                <p className="text-xs text-muted-foreground mt-1">Daha fazla mesaj görüntüle</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Font boyutu</Label>
              <Select defaultValue="medium">
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
                <p className="text-xs text-muted-foreground mt-1">Kod bloklarını renklendir</p>
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
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Sohbetleri dışa aktar</p>
                  <p className="text-xs text-muted-foreground">Tüm sohbetlerini JSON formatında indir</p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="h-3 w-3 mr-2" />
                  İndir
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Sohbetleri arşivle</p>
                  <p className="text-xs text-muted-foreground">Eski sohbetleri arşive taşı</p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  <Archive className="h-3 w-3 mr-2" />
                  Arşivle
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 dark:border-red-900">
                <div>
                  <p className="text-sm font-medium text-red-600">Tüm sohbetleri sil</p>
                  <p className="text-xs text-red-500">Bu işlem geri alınamaz</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  onClick={() => {
                    if (window.confirm('Tüm sohbetleri silmek istediğinizden emin misiniz?')) {
                      toast.success('Tüm sohbetler silindi', {
                        icon: <CheckCircle className="h-4 w-4" />
                      });
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Sil
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
            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Ad</Label>
                <Input 
                  defaultValue={user?.name || 'Zileli Mert'} 
                  className="w-48 h-8 text-sm"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">E-posta</Label>
                <Input 
                  defaultValue={user?.email || 'zilelimert38@gmail.com'} 
                  disabled 
                  className="w-48 h-8 text-sm"
                />
              </div>
              
              <div className="pt-2">
                <Button size="sm" className="h-8 px-4">
                  Profili güncelle
                </Button>
              </div>
            </div>
            
            {/* Dangerous Zone */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-600">Hesabı geçici olarak devre dışı bırak</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  Devre dışı bırak
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-600">Hesabı kalıcı olarak sil</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  onClick={() => {
                    if (window.confirm('Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?')) {
                      // Delete account logic
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
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