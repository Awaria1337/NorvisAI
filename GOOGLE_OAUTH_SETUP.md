# Google OAuth Kurulum Rehberi

Bu rehber, Norvis AI uygulamanızda Google ile giriş özelliğini aktif hale getirmeniz için gerekli adımları içerir.

## 1. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. Sol menüden **APIs & Services** > **Credentials** seçeneğine gidin

## 2. OAuth Consent Screen Yapılandırması

1. **OAuth consent screen** sekmesine tıklayın
2. **External** seçeneğini seçin ve **Create** butonuna tıklayın
3. Gerekli bilgileri doldurun:
   - **App name**: Norvis AI
   - **User support email**: Sizin email adresiniz
   - **Developer contact information**: Sizin email adresiniz
4. **Save and Continue** butonuna tıklayın
5. **Scopes** ekranında **Save and Continue** yapın (varsayılan scope'lar yeterli)
6. **Test users** ekranında test kullanıcılarını ekleyin (opsiyonel)
7. **Summary** ekranında **Back to Dashboard** butonuna tıklayın

## 3. OAuth Client ID Oluşturma

1. **Credentials** sekmesine gidin
2. **+ CREATE CREDENTIALS** butonuna tıklayın
3. **OAuth client ID** seçeneğini seçin
4. **Application type** olarak **Web application** seçin
5. İsim verin (örn: "Norvis AI Web Client")
6. **Authorized JavaScript origins** bölümüne ekleyin:
   ```
   http://localhost:3000
   https://yourdomain.com (production için)
   ```
7. **Authorized redirect URIs** bölümüne ekleyin:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google (production için)
   ```
8. **Create** butonuna tıklayın

## 4. Credentials'ı Kopyalama

Oluşturma tamamlandığında, ekranda **Client ID** ve **Client Secret** görünecektir.
Bu bilgileri kopyalayın ve güvenli bir yerde saklayın.

## 5. Environment Variables Yapılandırması

`.env.local` dosyanızı açın (veya oluşturun) ve aşağıdaki değişkenleri ekleyin:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="rastgele-güçlü-bir-secret-oluşturun"

# Google OAuth
GOOGLE_CLIENT_ID="sizin-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="sizin-client-secret"
```

### NEXTAUTH_SECRET Oluşturma

Terminal'de aşağıdaki komutu çalıştırarak güçlü bir secret oluşturabilirsiniz:

```bash
openssl rand -base64 32
```

veya PowerShell'de:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 6. Uygulamayı Yeniden Başlatma

Environment variables'ı güncelledikten sonra development server'ı yeniden başlatın:

```bash
npm run dev
```

## 7. Test Etme

1. [http://localhost:3000/auth/login](http://localhost:3000/auth/login) adresine gidin
2. "Google ile giriş yap" butonuna tıklayın
3. Google hesabınızı seçin ve izinleri onaylayın
4. Başarıyla giriş yapılmalı ve chat sayfasına yönlendirilmelisiniz

## Sorun Giderme

### "Access blocked: This app's request is invalid"

- OAuth consent screen yapılandırmasını kontrol edin
- Authorized redirect URIs'in doğru olduğundan emin olun

### "redirect_uri_mismatch" hatası

- Authorized redirect URIs listesinde doğru URL'in olduğundan emin olun
- URL'nin tam olarak eşleştiğinden emin olun (trailing slash olmadan)

### Environment variables çalışmıyor

- `.env.local` dosyasının proje root dizininde olduğundan emin olun
- Development server'ı yeniden başlatın
- Environment variable isimlerinin doğru olduğundan emin olun

## Production Deployment

Production'a deploy ederken:

1. Google Cloud Console'da production URL'inizi **Authorized JavaScript origins** ve **Authorized redirect URIs** listesine ekleyin
2. Production environment variables'ı güncelleyin
3. `NEXTAUTH_URL` değişkenini production domain'inizle değiştirin

## Güvenlik Notları

- ⚠️ **Client Secret'ı asla client-side kodda kullanmayın**
- ⚠️ **Client ID ve Secret'ı Git repository'ye commit etmeyin**
- ⚠️ **Production'da güçlü ve benzersiz bir NEXTAUTH_SECRET kullanın**
- ✅ Test kullanıcıları listesini güncel tutun
- ✅ OAuth consent screen'de gerekli bilgileri doğru doldurun

## Ek Kaynaklar

- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
