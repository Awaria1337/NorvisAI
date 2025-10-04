# 🔐 OTP (2FA) Sistemi Kurulum Rehberi

## ✅ TAMAMLANAN İŞLER

### 1. Database ✅
- `otp` field eklendi (6 haneli kod)
- `otpExpires` field eklendi (5 dakika)
- `otpVerified` field eklendi
- `lastOtpSentAt` field eklendi (rate limiting için)
- Migration başarıyla uygulandı: `20251004191552_add_otp_fields`

### 2. Email Sistemi ✅
- `generateOTP()` fonksiyonu eklendi (6 haneli rastgele kod üretir)
- `sendOTPEmail()` fonksiyonu eklendi (güzel email template ile)
- Email template'i Türkçe ve profesyonel tasarım

### 3. API Endpoints ✅
- **POST /api/auth/send-otp** - OTP gönderir
  - Rate limiting (1 dakikada 1 OTP)
  - 5 dakika geçerlilik süresi
  - Email ile gönderim
  
- **POST /api/auth/verify-otp** - OTP'yi doğrular
  - OTP kontrolü
  - Süre kontrolü
  - JWT token üretir

---

## 🔧 YAPILMASI GEREKENLER

### 1. Login Flow'unu Güncelle

**Dosya:** `src/app/api/auth/login/route.ts`

Login başarılı olduğunda direkt token dönme, önce OTP gönder:

```typescript
// Login başarılı
if (user) {
  // OTP gönder
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpires, otpVerified: false, lastOtpSentAt: new Date() }
  });
  
  await sendOTPEmail(user.email, user.name, otp);
  
  return NextResponse.json({
    success: true,
    requiresOTP: true,
    email: user.email,
    message: 'Doğrulama kodu email adresinize gönderildi'
  });
}
```

### 2. Google OAuth'u Güncelle

**Dosya:** `src/app/api/auth/google-callback/route.ts`

Google ile giriş yapıldığında OTP gönder:

```typescript
// JWT token oluşturmadan önce OTP gönder
const otp = generateOTP();
const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

await prisma.user.update({
  where: { id: user.id },
  data: { otp, otpExpires, otpVerified: false, lastOtpSentAt: new Date() }
});

await sendOTPEmail(user.email, user.name, otp);

return NextResponse.json({
  success: true,
  requiresOTP: true,
  email: user.email,
  isNewUser,
  message: isNewUser 
    ? 'Hesap oluşturuldu! Doğrulama kodu gönderildi.' 
    : 'Doğrulama kodu gönderildi.'
});
```

### 3. OTP Input Component Oluştur

**Dosya:** `src/components/ui/otp-input.tsx`

```typescript
'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { cn } from '@/utils/cn';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export function OTPInput({ length = 6, onComplete, disabled }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    
    // Sadece rakam kabul et
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Bir sonraki input'a geç
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Tüm inputlar dolduysa callback'i çağır
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Boşsa önceki input'a geç
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...new Array(length - newOtp.length).fill('')]);
    
    if (newOtp.length === length) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-bold rounded-lg",
            "border-2 border-gray-300 dark:border-gray-600",
            "bg-white dark:bg-gray-800",
            "text-gray-900 dark:text-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
        />
      ))}
    </div>
  );
}
```

### 4. OTP Verification Sayfası Oluştur

**Dosya:** `src/app/auth/verify-otp/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Loader2, Mail } from 'lucide-react';
import { OTPInput } from '@/components/ui/otp-input';
import toast from 'react-hot-toast';

export default function VerifyOTPPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(300); // 5 dakika

  useEffect(() => {
    if (!email) {
      router.push('/auth/login');
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, router]);

  const handleOTPComplete = async (otp: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // Token'ı kaydet
        localStorage.setItem('token', data.token);
        
        toast.success('Giriş başarılı!');
        router.push('/chat');
      } else {
        toast.error(data.error || 'OTP doğrulanamadı');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Yeni kod gönderildi!');
        setTimer(300); // Timer'ı sıfırla
      } else {
        toast.error(data.error || 'Kod gönderilemedi');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Doğrulama Kodu
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>{email}</strong> adresine gönderilen 6 haneli kodu girin
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <OTPInput 
              length={6} 
              onComplete={handleOTPComplete}
              disabled={loading}
            />
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kod {timer > 0 ? (
                <span className="font-mono font-semibold">{formatTime(timer)}</span>
              ) : (
                <span className="text-red-600">süresi doldu</span>
              )} içinde geçerli
            </p>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResendOTP}
            disabled={resending || timer > 240}
            className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {resending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Yeni Kod Gönder
              </>
            )}
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>İpucu:</strong> Spam klasörünüzü kontrol edin. 
              Yeni kod isteyebilmeniz için 1 dakika beklemeniz gerekiyor.
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          <a href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Giriş sayfasına dön
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## 🧪 TEST ADIMLARI

### 1. Database Migration
```bash
npx prisma migrate dev --name add_otp_fields
npx prisma generate
```

### 2. Dev Server Restart
```bash
# Server'ı durdur (Ctrl+C)
npm run dev
```

### 3. Normal Login Testi
1. Login sayfasına git
2. Email/şifre ile giriş yap
3. **OTP sayfasına yönlendirilmeli**
4. Email'ini kontrol et (6 haneli kod)
5. Kodu gir
6. Chat sayfasına girilmeli

### 4. Google OAuth Testi
1. "Google ile Giriş Yap" tıkla
2. Google hesabını seç
3. **OTP sayfasına yönlendirilmeli**
4. Email'ini kontrol et
5. Kodu gir
6. Chat sayfasına girilmeli

---

## 📊 FLOW DİYAGRAMI

```
┌─────────────────┐
│  Login / OAuth  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Credentials    │
│  Doğrulama      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OTP Oluştur    │
│  ve Gönder      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OTP Sayfası    │
│  (6 Haneli)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OTP Doğrula    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JWT Token Ver  │
│  Chat'e Yönlen  │
└─────────────────┘
```

---

## 🔐 GÜVENLİK ÖZELLİKLERİ

- ✅ **Rate Limiting:** 1 dakikada 1 OTP
- ✅ **Zaman Aşımı:** 5 dakika
- ✅ **6 Haneli Kod:** 1 milyon kombinasyon
- ✅ **Tek Kullanımlık:** Doğrulandıktan sonra silinir
- ✅ **Email Doğrulaması:** Her girişte OTP
- ✅ **Güvenli Storage:** Database'de hash'lenmemiş (sadece 5 dk geçerli)

---

## 📝 YAPILACAKLAR LİSTESİ

- [ ] Login route'unu güncelle
- [ ] Google OAuth route'unu güncelle
- [ ] OTPInput component'ini oluştur
- [ ] Verify OTP sayfasını oluştur
- [ ] Dev server'ı restart et
- [ ] Login flow'unu test et
- [ ] Google OAuth flow'unu test et
- [ ] Email'lerin geldiğini doğrula
- [ ] OTP doğrulamasını test et

---

## 🆘 SORUN GİDERME

### OTP Email'i Gelmiyor
- `.env` dosyasındaki SMTP ayarlarını kontrol et
- `node test-email-simple.js` ile test et
- Spam klasörünü kontrol et

### OTP Süresi Doldu
- Yeni kod iste (1 dakika bekle)
- Timer 5 dakika

### OTP Geçersiz
- Doğru kodu girdiğinden emin ol
- Büyük/küçük harf yok, sadece rakam
- 6 haneli olmalı

---

Hazır mısın? Kalan adımları tamamlayalım! 🚀
