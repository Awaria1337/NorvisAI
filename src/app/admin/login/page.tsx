'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminLoginForm {
  identifier: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AdminLoginForm>();

  const onSubmit = async (data: AdminLoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        // Store admin token
        localStorage.setItem('adminToken', result.data.token);
        localStorage.setItem('adminUser', JSON.stringify(result.data.admin));
        
        toast.success('Yönetim paneline hoş geldiniz!');
        
        // Redirect to dashboard
        router.push('/admin/dashboard');
      } else {
        setError(result.error || 'Login failed');
        toast.error(result.error || 'Giriş başarısız');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError('Ağ hatası. Lütfen tekrar deneyin.');
      toast.error('Ağ hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Yönetim Paneli
          </h1>
          <p className="text-muted-foreground">
            Norvis AI Yönetici Girişi
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Username/Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Kullanıcı Adı veya Email
              </label>
              <Input
                type="text"
                placeholder="Kullanıcı adınızı veya email adresinizi girin"
                className={`h-12 ${errors.identifier ? 'border-destructive' : ''}`}
                {...register('identifier', {
                  required: 'Kullanıcı adı veya email gereklidir'
                })}
              />
              {errors.identifier && (
                <p className="text-sm text-destructive">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Şifre
              </label>
              <Input
                type="password"
                placeholder="Şifrenizi girin"
                className={`h-12 ${errors.password ? 'border-destructive' : ''}`}
                {...register('password', {
                  required: 'Şifre gereklidir',
                  minLength: {
                    value: 8,
                    message: 'Şifre en az 8 karakter olmalıdır'
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Giriş Yapılıyor...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Yönetim Paneline Giriş Yap</span>
                </div>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              🔒 Bu güvenli bir yönetici alanıdır. Tüm aktiviteler kaydedilir.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Norvis AI © 2025 - All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
