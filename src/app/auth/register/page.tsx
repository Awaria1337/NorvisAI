'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

const RegisterPage = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login page (AuthUI handles both login and register)
    router.push(ROUTES.LOGIN);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Yönlendiriliyor...</p>
    </div>
  );
};

export default RegisterPage;
