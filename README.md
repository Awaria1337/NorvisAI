# 🤖 Norvis AI - Multi-Modal AI Chat Platform

Modern, profesyonel bir AI sohbet platformu. Kullanıcılar kendi API anahtarlarıyla birden fazla AI sağlayıcısına (OpenAI, Anthropic, Google) bağlanabilir.

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#️-teknolojiler)
- [Hızlı Başlangıç](#-hızlı-başlangıç)
- [Kurulum Detayları](#-kurulum-detayları)
- [Çevre Değişkenleri](#-çevre-değişkenleri)
- [Proje Yapısı](#-proje-yapısı)
- [Admin Paneli](#-admin-paneli)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Güvenlik](#-güvenlik)

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama ve Güvenlik
- ✅ **Kullanıcı Kaydı ve Girişi** - Güvenli JWT tabanlı authentication
- ✅ **Email Doğrulama** - Kayıt sonrası otomatik email doğrulama
- ✅ **OTP (Tek Kullanımlık Şifre)** - 2FA ile ek güvenlik katmanı
- ✅ **Şifre Sıfırlama** - Email ile güvenli şifre sıfırlama akışı (Login sayfasında)
- ✅ **Google OAuth** - Google hesabı ile hızlı giriş
- ✅ **Session Yönetimi** - NextAuth.js ile güvenli session yönetimi
- ✅ **Token Tabanlı Güvenlik** - 1 saatlik geçerlilik süreli tokenlar

### 💬 Sohbet Özellikleri
- ✅ **Gerçek Zamanlı Sohbet** - Anlık mesajlaşma deneyimi
- ✅ **Çoklu AI Modeli Desteği**
  - OpenAI (GPT-4, GPT-4 Turbo, GPT-3.5)
  - Anthropic (Claude 3 Opus, Sonnet, Haiku)
  - Google (Gemini Pro)
- ✅ **Sohbet Geçmişi** - Tüm konuşmalarınız güvenle saklanır
- ✅ **Mesaj Arama** - Geçmiş mesajlarda hızlı arama
- ✅ **Markdown Desteği** - Zengin metin formatı
- ✅ **Kod Vurgulama** - Syntax highlighting ile kod blokları
- ✅ **Mesaj Silme & Düzenleme** - Tam kontrol
- ✅ **Favori Sohbetler** - Önemli konuşmaları işaretle
- ✅ **Sohbet Arşivleme** - Eski sohbetleri arşivle

### 📁 Dosya ve Medya
- ✅ **Dosya Yükleme** - Belgelerinizi AI ile analiz edin
- ✅ **Görsel Desteği** - Resimlerle etkileşim
- ✅ **Çoklu Dosya Desteği** - Birden fazla dosya yükleme

### 💎 Abonelik ve Planlar
- ✅ **Ücretsiz Plan** - 50 mesaj/ay
- ✅ **Premium Plan** - 500 mesaj/ay + tüm özellikler
- ✅ **Ultra Plan** - 5000 mesaj/ay + öncelikli destek
- ✅ **Stripe Entegrasyonu** - Güvenli ödeme sistemi
- ✅ **Otomatik Abonelik Yenileme** - Aylık otomatik yenileme
- ✅ **Kullanım İstatistikleri** - Mesaj kullanım takibi

### 🎨 Arayüz ve Deneyim
- ✅ **Modern UI/UX** - Tailwind CSS ile şık tasarım
- ✅ **Koyu Mod** - Göz dostu karanlık tema (varsayılan)
- ✅ **Sistem Teması** - İşletim sistemi ayarlarını takip eder
- ✅ **Responsive Tasarım** - Tüm cihazlarda mükemmel görünüm
- ✅ **Çoklu Dil Desteği** - Türkçe, İngilizce, Rusça, Çince
- ✅ **Bildirimler** - Toast bildirimleri ile anlık geri bildirim
- ✅ **Loading State'leri** - Tüm işlemlerde görsel geri bildirim
- ✅ **Smooth Animasyonlar** - Akıcı geçişler ve animasyonlar

### 👨‍💼 Admin Paneli
- ✅ **Kullanıcı Yönetimi** - Tüm kullanıcıları görüntüle ve yönet
- ✅ **Abonelik Yönetimi** - Plan değişiklikleri ve iptal işlemleri
- ✅ **İstatistikler ve Raporlar** - Detaylı kullanım analizleri
- ✅ **Log Yönetimi** - Sistem loglarını görüntüle ve filtrele
- ✅ **Bildirim Sistemi** - Kullanıcılara toplu bildirim gönder
- ✅ **Model Yönetimi** - AI modellerini aktif/pasif yapma
- ✅ **Prompt Yönetimi** - Sistem promptlarını düzenle
- ✅ **Özellik Ayarları** - Platformdaki özellikleri kontrol et
- ✅ **Bakım Modu** - Platform bakım modunu aktifleştir

### 📧 Email Sistemi
- ✅ **Hoşgeldin Email'i** - Yeni kullanıcılara karşılama
- ✅ **Email Doğrulama** - Otomatik doğrulama linki
- ✅ **Şifre Sıfırlama Email'i** - Güvenli sıfırlama linki
- ✅ **OTP Kodu Email'i** - 2FA için doğrulama kodu
- ✅ **Abonelik Bildirimleri** - Plan değişikliği bildirimleri
- ✅ **Profesyonel Email Şablonları** - Markalı, modern tasarım
- ✅ **SMTP Desteği** - Gmail, Outlook, özel SMTP

### 🔒 Güvenlik Özellikleri
- ✅ **Bcrypt ile Şifre Hash'leme** - Güvenli şifre saklama
- ✅ **JWT Token Authentication** - Stateless auth
- ✅ **CSRF Koruması** - Cross-site request forgery koruması
- ✅ **Rate Limiting** - API kötüye kullanım koruması
- ✅ **Input Validation** - Tüm girdilerde doğrulama
- ✅ **SQL Injection Koruması** - Prisma ORM ile güvenli sorgular
- ✅ **XSS Koruması** - Cross-site scripting koruması

### 📊 Raporlama ve Analitik
- ✅ **Kullanım İstatistikleri** - Mesaj ve API kullanım grafikleri
- ✅ **Abonelik Raporları** - Gelir ve abonelik analizleri
- ✅ **Kullanıcı Aktivite Logları** - Detaylı aktivite takibi
- ✅ **Hata Takibi** - Sistem hatalarını loglama

---

## 🛠️ Teknolojiler

### Frontend
- **Next.js 15** - React framework (App Router)
- **React 19** - UI kütüphanesi
- **TypeScript 5** - Tip güvenliği
- **Tailwind CSS 3** - Utility-first CSS
- **Radix UI** - Headless UI bileşenleri
- **Lucide Icons** - Modern icon seti
- **React Hot Toast** - Bildirim sistemi
- **Zustand** - State management
- **React Hook Form** - Form yönetimi

### Backend & Database
- **Next.js API Routes** - Serverless API
- **Prisma ORM 5** - Type-safe database client
- **PostgreSQL 16** - İlişkisel veritabanı
- **NextAuth.js** - Authentication
- **Nodemailer** - Email gönderimi
- **Bcrypt** - Şifre hash'leme

### Ödeme & Entegrasyon
- **Stripe** - Ödeme işlemleri
- **OpenAI API** - GPT modelleri
- **Anthropic API** - Claude modelleri
- **Google AI API** - Gemini modelleri

---

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

```bash
Node.js 18.x veya üzeri
PostgreSQL 14.x veya üzeri
npm veya yarn
```

### Kurulum (5 Dakika)

```bash
# 1. Projeyi klonlayın
git clone https://github.com/Awaria1337/NorvisAI.git
cd NorvisAI

# 2. Bağımlılıkları yükleyin
npm install

# 3. Çevre değişkenlerini ayarlayın
cp .env.example .env.local
# .env.local dosyasını düzenleyin (aşağıdaki bölüme bakın)

# 4. Veritabanını oluşturun ve migrate edin
npx prisma generate
npx prisma db push

# 5. (Opsiyonel) Örnek verileri yükleyin
npm run seed

# 6. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda açın: **http://localhost:3000**

---

## 🔧 Kurulum Detayları

### 1️⃣ PostgreSQL Kurulumu

#### Windows:
```bash
# PostgreSQL indir: https://www.postgresql.org/download/windows/
# Kurulum sırasında şifre belirleyin (örn: "password123")
# pgAdmin ile veritabanı oluşturun:
# - Veritabanı adı: Norvisdb
# - Port: 5432
```

#### macOS:
```bash
brew install postgresql@16
brew services start postgresql@16
createdb Norvisdb
```

#### Linux:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb Norvisdb
```

### 2️⃣ Email (SMTP) Kurulumu

#### Gmail ile SMTP (Önerilen - 2 Dakika)

1. **Gmail Hesabınıza Gidin**
   - https://myaccount.google.com/security

2. **2 Adımlı Doğrulamayı Aktifleştirin**
   - "2-Step Verification" bölümüne gidin
   - Aktifleştirin

3. **Uygulama Şifresi Oluşturun**
   - "App Passwords" bölümüne gidin
   - "Select app" → "Mail" seçin
   - "Select device" → "Other" seçin, "Norvis AI" yazın
   - "Generate" butonuna tıklayın
   - **16 haneli şifreyi kopyalayın** (örn: `abcd efgh ijkl mnop`)

4. **.env.local Dosyasına Ekleyin**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="sizinemail@gmail.com"
   SMTP_PASSWORD="abcdefghijklmnop"  # Boşluksuz yazın
   ```

#### Outlook/Hotmail ile SMTP

```env
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="sizinemail@outlook.com"
SMTP_PASSWORD="sifreniz"
```

#### Özel SMTP Sunucusu

```env
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASSWORD="your-smtp-password"
```

### 3️⃣ Google OAuth Kurulumu (Opsiyonel)

1. **Google Cloud Console'a Gidin**
   - https://console.cloud.google.com/

2. **Yeni Proje Oluşturun**
   - "New Project" → Proje adı girin → "Create"

3. **OAuth Consent Screen Yapılandırın**
   - "APIs & Services" → "OAuth consent screen"
   - "External" seçin → "Create"
   - App name: "Norvis AI"
   - Support email: email@example.com
   - "Save and Continue"

4. **OAuth Credentials Oluşturun**
   - "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Norvis AI Web"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google`
   - "Create"

5. **Client ID ve Secret'ı Kopyalayın**
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### 4️⃣ Stripe (Ödeme Sistemi) Kurulumu

1. **Stripe Hesabı Oluşturun**
   - https://dashboard.stripe.com/register

2. **API Anahtarlarını Alın**
   - Dashboard → "Developers" → "API keys"
   - Test modunda başlayın

3. **Webhook Ayarlayın**
   - "Developers" → "Webhooks" → "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to send: `checkout.session.completed`, `customer.subscription.updated`

4. **.env.local'e Ekleyin**
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### 5️⃣ AI API Anahtarları (Opsiyonel)

Platform yöneticisi olarak sistem-wide API anahtarları ekleyebilirsiniz:

```env
# OpenAI
OPENAI_API_KEY="sk-..."

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Google AI
GOOGLE_AI_API_KEY="AIza..."
```

**Not:** Kullanıcılar kendi API anahtarlarını da ekleyebilir.

---

## 🔐 Çevre Değişkenleri

`.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Uygulama
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Veritabanı
DATABASE_URL="postgresql://postgres:password@localhost:5432/Norvisdb?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"

# Google OAuth (Opsiyonel)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (SMTP) - Gmail Örneği
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="youremail@gmail.com"
SMTP_PASSWORD="your-app-password-16-chars"

# Stripe (Ödeme)
STRIPE_SECRET_KEY="sk_test_your_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# AI API Keys (Opsiyonel - Admin için)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="AIza..."

# JWT
JWT_SECRET="your-jwt-secret-key-very-secure"

# Admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure_admin_password_123"
```

### 🔑 Güvenlik Notları

- **NEXTAUTH_SECRET**: Üretimde mutlaka değiştirin
  ```bash
  # Rastgele güvenli key oluşturma
  openssl rand -base64 32
  ```

- **Şifreleri asla commit etmeyin**
  - `.env.local` dosyası `.gitignore`'da olmalı
  
- **Production'da farklı değerler kullanın**
  - Test ve production ortamları ayrı olmalı

---

## 📁 Proje Yapısı

```
Norvis.ai/
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması
│   └── migrations/            # Veritabanı migration'ları
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── chats/        # Chat CRUD
│   │   │   ├── subscription/ # Abonelik işlemleri
│   │   │   └── admin/        # Admin API'leri
│   │   ├── auth/             # Auth sayfaları (login, register, etc.)
│   │   ├── chat/             # Chat arayüzü
│   │   ├── admin/            # Admin paneli
│   │   └── pricing/          # Fiyatlandırma sayfası
│   ├── components/           # React bileşenleri
│   │   ├── ui/              # Temel UI bileşenleri
│   │   └── providers/       # Context providers
│   ├── lib/                 # Utility kütüphaneleri
│   │   ├── auth.ts         # Auth helpers
│   │   ├── db.ts           # Database helpers
│   │   ├── email.ts        # Email helpers
│   │   └── prisma.ts       # Prisma client
│   ├── store/              # Zustand stores
│   └── types/              # TypeScript types
├── .env.local              # Çevre değişkenleri (local)
├── next.config.ts
├── package.json
└── README.md
```

---

## 👨‍💼 Admin Paneli

Admin paneline erişim: **http://localhost:3000/admin/login**

### İlk Admin Kullanıcısı Oluşturma

```bash
# Script ile otomatik oluşturma
npm run create-admin

# Veya manuel olarak
node scripts/create-admin.ts
```

### Admin Özellikleri

| Özellik | Açıklama | Yol |
|---------|----------|-----|
| **Dashboard** | Genel istatistikler ve grafikler | `/admin/dashboard` |
| **Kullanıcılar** | Kullanıcı listesi, düzenleme, silme | `/admin/users` |
| **Raporlar** | Gelir, kullanım, aktivite raporları | `/admin/reports` |
| **Loglar** | Sistem ve kullanıcı logları | `/admin/logs` |
| **Bildirimler** | Toplu bildirim gönderimi | `/admin/notifications` |
| **Modeller** | AI modeli yönetimi | `/admin/models` |
| **Promptlar** | Sistem promptları | `/admin/prompts` |
| **Ayarlar** | Platform ayarları | `/admin/settings` |

---

## 📡 API Dokümantasyonu

### Authentication

```typescript
// Register
POST /api/auth/register
Body: { name: string, email: string, password: string }

// Login
POST /api/auth/login
Body: { email: string, password: string }

// Verify Email
GET /api/auth/verify-email?token=xxx

// Forgot Password
POST /api/auth/forgot-password
Body: { email: string }

// Reset Password
POST /api/auth/reset-password
Body: { token: string, password: string }

// OTP Verification
POST /api/auth/verify-otp
Body: { email: string, otp: string }
```

### Chats

```typescript
// Get all chats
GET /api/chats

// Create chat
POST /api/chats
Body: { title?: string }

// Delete chat
DELETE /api/chats/[id]
```

---

## 🔒 Güvenlik

### Uygulanan Güvenlik Önlemleri

- ✅ **Password Hashing**: Bcrypt ile güvenli hash
- ✅ **JWT Tokens**: Kısa ömürlü access token'lar
- ✅ **HTTPS**: Production'da zorunlu
- ✅ **CSRF Protection**: NextAuth.js ile korumalı
- ✅ **SQL Injection**: Prisma ORM ile korumalı
- ✅ **XSS Protection**: React'ın built-in koruması
- ✅ **Input Validation**: Tüm girdilerde doğrulama

---

## 🚀 Deployment

### Vercel (Önerilen)

```bash
# 1. Vercel CLI yükle
npm i -g vercel

# 2. Deploy
vercel

# 3. Çevre değişkenlerini ayarla
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... diğer değişkenler

# 4. Production deploy
vercel --prod
```

---

## 📝 Faydalı Komutlar

```bash
# Prisma Studio (Database GUI)
npx prisma studio

# Database sıfırlama
npx prisma db push --force-reset

# Production build
npm run build

# Linting
npm run lint
```

---

## 👥 İletişim

- **GitHub**: [@Awaria1337](https://github.com/Awaria1337)
- **Email**: support@norvis.ai

---

## 🙏 Teşekkürler

Bu proje aşağıdaki harika açık kaynak projelerden yararlanmaktadır:

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Awaria1337">Awaria1337</a>
</p>

<p align="center">
  <strong>⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!</strong>
</p>
