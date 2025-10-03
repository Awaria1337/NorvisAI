# Google OAuth - Tam Kurulum Rehberi 🚀

## ✅ Yapılan İyileştirmeler

1. ✨ **Otomatik Yönlendirme**: Google ile giriş sonrası direkt `/chat` sayfasına yönlendirir
2. 👤 **Kullanıcı Profili**: Google profil fotoğrafı, isim ve email otomatik kaydedilir
3. 💾 **Database Entegrasyonu**: Yeni kullanıcılar otomatik PostgreSQL'e kaydedilir
4. 🔐 **JWT Token**: Her kullanıcı için benzersiz token oluşturulur
5. 🎉 **Hoşgeldin Mesajları**: Yeni kullanıcı/mevcut kullanıcı için farklı mesajlar

---

## 📋 Google Cloud Console Ayarları

### 1. Google Cloud Console'a Gidin
https://console.cloud.google.com/

### 2. OAuth Client ID'nizi Düzenleyin
**APIs & Services** → **Credentials** → OAuth Client ID'nizi seçin

### 3. Authorized JavaScript Origins Ekleyin

```
http://localhost:3000
```

### 4. Authorized Redirect URIs Ekleyin

**ÖNEMLİ: Her iki URL'i de ekleyin!**

```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/auth/callback
```

⚠️ **Dikkat:**
- URL'lerin sonunda `/` (slash) OLMAMALI
- İkinci URL callback sayfamız için gerekli
- Her iki URL'i de eklemelisiniz

### 5. Kaydet Butonuna Basın

**Save** veya **Kaydet** butonuna tıklayın ve 30 saniye bekleyin.

---

## 🔧 Ortam Değişkenleri

`.env.local` dosyanızda bu değişkenlerin olduğundan emin olun:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/norvis_ai"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# JWT
JWT_SECRET="your-jwt-secret-key"
```

---

## 🎯 Kullanım Akışı

### Yeni Kullanıcı İçin:

1. Kullanıcı `/auth/login` sayfasına gider
2. "Google ile giriş yap" butonuna tıklar
3. Google hesabını seçer ve izinleri onaylar
4. NextAuth `/api/auth/callback/google` endpoint'ine yönlendirir
5. Backend `/auth/callback` sayfasına redirect eder
6. Callback sayfası:
   - Google profil bilgilerini alır
   - `/api/auth/google-callback` endpoint'ine POST eder
   - Database'e yeni kullanıcı kaydedilir
   - JWT token oluşturulur
   - Token ve kullanıcı bilgileri localStorage'a kaydedilir
   - AuthStore güncellenir
7. 🎉 Toast mesajı: "Hesap başarıyla oluşturuldu!"
8. `/chat` sayfasına yönlendirilir

### Mevcut Kullanıcı İçin:

1-6. Adımlar aynı (ama kullanıcı zaten database'de var)
7. 👋 Toast mesajı: "Hoş geldiniz!"
8. `/chat` sayfasına yönlendirilir

---

## 🗄️ Database Şeması

Google OAuth ile kayıt olan kullanıcılar için:

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?   // Google'dan gelen isim
  image     String?   // Google profil fotoğrafı URL
  password  String?   // OAuth users için NULL
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

---

## 🧪 Test Etme

### 1. PostgreSQL'in Çalıştığından Emin Olun

```bash
# Windows'ta PostgreSQL servisi kontrolü
Get-Service postgresql*
```

### 2. Development Server'ı Başlatın

```bash
npm run dev
```

### 3. Login Sayfasını Açın

```
http://localhost:3000/auth/login
```

### 4. Google ile Giriş Yapın

"Google ile giriş yap" butonuna tıklayın ve Google hesabınızı seçin.

### 5. Başarı Kontrolü

✅ `/chat` sayfasına yönlendirildiniz mi?
✅ Toast mesajı görünüyor mu?
✅ Profil fotoğrafınız görünüyor mu?

### 6. Database Kontrolü

```bash
# PostgreSQL'e bağlanın ve kontrol edin
psql -U postgres -d norvis_ai
SELECT * FROM "User" WHERE email = 'your-email@gmail.com';
```

---

## 🐛 Sorun Giderme

### Hata: "redirect_uri_mismatch"

✅ **Çözüm**: Google Cloud Console'da **her iki** redirect URI'ı ekleyin:
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3000/auth/callback`

### Hata: "Database connection failed"

✅ **Çözüm**: 
1. PostgreSQL'in çalıştığından emin olun
2. `.env.local` dosyasındaki `DATABASE_URL` doğru mu kontrol edin
3. `npx prisma db push` komutunu çalıştırın

### Hata: "Token invalid"

✅ **Çözüm**:
1. `JWT_SECRET` ve `NEXTAUTH_SECRET` tanımlı mı kontrol edin
2. En az 32 karakter olmalı
3. Development server'ı restart edin

### Callback Sayfası Sonsuz Döngüde

✅ **Çözüm**:
1. Browser console'u açın ve hataları kontrol edin
2. localStorage'ı temizleyin: `localStorage.clear()`
3. Tarayıcı cache'ini temizleyin

---

## 🔒 Güvenlik Notları

- ⚠️ Client Secret'ı **asla** Git'e commit etmeyin
- ⚠️ Production'da farklı JWT_SECRET kullanın
- ⚠️ NEXTAUTH_SECRET en az 32 karakter olmalı
- ✅ OAuth users için password NULL olarak saklanır
- ✅ Email unique constraint ile korunur

---

## 📊 Özellikler

✅ **Otomatik Kullanıcı Oluşturma**: Yeni kullanıcılar otomatik database'e kaydedilir
✅ **Profil Senkronizasyonu**: Google profil bilgileri her girişte güncellenir
✅ **JWT Token Yönetimi**: Güvenli token oluşturma ve doğrulama
✅ **AuthStore Entegrasyonu**: Client-side state management
✅ **Toast Bildirimleri**: Kullanıcı dostu mesajlar
✅ **Loading States**: Yükleme animasyonları
✅ **Error Handling**: Kapsamlı hata yönetimi

---

## 🚀 Production Deployment

Production'a deploy ederken:

1. **Google Cloud Console'da Production URL ekleyin:**
   ```
   https://yourdomain.com
   https://yourdomain.com/api/auth/callback/google
   https://yourdomain.com/auth/callback
   ```

2. **Environment Variables'ı güncelleyin:**
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   DATABASE_URL="your-production-database-url"
   ```

3. **Güvenlik:**
   - Güçlü ve benzersiz secrets kullanın
   - HTTPS zorunlu
   - Rate limiting ekleyin

---

## 📚 Ek Kaynaklar

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Documentation](https://www.prisma.io/docs)
