'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 second timeout

    initializeAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initializeAuth, setLoading]);

  return <>{children}</>;
}