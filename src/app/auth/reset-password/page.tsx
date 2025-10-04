'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  // Redirect to login page with token
  useEffect(() => {
    if (token) {
      router.push(`/auth/login?token=${token}`);
    } else {
      router.push('/auth/login');
    }
  }, [token, router]);

  // Just show a simple loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
