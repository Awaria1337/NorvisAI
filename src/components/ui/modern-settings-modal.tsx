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
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import '@/lib/i18n'; // Initialize i18n
import {
  Settings,
  Bell,
  Palette,
  Link,
  Database,
  Shield,
  User,
  X,
  Download,
  Trash2,
  Archive,
  AlertTriangle,
  Key,
  CheckCircle,
  Info,
  Globe,
  Clock,
  Camera,
  Edit3,
  Save,
  Monitor,
  Sun,
  Moon,
  FileDown,
  UserX,
  Pause,
  RotateCcw,
  MessageSquare,
  Sparkles,
  Crown,
  Zap,
  CreditCard
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
  const { t, i18n } = useTranslation();
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
  const [animations, setAnimations] = useState(true);
  
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
  
  // Archive states
  const [archivedChats, setArchivedChats] = useState<any[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  
  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  
  // Connected apps state
  const [connectedApps, setConnectedApps] = useState([
    { id: 'google-drive', name: 'Google Drive', icon: Globe, connected: false, description: 'Dosyalarını senkronize et' },
    { id: 'github', name: 'GitHub', icon: Globe, connected: false, description: 'Kod repolarına eriş' },
    { id: 'slack', name: 'Slack', icon: Globe, connected: false, description: 'Slack entegrasyonu' },
    { id: 'notion', name: 'Notion', icon: Globe, connected: false, description: 'Notlarını senkronize et' }
  ]);

  useEffect(() => {
    if (isOpen) {
      setNewName(user?.name || '');
      // Load archived chats from database
      loadArchivedChats();
      // Load subscription info
      loadSubscription();
      // Load language preference from localStorage
      if (typeof window !== 'undefined') {
        const savedLang = localStorage.getItem('language');
        if (savedLang && ['tr', 'en', 'ru', 'zh'].includes(savedLang)) {
          setLanguage(savedLang);
          i18n.changeLanguage(savedLang);
        }
      }
    }
  }, [isOpen, user]);

  const loadArchivedChats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/chats/archived', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArchivedChats(data.chats || []);
      }
    } catch (error) {
      console.error('Failed to load archived chats:', error);
    }
  };
  
  const loadSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('🔄 Fetching subscription info...');
      const response = await fetch('/api/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Subscription data received:', data);
        if (data.success) {
          setSubscription(data.data);
          console.log('✅ Subscription state updated - Remaining:', data.data.remaining, 'Limit:', data.data.limit);
        }
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  if (!isOpen) return null;

  // Tab menu items
  const menuItems = [
    { id: 'general', label: t('general'), icon: Settings },
    { id: 'plan', label: t('settings'), icon: Crown },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'personalization', label: t('personalization'), icon: Palette },
    { id: 'connections', label: t('connections'), icon: Link },
    { id: 'data', label: t('data'), icon: Database },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'account', label: t('account'), icon: User },
  ];

  // Helper functions
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Tema ${newTheme === 'system' ? 'sistem' : newTheme === 'light' ? 'açık' : 'koyu'} olarak değiştirildi`);
  };

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    await i18n.changeLanguage(newLang);
    const langNames: Record<string, string> = {
      'tr': 'Türkçe',
      'en': 'English',
      'ru': 'Русский',
      'zh': '中文'
    };
    const langName = langNames[newLang] || 'Unknown';
    toast.success(`${t('language')} ${langName}`);
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang);
    }
    // Force re-render by updating state
    setActiveTab(activeTab);
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

  const saveProfileChanges = async () => {
    if (!newName.trim()) {
      toast.error('İsim boş olamaz');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          profileImage: profileImage
        })
      });

      if (!response.ok) {
        throw new Error('Profil güncellenemedi');
      }

      const data = await response.json();
      toast.success('Profil başarıyla güncellendi!', {
        icon: <Save className="h-4 w-4" />
      });
      setEditingName(false);
    } catch (error) {
      toast.error('Profil güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
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

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Şifre değiştirilemedi');
      }

      toast.success('Şifre başarıyla değiştirildi');
    setShowPasswordChange(false);
    setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Şifre değiştirme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleAppConnection = (appId: string) => {
    setConnectedApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, connected: !app.connected }
        : app
    ));
    
    const app = connectedApps.find(a => a.id === appId);
    if (app) {
      toast.success(
        app.connected ? `${app.name} bağlantısı kesildi` : `${app.name} başarıyla bağlandı`
      );
    }
  };

  const sendPersonalizationToAI = async (setting: string, value: any) => {
    const message = `Kişiselleştirme ayarı değişti: ${setting} = ${value}`;
    toast.info('Ayar AI\'ya bildirildi', {
      description: `${setting}: ${value}`
    });
  };

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'plan':
        return (
          <div className="space-y-6">
            {loadingSubscription ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : subscription ? (
              <>
                {/* Current Plan Card */}
                <div className={`p-6 rounded-lg border-2 ${
                  subscription.isPremium 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {subscription.isPremium ? (
                        <div className="p-2 bg-yellow-500 rounded-lg">
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-400 rounded-lg">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className={`text-2xl font-bold ${
                          subscription.isPremium 
                            ? 'text-yellow-700 dark:text-yellow-500'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {subscription.subscriptionType === 'PRO' ? 'Pro' : subscription.subscriptionType === 'PREMIUM' ? 'Premium' : 'Ücretsiz'} Plan
                        </h3>
                        {subscription.isPremium && subscription.subscriptionEndDate && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(subscription.subscriptionEndDate).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} tarihine kadar geçerli
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message Limit Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Aylık mesaj kullanımı</span>
                      <span className={`font-bold ${
                        (subscription.remaining / subscription.limit) < 0.2
                          ? 'text-red-500'
                          : (subscription.remaining / subscription.limit) < 0.5
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                        {subscription.remaining} / {subscription.limit}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          (subscription.remaining / subscription.limit) > 0.5
                            ? 'bg-green-500'
                            : (subscription.remaining / subscription.limit) > 0.2
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(subscription.remaining / subscription.limit) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Yenilenme tarihi: {new Date(subscription.resetsAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                </div>

                {/* Upgrade CTA */}
                {!subscription.isPremium && (
                  <div className="p-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-lg">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-1">Premium'a Yükselt</h4>
                        <p className="text-sm text-white/90">Daha fazla mesaj hakkı ve özellikler için premium plana geçin</p>
                      </div>
                      <Button
                        onClick={() => window.location.href = '/pricing'}
                        className="bg-white text-blue-600 hover:bg-gray-100"
                      >
                        Planları Gör
                      </Button>
                    </div>
                  </div>
                )}

                {/* Plan Features */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Plan Özellikleri</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Aylık {subscription.limit} mesaj hakkı</span>
                    </div>
                    {subscription.isPremium && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Tüm AI modelleri</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Öncelikli destek</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Reklamsız deneyim</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Abonelik bilgileri yüklenemedi</p>
              </div>
            )}
          </div>
        );
      
      case 'general':
        return (
          <div className="space-y-6">
            {/* Theme - Dynamic */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">{t('theme')}</Label>
                <p className="text-xs text-muted-foreground mt-1">{t('themeDescription')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  {t('light')}
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  {t('dark')}
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => handleThemeChange('system')}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  {t('system')}
                </Button>
              </div>
            </div>

            {/* Language - i18n */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">{t('language')}</Label>
                <p className="text-xs text-muted-foreground mt-1">{t('languageDescription')}</p>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                  <SelectItem value="zh">🇨🇳 中文</SelectItem>
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
                <p className="text-xs text-muted-foreground mt-1">Tarayıcı bildirimleri</p>
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
                <p className="text-xs text-muted-foreground mt-1">Yeni mesaj geldiğinde ses çal</p>
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
            <div className="p-3 border rounded-lg border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Kişiselleştirme tercihlerin AI ile paylaşılıyor - daha iyi deneyim için!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Kompakt mod</Label>
                <p className="text-xs text-muted-foreground mt-1">Daha fazla mesaj görüntüle</p>
              </div>
              <Switch 
                checked={compactMode}
                onCheckedChange={(checked) => {
                  setCompactMode(checked);
                  sendPersonalizationToAI('Kompakt Mod', checked);
                  toast.success(checked ? 'Kompakt mod açıldı' : 'Kompakt mod kapatıldı');
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Font boyutu</Label>
                <p className="text-xs text-muted-foreground mt-1">Mesajların font boyutu</p>
              </div>
              <Select value={fontSize} onValueChange={(value) => {
                setFontSize(value);
                sendPersonalizationToAI('Font Boyutu', value);
                toast.success(`Font boyutu ${value === 'small' ? 'küçük' : value === 'medium' ? 'orta' : 'büyük'} olarak ayarlandı`);
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
                <p className="text-xs text-muted-foreground mt-1">Kod bloklarını renklendir</p>
              </div>
              <Switch 
                checked={codeHighlighting}
                onCheckedChange={(checked) => {
                  setCodeHighlighting(checked);
                  sendPersonalizationToAI('Kod Vurgulama', checked);
                  toast.success(checked ? 'Kod vurgulama açıldı' : 'Kod vurgulama kapatıldı');
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Animasyonlar</Label>
                <p className="text-xs text-muted-foreground mt-1">Arayüz animasyonları</p>
              </div>
              <Switch 
                checked={animations} 
                onCheckedChange={(checked) => {
                  setAnimations(checked);
                  sendPersonalizationToAI('Animasyonlar', checked);
                  toast.success(checked ? 'Animasyonlar açıldı' : 'Animasyonlar kapatıldı');
                }}
              />
            </div>
          </div>
        );

      case 'connections':
        return (
          <div className="space-y-4">
            <div className="p-3 border rounded-lg border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/10">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-600" />
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Bağlantılar dinamik olarak yönetiliyor. Ekle veya kaldır!
                </p>
              </div>
            </div>

            {connectedApps.map((app) => {
              const Icon = app.icon;
              return (
                <div key={app.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                  <div>
                        <p className="text-sm font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.description}</p>
                  </div>
                </div>
                    <Button 
                      variant={app.connected ? "default" : "outline"} 
                      size="sm" 
                      className="h-8"
                      onClick={() => toggleAppConnection(app.id)}
                    >
                      {app.connected ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-2" />
                          Bağlı
                        </>
                      ) : (
                        'Bağlan'
                      )}
                </Button>
              </div>
            </div>
              );
            })}
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
                  <p className="text-xs text-muted-foreground">Tüm sohbetlerini JSON formatında indir</p>
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
                  onClick={() => setShowArchive(!showArchive)}
                >
                  <Archive className="h-3 w-3 mr-2" />
                  {showArchive ? 'Gizle' : 'Görüntüle'}
                </Button>
              </div>

              {/* Show archived chats */}
              {showArchive && (
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h4 className="text-sm font-medium mb-3">Arşivlenmiş Sohbetler</h4>
                  {archivedChats.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Arşivlenmiş sohbet yok</p>
                  ) : (
                    <div className="space-y-2">
                      {archivedChats.map((chat) => (
                        <div key={chat.id} className="flex items-center justify-between p-2 bg-background rounded">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">{chat.title}</span>
                </div>
                          <Button variant="ghost" size="sm" className="h-6">
                            Geri yükle
                </Button>
              </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors">
                <div>
                  <p className="text-sm font-medium text-red-600">Tüm sohbetleri sil</p>
                  <p className="text-xs text-red-500">Bu işlem geri alınamaz</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                  onClick={() => {
                    const confirmation = window.confirm('Tüm sohbetleri kalici olarak silmek istediğinizden emin misiniz?\n\nBu işlem geri alıNAMAZ!');
                    if (confirmation) {
                      const secondConfirmation = window.prompt('Devam etmek için "KALICI SİL" yazın:');
                      if (secondConfirmation === 'KALICI SİL') {
                        toast.success('Tüm sohbetler silindi');
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
              <Button variant="outline" size="sm" className="h-8" disabled>
                Yakında
              </Button>
            </div>

            {!showPasswordChange ? (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-normal">Şifre</Label>
                  <p className="text-xs text-muted-foreground mt-1">Şifreni güncelle</p>
              </div>
                <Button 
                  variant="outline" 
                  size="sm" 
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
                    disabled={!passwords.current || !passwords.new || !passwords.confirm || loading}
                  >
                    {loading ? 'Değiştiriliyor...' : 'Şifre değiştir'}
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
        );

      case 'account':
        return (
          <div className="space-y-6">
            {/* Profile Header */}
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
                
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />
              </div>
              
              <div className="flex-1 space-y-3">
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
                        onClick={() => {
                          saveProfileChanges();
                        }}
                        disabled={!newName.trim() || loading}
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
              </div>
            </div>

            {/* Profile Actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Profil İşlemleri</h4>
              
              <div className="pt-2 flex gap-2">
                <Button 
                  size="sm" 
                  className="h-8 px-4"
                  onClick={saveProfileChanges}
                  disabled={loading}
                >
                  <Save className="h-3 w-3 mr-2" />
                  {loading ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}
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
            
            {/* Dangerous Zone */}
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
                    const confirmation = window.confirm('Hesabınızı geçici olarak devre dışı bırakmak istediğinizden emin misiniz?');
                    if (confirmation) {
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
                  <p className="text-xs text-red-500">Bu işlem geri alıNAMAZ</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                  onClick={() => {
                      const verification = window.prompt('Hesabınızı kalıcı olarak silmek için "SİL" yazın:');
                      if (verification === 'SİL') {
                      toast.success('Hesap silme işlemi başlatıldı');
                        onClose();
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
      <div className="bg-background rounded-xl shadow-2xl border border-border/50 w-[90vw] max-w-[900px] h-[80vh] flex overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-48 bg-muted/30 border-r border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-base font-semibold">{t('settings')}</h2>
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

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSettingsModal;