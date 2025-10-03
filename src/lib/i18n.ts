import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  tr: {
    translation: {
      // Settings
      settings: 'Ayarlar',
      general: 'Genel',
      notifications: 'Bildirimler',
      personalization: 'Kişiselleştirme',
      connections: 'Bağlı uygulamalar',
      data: 'Veri kontrolleri',
      security: 'Güvenlik',
      account: 'Hesap',
      
      // General
      theme: 'Tema',
      themeDescription: 'Arayüz temasını seçin',
      light: 'Açık',
      dark: 'Koyu',
      system: 'Sistem',
      language: 'Dil',
      languageDescription: 'Arayüz dili',
      autoSave: 'Otomatik kaydetme',
      autoSaveActive: 'Aktif',
      
      // Notifications
      desktopNotifications: 'Masaüstü bildirimleri',
      desktopNotificationsDesc: 'Tarayıcı bildirimleri',
      soundNotifications: 'Ses bildirimleri',
      soundNotificationsDesc: 'Yeni mesaj geldiğinde ses çal',
      
      // Personalization
      compactMode: 'Kompakt mod',
      compactModeDesc: 'Daha fazla mesaj görüntüle',
      fontSize: 'Font boyutu',
      fontSizeDesc: 'Mesajların font boyutu',
      small: 'Küçük',
      medium: 'Orta',
      large: 'Büyük',
      codeHighlighting: 'Kod vurgulama',
      codeHighlightingDesc: 'Kod bloklarını renklendir',
      messageBubbles: 'Mesaj balonları',
      animations: 'Animasyonlar',
      
      // Security
      twoFactorAuth: 'İki faktörlü doğrulama',
      twoFactorAuthDesc: 'Hesabın için ek güvenlik',
      password: 'Şifre',
      passwordLastChanged: 'Son değiştirilme',
      changePassword: 'Şifre Değiştir',
      sessionHistory: 'Oturum geçmişi',
      
      // Account
      profileInfo: 'Profil Bilgileri',
      displayName: 'Görünen ad',
      email: 'E-posta adresi',
      saveChanges: 'Değişiklikleri kaydet',
      reset: 'Sıfırla',
      
      // Common
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      export: 'Dışa aktar',
      import: 'İçe aktar',
      enable: 'Etkinleştir',
      disable: 'Devre dışı bırak',
      view: 'Görüntüle',
      change: 'Değiştir'
    }
  },
  en: {
    translation: {
      // Settings
      settings: 'Settings',
      general: 'General',
      notifications: 'Notifications',
      personalization: 'Personalization',
      connections: 'Connected Apps',
      data: 'Data Controls',
      security: 'Security',
      account: 'Account',
      
      // General
      theme: 'Theme',
      themeDescription: 'Choose interface theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      language: 'Language',
      languageDescription: 'Interface language',
      autoSave: 'Auto-save',
      autoSaveActive: 'Active',
      
      // Notifications
      desktopNotifications: 'Desktop notifications',
      desktopNotificationsDesc: 'Browser notifications',
      soundNotifications: 'Sound notifications',
      soundNotificationsDesc: 'Play sound on new message',
      
      // Personalization
      compactMode: 'Compact mode',
      compactModeDesc: 'Display more messages',
      fontSize: 'Font size',
      fontSizeDesc: 'Message font size',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      codeHighlighting: 'Code highlighting',
      codeHighlightingDesc: 'Colorize code blocks',
      messageBubbles: 'Message bubbles',
      animations: 'Animations',
      
      // Security
      twoFactorAuth: 'Two-factor authentication',
      twoFactorAuthDesc: 'Extra security for your account',
      password: 'Password',
      passwordLastChanged: 'Last changed',
      changePassword: 'Change Password',
      sessionHistory: 'Session history',
      
      // Account
      profileInfo: 'Profile Information',
      displayName: 'Display name',
      email: 'Email address',
      saveChanges: 'Save changes',
      reset: 'Reset',
      
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      export: 'Export',
      import: 'Import',
      enable: 'Enable',
      disable: 'Disable',
      view: 'View',
      change: 'Change'
    }
  },
  ru: {
    translation: {
      // Settings
      settings: 'Настройки',
      general: 'Основные',
      notifications: 'Уведомления',
      personalization: 'Персонализация',
      connections: 'Подключенные приложения',
      data: 'Управление данными',
      security: 'Безопасность',
      account: 'Аккаунт',
      
      // General
      theme: 'Тема',
      themeDescription: 'Выберите тему интерфейса',
      light: 'Светлая',
      dark: 'Тёмная',
      system: 'Системная',
      language: 'Язык',
      languageDescription: 'Язык интерфейса',
      autoSave: 'Автосохранение',
      autoSaveActive: 'Активно',
      
      // Notifications
      desktopNotifications: 'Уведомления рабочего стола',
      desktopNotificationsDesc: 'Уведомления браузера',
      soundNotifications: 'Звуковые уведомления',
      soundNotificationsDesc: 'Воспроизводить звук при новом сообщении',
      
      // Personalization
      compactMode: 'Компактный режим',
      compactModeDesc: 'Показать больше сообщений',
      fontSize: 'Размер шрифта',
      fontSizeDesc: 'Размер шрифта сообщений',
      small: 'Маленький',
      medium: 'Средний',
      large: 'Большой',
      codeHighlighting: 'Подсветка кода',
      codeHighlightingDesc: 'Раскрасить блоки кода',
      messageBubbles: 'Пузыри сообщений',
      animations: 'Анимации',
      
      // Security
      twoFactorAuth: 'Двухфакторная аутентификация',
      twoFactorAuthDesc: 'Дополнительная безопасность для вашего аккаунта',
      password: 'Пароль',
      passwordLastChanged: 'Последнее изменение',
      changePassword: 'Изменить пароль',
      sessionHistory: 'История сеансов',
      
      // Account
      profileInfo: 'Информация профиля',
      displayName: 'Отображаемое имя',
      email: 'Адрес электронной почты',
      saveChanges: 'Сохранить изменения',
      reset: 'Сбросить',
      
      // Common
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      export: 'Экспорт',
      import: 'Импорт',
      enable: 'Включить',
      disable: 'Выключить',
      view: 'Просмотр',
      change: 'Изменить'
    }
  },
  zh: {
    translation: {
      // Settings
      settings: '设置',
      general: '常规',
      notifications: '通知',
      personalization: '个性化',
      connections: '已连接应用',
      data: '数据控制',
      security: '安全',
      account: '账户',
      
      // General
      theme: '主题',
      themeDescription: '选择界面主题',
      light: '浅色',
      dark: '深色',
      system: '系统',
      language: '语言',
      languageDescription: '界面语言',
      autoSave: '自动保存',
      autoSaveActive: '活跃',
      
      // Notifications
      desktopNotifications: '桌面通知',
      desktopNotificationsDesc: '浏览器通知',
      soundNotifications: '声音通知',
      soundNotificationsDesc: '新消息时播放声音',
      
      // Personalization
      compactMode: '紧凑模式',
      compactModeDesc: '显示更多消息',
      fontSize: '字体大小',
      fontSizeDesc: '消息字体大小',
      small: '小',
      medium: '中',
      large: '大',
      codeHighlighting: '代码高亮',
      codeHighlightingDesc: '为代码块着色',
      messageBubbles: '消息气泡',
      animations: '动画',
      
      // Security
      twoFactorAuth: '双因素认证',
      twoFactorAuthDesc: '为您的账户提供额外安全',
      password: '密码',
      passwordLastChanged: '最后更改',
      changePassword: '更改密码',
      sessionHistory: '会话历史',
      
      // Account
      profileInfo: '个人资料信息',
      displayName: '显示名称',
      email: '电子邮件地址',
      saveChanges: '保存更改',
      reset: '重置',
      
      // Common
      save: '保存',
      cancel: '取消',
      delete: '删除',
      export: '导出',
      import: '导入',
      enable: '启用',
      disable: '禁用',
      view: '查看',
      change: '更改'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr', // Default language
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
