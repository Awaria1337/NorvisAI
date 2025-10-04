'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 dakika
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email kontrolü
  useEffect(() => {
    if (!email) {
      toast.error('Email adresi bulunamadı');
      router.push('/auth/login');
    }
  }, [email, router]);

  // Geri sayım
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // OTP input'u için focus yönetimi
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Sadece rakam

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Otomatik bir sonraki input'a geç
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Tüm inputlar dolduysa otomatik doğrula
    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp.slice(0, 6));

    // Son dolu input'a focus
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Eğer 6 haneli kod yapıştırıldıysa otomatik doğrula
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      toast.error('Lütfen 6 haneli kodu girin');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Giriş başarılı!');
        
        // Token'ı localStorage'a kaydet
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        // Kullanıcı bilgilerini kaydet
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Ana sayfaya yönlendir
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        toast.error(data.error || 'Doğrulama başarısız');
        // Hatalı girişte input'ları temizle
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;

    setResending(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Yeni kod gönderildi');
        setTimeLeft(300); // Timer'ı sıfırla
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.error || 'Kod gönderilemedi');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
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
        {/* Back Button */}
        <Link 
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Doğrulama Kodu
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            <Mail className="inline w-4 h-4 mr-1" />
            <span className="font-medium">{email}</span> adresine gönderilen 6 haneli kodu girin
          </p>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kod geçerlilik süresi: <span className="font-medium text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                Kodun süresi doldu
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || otp.join('').length !== 6}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Doğrulanıyor...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Doğrula
              </>
            )}
          </button>

          {/* Resend Button */}
          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={!canResend || resending}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Gönderiliyor...
                </span>
              ) : canResend ? (
                'Yeni kod gönder'
              ) : (
                `Yeni kod isteyebilirsiniz (${formatTime(timeLeft)})`
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Kodu almadınız mı?{' '}
          <Link href="/faq" className="text-blue-600 dark:text-blue-400 hover:underline">
            Yardım alın
          </Link>
        </p>
      </div>
    </div>
  );
}
