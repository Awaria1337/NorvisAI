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
  const { loginUser, registerUser } = useAuthStore();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const success = await loginUser({ email, password });
      
      if (success) {
        toast.success('Giriş başarılı!');
        router.push(ROUTES.CHAT);
      } else {
        toast.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
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
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        callbackUrl: ROUTES.CHAT,
        redirect: true,
      });
      
      if (result?.error) {
        toast.error('Google ile giriş başarısız oldu.');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Google ile giriş sırasında bir hata oluştu.');
    }
  };

  return (
    <AuthUI 
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
};

export default LoginPage;


