'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthUI } from '@/components/ui/auth-fuse';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');
  
  const { loginUser, registerUser, isLoading, login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showOTP, setShowOTP] = React.useState(false);
  const [otpEmail, setOtpEmail] = React.useState<string>('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = React.useState(false);
  const [forgotPasswordEmailSent, setForgotPasswordEmailSent] = React.useState(false);
  const [showResetPassword, setShowResetPassword] = React.useState(false);
  const [isResetPasswordLoading, setIsResetPasswordLoading] = React.useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = React.useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = React.useState(false);

  // Check if there's a reset token in URL
  React.useEffect(() => {
    if (resetToken) {
      verifyResetToken(resetToken);
    }
  }, [resetToken]);

  const verifyResetToken = async (token: string) => {
    setIsVerifyingToken(true);
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setShowResetPassword(true);
      } else {
        toast.error(data.error || 'Geçersiz veya süresi dolmuş bağlantı');
        router.push('/auth/login');
      }
    } catch (error) {
      toast.error('Bağlantı doğrulanamadı');
      router.push('/auth/login');
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      console.log('⚠️ Form already submitting, ignoring...');
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await loginUser({ email, password });
      console.log('📦 Login result:', result);
      
      // Check if OTP is required
      if ('requiresOTP' in result && result.requiresOTP) {
        console.log('✅ OTP required! Setting showOTP to true');
        console.log('📧 OTP Email:', result.email);
        toast.success('Doğrulama kodu email adresinize gönderildi');
        setOtpEmail(result.email);
        setShowOTP(true);
        console.log('🎯 showOTP state set to:', true);
        return;
      }
      
      // Normal login success
      if ('success' in result && result.success) {
        toast.success('Giriş başarılı!');
        router.push(ROUTES.CHAT);
      } else {
        toast.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      console.log('⚠️ Form already submitting, ignoring...');
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const success = await registerUser({ name, email, password });
      
      if (success) {
        toast.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
        router.push(ROUTES.CHAT);
      } else {
        toast.error('Kayıt başarısız. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    if (otp.length !== 6) {
      toast.error('Lütfen 6 haneli kodu girin');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Giriş başarılı!');
        
        // Set auth state
        if (data.token && data.user) {
          login(data.user, data.token);
        }
        
        // Redirect to chat
        router.push(ROUTES.CHAT);
      } else {
        toast.error(data.error || 'Doğrulama başarısız');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOTPResend = async () => {
    setIsResending(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Yeni kod gönderildi');
      } else {
        toast.error(data.error || 'Kod gönderilemedi');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPBack = () => {
    setShowOTP(false);
    setOtpEmail('');
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔵 Starting Google sign-in...');
      // Reset OTP state before Google sign-in
      setShowOTP(false);
      setOtpEmail('');
      
      // Redirect to callback page for auth processing
      await signIn('google', {
        callbackUrl: '/auth/callback',
        redirect: true,
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Google ile giriş sırasında bir hata oluştu.');
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setShowOTP(false);
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    setIsForgotPasswordLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordEmailSent(true);
        toast.success('Şifre sıfırlama bağlantısı gönderildi!');
      } else {
        toast.error(data.error || 'Sıfırlama bağlantısı gönderilemedi');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleForgotPasswordBack = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmailSent(false);
  };

  const handleResetPasswordSubmit = async (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır');
      return;
    }

    setIsResetPasswordLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetPasswordSuccess(true);
        toast.success('Şifre başarıyla sıfırlandı!');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        toast.error(data.error || 'Şifre sıfırlanamadı');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsResetPasswordLoading(false);
    }
  };

  const handleResetPasswordBack = () => {
    setShowResetPassword(false);
    setResetPasswordSuccess(false);
    router.push('/auth/login');
  };

  console.log('🔄 Render - showOTP:', showOTP, 'otpEmail:', otpEmail, 'showForgotPassword:', showForgotPassword, 'showResetPassword:', showResetPassword);

  // Show loading while verifying token
  if (isVerifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Sıfırlama bağlantısı doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthUI 
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onGoogleSignIn={handleGoogleSignIn}
      showOTP={showOTP}
      otpEmail={otpEmail}
      onOTPVerify={handleOTPVerify}
      onOTPResend={handleOTPResend}
      onOTPBack={handleOTPBack}
      isVerifying={isVerifying}
      isResending={isResending}
      showForgotPassword={showForgotPassword}
      onForgotPasswordSubmit={handleForgotPasswordSubmit}
      onForgotPasswordBack={handleForgotPasswordBack}
      isForgotPasswordLoading={isForgotPasswordLoading}
      forgotPasswordEmailSent={forgotPasswordEmailSent}
      onForgotPasswordClick={handleForgotPasswordClick}
      showResetPassword={showResetPassword}
      onResetPasswordSubmit={handleResetPasswordSubmit}
      onResetPasswordBack={handleResetPasswordBack}
      isResetPasswordLoading={isResetPasswordLoading}
      resetPasswordSuccess={resetPasswordSuccess}
    />
  );
};

export default LoginPage;


