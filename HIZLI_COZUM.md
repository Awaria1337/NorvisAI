# 🚨 Google OAuth Redirect URI Hatası - Hızlı Çözüm

## ❌ Aldığınız Hata:
```
redirect_uri_mismatch
İstek ayrıntıları: redirect_uri=http://localhost:3000/api/auth/callback/google
```

## ✅ ÇÖZÜM (2 Dakika):

### Adım 1: Google Cloud Console
https://console.cloud.google.com/apis/credentials

### Adım 2: OAuth Client ID'nizi Bulun
```
Client ID: 783460253353-06a6b3mn7l47rdkrsr93j9i24uvtj30r.apps.googleusercontent.com
```

Yanındaki **KALEM (EDIT)** ikonuna tıklayın.

### Adım 3: Authorized redirect URIs
**"ADD URI"** butonuna tıklayın ve **TAM OLARAK** şunu ekleyin:

```
http://localhost:3000/api/auth/callback/google
```

### ⚠️ YAPILANLAR KONTROL LİSTESİ:

- [ ] URL sonunda `/` (slash) YOK ✅
- [ ] `http://` ile başlıyor (https değil) ✅
- [ ] Port `:3000` var ✅
- [ ] Path tam olarak `/api/auth/callback/google` ✅
- [ ] Başında veya sonunda boşluk yok ✅

### Adım 4: SAVE (Kaydet)
**SAVE** butonuna basın ve 30 saniye bekleyin.

### Adım 5: Temizlik
1. Tarayıcınızı tamamen kapatın
2. Tekrar açın
3. Yeni bir gizli sekme açın (Ctrl+Shift+N)
4. http://localhost:3000/auth/login adresine gidin
5. Google ile giriş yapın

---

## 📸 Doğru Yapılandırma:

### Authorized JavaScript origins:
```
http://localhost:3000
```

### Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
```

**NOT:** Sadece bir tane redirect URI yeterli. İkinci URL'yi (/auth/callback) şimdilik eklemeyin.

---

## 🔄 Alternatif Çözüm:

Eğer hala çalışmıyorsa, Client ID'yi silip yeni oluşturun:

1. Google Cloud Console'da mevcut OAuth Client ID'yi silin
2. Yeni bir OAuth 2.0 Client ID oluşturun
3. Redirect URI'ları doğru ekleyin
4. Yeni Client ID ve Secret'ı `.env.local` dosyasına kopyalayın
5. Development server'ı restart edin

---

## 📞 Destek

Hala çalışmıyorsa:
1. Ekran görüntüsü alın (Google Cloud Console'daki ayarlar)
2. Browser console'u açın (F12) ve hataları kopyalayın
3. Bana gönderin
