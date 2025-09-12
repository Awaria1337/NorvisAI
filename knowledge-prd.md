# Norvis AI - Product Requirements Document (PRD)

## 1. Proje Genel Bakış

### 1.1 Proje Adı
**Norvis A.I+** - Çok Modelli AI Chat Platformu

### 1.2 Proje Vizyonu
Kullanıcıların farklı AI sağlayıcılarını (OpenAI, Anthropic, vb.) tek bir platformda, kendi API anahtarları ile kullanabileceği, modern ve profesyonel bir chat uygulaması.

### 1.3 Hedef Kitle
- AI teknolojilerini kullanmak isteyen profesyoneller
- Geliştiriciler ve araştırmacılar
- İş dünyasından kullanıcılar
- AI meraklıları

## 2. Teknik Gereksinimler

### 2.1 Teknoloji Stack'i
- **Frontend**: React.js / Next.js / Typescript
- **Backend**: Node.js / Express.js 
- **Database**: PostgreSQL
- **Authentication**: JWT Token
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit / Zustand
- **Real-time**: Socket.io

### 2.2 Desteklenecek AI Sağlayıcılar
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini) - gelecek versiyonlarda
- Diğer sağlayıcılar için genişletilebilir yapı
- API entegrasyonları için modüler yapı

## 3. Özellik Gereksinimleri

### 3.1 Faz 1: Temel Chat Fonksiyonalitesi (İlk Geliştirme)

#### 3.1.1 Kullanıcı Yönetimi
- **Kayıt Olma**: Email ve şifre ile kayıt
- **Giriş Yapma**: Güvenli authentication sistemi
- **Profil Yönetimi**: Kullanıcı bilgileri düzenleme
- **Şifre Sıfırlama**: Email ile şifre sıfırlama

#### 3.1.2 Ana Chat Arayüzü
- **Sol Panel**: 
  - Yeni sohbet başlatma butonu
  - Geçmiş sohbetler listesi
  - Sohbet silme/düzenleme
  - Kullanıcı profil bilgileri (altta)
  
- **Orta Panel**: 
  - Chat alanı (mesaj geçmişi)
  - Mesaj girdi alanı
  - AI model seçici dropdown
  - Gönder butonu

#### 3.1.3 API Yönetimi
- **API Anahtar Yönetimi**:
  - Kullanıcı kendi API anahtarlarını ekleyebilir
  - Şifrelenmiş depolama
  - API anahtar doğrulama
  - Birden fazla sağlayıcı için anahtar depolama

#### 3.1.4 Chat Özellikleri
- **Gerçek Zamanlı Mesajlaşma**: Anlık yanıt alma
- **Mesaj Geçmişi**: Sohbet kaydetme ve geri yükleme
- **Mesaj Formatlaması**: Markdown desteği
- **Kod Blokları**: Syntax highlighting
- **Mesaj Düzenleme**: Gönderilmiş mesajları düzenleme
- **Mesaj Silme**: Mesaj silme özelliği

### 3.2 Faz 2: Gelişmiş Özellikler (Sonraki Güncellemeler)

#### 3.2.1 Medya Desteği
- **Resim Yükleme**: PNG, JPG, JPEG formatları
- **Resim Üretme**: DALL-E, Midjourney entegrasyonu
- **Dosya Yükleme**: PDF, Word, TXT dosyaları
- **Sesli Komut**: Speech-to-text özelliği

#### 3.2.2 Premium Özellikler
- **Ücretsiz Plan**: 
  - Günlük mesaj limiti
  - Temel AI modelleri
  - 30 günlük mesaj geçmişi
  
- **Premium Plan**:
  - Sınırsız mesaj
  - Tüm AI modelleri
  - Sınırsız mesaj geçmişi
  - Öncelikli destek
  - Gelişmiş özellikler

## 4. Kullanıcı Arayüzü Gereksinimleri

### 4.1 Tasarım Prensipleri
- **Modern ve Minimalist**: Temiz, anlaşılır arayüz
- **Responsive Design**: Tüm cihazlarda uyumlu
- **Dark/Light Mode**: Tema seçenekleri
- **Accessibility**: Erişilebilirlik standartları

### 4.2 Renk Paleti
- **Primary**: Mavi tonları (#4F46E5)
- **Secondary**: Gri tonları (#6B7280)
- **Background**: Beyaz/Koyu gri
- **Accent**: Yeşil (#10B981) başarı mesajları için

### 4.3 Arayüz Bileşenleri
- **Header**: Logo, kullanıcı menüsü
- **Sidebar**: Navigasyon, sohbet listesi
- **Main Content**: Chat alanı
- **Footer**: Durum bilgileri

## 5. Güvenlik Gereksinimleri

### 5.1 Veri Güvenliği
- **API Anahtarları**: AES-256 şifreleme
- **Kullanıcı Şifreleri**: bcrypt hash'leme
- **HTTPS**: Tüm iletişimde zorunlu
- **Rate Limiting**: API kötüye kullanım koruması

### 5.2 Gizlilik
- **Veri Minimizasyonu**: Sadece gerekli verilerin toplanması
- **Mesaj Şifreleme**: Veritabanında şifrelenmiş depolama
- **Kullanıcı Onayı**: Veri işleme için açık onay

## 6. Performans Gereksinimleri

### 6.1 Yanıt Süreleri
- **Sayfa Yükleme**: < 3 saniye
- **API Yanıtları**: < 2 saniye (AI hariç)
- **Chat Gönderimi**: < 1 saniye

### 6.2 Ölçeklenebilirlik
- **Eş Zamanlı Kullanıcı**: 1000+ kullanıcı
- **Mesaj İşleme**: 100 mesaj/saniye
- **Veritabanı**: Optimize edilmiş sorgular

## 7. Geliştirme Aşamaları

### 7.1 Sprint 1 (2-3 Hafta)
- Proje kurulumu ve temel yapı
- Kullanıcı authentication sistemi
- Temel UI bileşenleri

### 7.2 Sprint 2 (2-3 Hafta)
- Chat arayüzü geliştirme
- API entegrasyon altyapısı
- Mesaj gönderme/alma sistemi

### 7.3 Sprint 3 (2-3 Hafta)
- AI sağlayıcı entegrasyonları
- Mesaj geçmişi sistemi
- Sohbet yönetimi

### 7.4 Sprint 4 (2-3 Hafta)
- Kullanıcı profil yönetimi
- API anahtar yönetimi
- Test ve hata düzeltmeleri

### 7.5 Sprint 5 (2-3 Hafta)
- Performans optimizasyonu
- Güvenlik testleri
- Deployment hazırlığı

## 8. Test Gereksinimleri

### 8.1 Test Türleri
- **Unit Test**: Bileşen testleri
- **Integration Test**: API entegrasyon testleri
- **E2E Test**: Kullanıcı akış testleri
- **Security Test**: Güvenlik açığı testleri

### 8.2 Test Coverage
- **Minimum %80** kod kapsamı
- **Kritik Fonksiyonlar**: %95 kapsama
- **API Endpoints**: Tüm endpoint testleri

## 9. Deployment ve Maintenance

### 9.1 Deployment
- **Production Environment**: AWS/Vercel/DigitalOcean
- **Staging Environment**: Test ortamı
- **CI/CD Pipeline**: Otomatik deployment
- **Monitoring**: Sistem izleme ve alertler

### 9.2 Maintenance
- **Regular Updates**: Güvenlik ve özellik güncellemeleri
- **Backup Strategy**: Günlük otomatik yedekleme
- **Performance Monitoring**: Sürekli performans takibi

## 10. Success Metrics

### 10.1 Kullanıcı Metrikleri
- **Daily Active Users (DAU)**
- **Monthly Active Users (MAU)**
- **User Retention Rate**
- **Session Duration**

### 10.2 Teknik Metrikleri
- **API Response Time**
- **Error Rate** (< %1)
- **Uptime** (> %99.5)
- **Load Time** (< 3 saniye)