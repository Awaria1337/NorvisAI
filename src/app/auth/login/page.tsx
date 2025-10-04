'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthUI } from '@/components/ui/auth-fuse';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { loginUser, registerUser, isLoading, login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showOTP, setShowOTP] = React.useState(false);
  const [otpEmail, setOtpEmail] = React.useState<string>('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);

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

  console.log('🔄 Render - showOTP:', showOTP, 'otpEmail:', otpEmail);

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
    />
  );
};

export default LoginPage;


