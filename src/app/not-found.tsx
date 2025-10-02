'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, MessageSquare, Mail } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/norvis_logo.png"
            alt="Norvis AI"
            className="h-20 w-20 object-contain brightness-0 invert dark:brightness-100 dark:invert-0"
          />
        </div>

        {/* 404 Animation */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Sayfa Bulunamadı
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm mb-1">AI Chat</h3>
            <p className="text-xs text-muted-foreground">
              AI asistanınızla sohbet başlatın
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
            <Search className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm mb-1">Arama</h3>
            <p className="text-xs text-muted-foreground">
              Sohbet geçmişinizde arama yapın
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
            <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm mb-1">Destek</h3>
            <p className="text-xs text-muted-foreground">
              Yardım için bizimle iletişime geçin
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>

          <Link href="/chat">
            <Button size="lg" className="min-w-[200px]">
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfaya Git
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-12 text-sm text-muted-foreground">
          <p>
            Sorun devam ederse,{' '}
            <a href="mailto:support@norvis.ai" className="text-primary hover:underline">
              destek ekibimize
            </a>{' '}
            bildirin.
          </p>
        </div>
      </div>
    </div>
  );
}
