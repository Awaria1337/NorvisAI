# Google OAuth Redirect URI Hatası Çözümü

## ❌ Hata:
```
redirect_uri_mismatch
Google'ın OAuth 2.0 politikasına uymadığı için bu uygulamada oturum açamazsınız.
```

## ✅ Çözüm (2 Dakika):

### 1. Google Cloud Console'a Gidin
https://console.cloud.google.com/

### 2. Credentials Sayfasını Açın
- Sol menüden **APIs & Services** → **Credentials**
- OAuth 2.0 Client ID'nizi bulun ve tıklayın

### 3. Authorized redirect URIs Ekleyin

**TAM OLARAK** şu URL'i ekleyin (kopyala-yapıştır yapın):

```
http://localhost:3000/api/auth/callback/google
```

⚠️ **DİKKAT:**
- URL'nin sonunda `/` (slash) OLMAMALI
- `http://` ile başlamalı (https değil, local için)
- Port numarası `:3000` olmalı
- Path tam olarak `/api/auth/callback/google` olmalı

### 4. Authorized JavaScript origins Ekleyin

```
http://localhost:3000
```

### 5. Kaydet Butonuna Basın

**Save** veya **Kaydet** butonuna tıklayın.

### 6. Birkaç Saniye Bekleyin

Google'ın değişiklikleri yayması 10-30 saniye sürebilir.

### 7. Sayfayı Yenileyin ve Tekrar Deneyin

Tarayıcıyı yenileyin ve "Google ile giriş yap" butonuna tekrar tıklayın.

---

## 📸 Doğru Ayarlar Örneği:

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

## 🔄 Production İçin (İleride):

Production'a deploy ettiğinizde aynı işlemi production URL'iniz için yapın:

**Authorized JavaScript origins:**
```
https://yourdomain.com
```

**Authorized redirect URIs:**
```
https://yourdomain.com/api/auth/callback/google
```
