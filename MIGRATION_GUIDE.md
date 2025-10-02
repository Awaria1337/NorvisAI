# 🚀 Migration Guide - Admin Panel & System Settings

## 📋 Yapılan Değişiklikler

### ✅ 1. Database Schema Güncellemeleri
- **Admin** modeli eklendi (admin user management)
- **SystemSettings** modeli eklendi (site settings)
- Admin auth sistemi güncellendi

### ✅ 2. Yeni Özellikler
- ✅ **Bakım Modu**: Admin panelden aktif/pasif yapılabiliyor
- ✅ **Kayıt Kontrolü**: Yeni kullanıcı kaydı açma/kapama
- ✅ **404 Sayfası**: Professional not found page
- ✅ **Maintenance Page**: Professional bakım modu sayfası
- ✅ **Middleware**: Otomatik bakım modu redirect

---

## 🔧 Kurulum Adımları

### Step 1: Database Migration

```bash
# Prisma generate (client güncelle)
npx prisma generate

# Migration oluştur
npx prisma migrate dev --name add_admin_and_settings

# Alternatif: Migration dosyası manual oluştur
npx prisma migrate dev --create-only --name add_admin_and_settings
# Sonra apply et:
npx prisma migrate deploy
```

### Step 2: Admin Hesabı Oluştur

Script ile admin hesabı oluşturun:

```bash
# Admin oluşturma scripti
node scripts/create-new-admin.ts
```

Veya manuel olarak (Prisma Studio kullanarak):

```bash
npx prisma studio
```

Admin modeline gidip manuel ekleyin:
- **email**: admin@norvis.ai
- **name**: Admin User  
- **password**: (hash'lenmiş şifre - create-admin script'i kullanın)
- **role**: admin
- **active**: true

### Step 3: İlk System Settings Oluştur

Database'de ilk kez sistem ayarları yüklenecek. Şu endpoint'i çağırın:

```bash
# Test için (development)
curl http://localhost:3000/api/admin/settings \
  -H "Cookie: admin_token=YOUR_ADMIN_TOKEN"
```

Settings otomatik oluşturulacak.

---

## 🧪 Test Adımları

### 1. Admin Login Test

```bash
cd C:\Users\zilel\Desktop\Norvis.ai

# Development server başlat
npm run dev

# Browser'da:
# http://localhost:3000/admin/login

# Giriş yap:
Email: admin@norvis.ai
Password: (oluşturduğunuz şifre)
```

### 2. Settings Page Test

```bash
# Admin panele giriş yaptıktan sonra:
# http://localhost:3000/admin/settings

# Test edilecekler:
✅ Sayfa yükleniyor mu?
✅ Ayarlar görünüyor mu?
✅ Toggle'lar çalışıyor mu?
✅ Kaydet butonu çalışıyor mu?
```

### 3. Bakım Modu Test

```bash
# Admin settings'te:
1. "Bakım Modu" toggle'ı AÇ
2. "Değişiklikleri Kaydet" butonuna bas
3. Yeni bir incognito tab aç
4. http://localhost:3000 adresine git
5. Maintenance sayfasına yönlendirme olmalı ✅
6. Admin panelden bakım modunu KAPAT
7. Normal siteye erişim olmalı ✅
```

### 4. Kayıt Kontrolü Test

```bash
# Admin settings'te:
1. "Yeni Kayıt İzni" toggle'ı KAPAT
2. Kaydet
3. Logout ol
4. Register sayfasına git: http://localhost:3000/auth/register
5. Kayıt olmayı dene
6. "Kayıt alımı kapatılmıştır" hatası almalısın ✅
7. Admin'den toggle'ı AÇ
8. Kayıt tekrar çalışmalı ✅
```

### 5. 404 Page Test

```bash
# Browser'da:
http://localhost:3000/bu-sayfa-yok-123

# Beklenen:
✅ Professional 404 page görülmeli
✅ "Ana Sayfaya Git" butonu çalışmalı
✅ "Geri Dön" butonu çalışmalı
✅ Logo görünmeli
✅ Dark mode uyumlu olmalı
```

---

## 🐛 Troubleshooting

### Problem: Migration hatası alıyorum

```bash
# Çözüm 1: Prisma client'ı tekrar generate et
npx prisma generate

# Çözüm 2: .env dosyasını kontrol et
# DATABASE_URL doğru mu?

# Çözüm 3: Manual migration
npx prisma migrate reset
npx prisma migrate dev
```

### Problem: Admin login çalışmıyor

```bash
# Admin hesabını kontrol et:
npx prisma studio
# Admins tablosuna bak
# active: true olmalı
# password: hash'lenmiş olmalı

# Yeni admin oluştur:
node scripts/create-new-admin.ts
```

### Problem: Settings yüklenmiyor

```bash
# Console'da error mesajına bak
# Muhtemelen Prisma client güncellenmemiş:
npx prisma generate

# Dev server'ı restart et:
# Ctrl+C -> npm run dev
```

### Problem: Middleware çalışmıyor

```bash
# middleware.ts doğru konumda mı?
# src/middleware.ts olmalı (root'ta değil!)

# Dev server restart:
npm run dev
```

---

## 📊 Feature Flags

Admin panelden yönetilebilen özellikler:

| Özellik | Açıklama | Default |
|---------|----------|---------|
| `maintenanceMode` | Site bakım modu | `false` |
| `allowRegistration` | Yeni kayıt izni | `true` |
| `enableImageGeneration` | Görsel oluşturma | `true` |
| `enableNotifications` | Bildirimler | `true` |
| `enableAnalytics` | Analytics | `false` |
| `enableCaching` | Cache sistemi | `true` |

---

## 🎉 Başarı Kontrol Listesi

Test öncesi kontrol et:

- [ ] Database migration tamamlandı
- [ ] Admin hesabı oluşturuldu
- [ ] Admin panele giriş yapılabildi
- [ ] Settings sayfası açıldı
- [ ] Bakım modu testi başarılı
- [ ] Kayıt kontrolü testi başarılı
- [ ] 404 sayfası çalışıyor
- [ ] Maintenance sayfası çalışıyor

Hepsi ✅ ise, hazırsın! 🚀

---

## 📞 Destek

Sorun yaşarsan:
1. Console'daki error mesajlarını kontrol et
2. Database connection'ı test et
3. Prisma generate ve restart yap
4. MIGRATION_GUIDE.md'yi tekrar oku

Başarılar! 🎊
