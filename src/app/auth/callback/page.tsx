'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (status === 'loading') {
        return; // Still loading session
      }

      if (status === 'unauthenticated') {
        toast.error('Kimlik doğrulama başarısız');
        router.push(ROUTES.LOGIN);
        return;
      }

      if (status === 'authenticated' && session?.user) {
        try {
          // Get JWT token from our backend
          const response = await fetch('/api/auth/google-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
              image: session.user.image,
            }),
          });

          const data = await response.json();

          if (data.success && data.token) {
            // Save token to localStorage
            localStorage.setItem('token', data.token);
            
            // Update authStore with user info
            setUser({
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.image,
            });

            // Show success message
            if (data.isNewUser) {
              toast.success('🎉 ' + (data.message || 'Hesap başarıyla oluşturuldu!'));
            } else {
              toast.success('👋 ' + (data.message || 'Hoş geldiniz!'));
            }
            
            // Small delay for better UX
            setTimeout(() => {
              router.push(ROUTES.CHAT);
            }, 500);
          } else {
            toast.error('Giriş işlemi başarısız');
            router.push(ROUTES.LOGIN);
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          toast.error('Bir hata oluştu');
          router.push(ROUTES.LOGIN);
        }
      }
    };

    handleGoogleAuth();
  }, [session, status, router, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Yükleniyor...
          </span>
        </div>
        <p className="mt-4 text-muted-foreground">Google ile giriş yapılıyor...</p>
      </div>
    </div>
  );
}
