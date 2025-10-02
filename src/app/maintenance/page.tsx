'use client';

import { useEffect, useState } from 'react';
import { Settings, Clock, RefreshCw, Mail, Twitter, Github, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  const [dots, setDots] = useState('.');

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 opacity-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-6">
        {/* Main Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src="/norvis_logo.png"
                alt="Norvis AI"
                className="h-20 w-20 object-contain dark:brightness-0 dark:invert"
              />
              <div className="absolute inset-0 blur-3xl opacity-20 bg-primary animate-pulse"></div>
            </div>
          </div>

          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative inline-flex">
              <div className="absolute inset-0 animate-ping opacity-20">
                <div className="w-24 h-24 bg-primary rounded-full"></div>
              </div>
              <div className="relative">
                <Settings className="h-24 w-24 text-primary animate-spin-slow" />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center space-y-6 mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Bakım Çalışması
            </h1>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full">
              <Clock className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">
                Geçici olarak kapalı{dots}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-muted/30 rounded-2xl p-8 mb-10 border border-border/50">
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              Sistemimiz şu anda daha iyi hizmet verebilmek için bakım çalışması yapıyor. 
              Kısa süre içinde tekrar hizmetinizdeyiz.
            </p>
          </div>

          {/* Features Under Maintenance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-muted/20 rounded-xl p-6 border border-border/50 text-center hover:bg-muted/30 transition-colors">
              <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Sistem Güncellemesi</h3>
              <p className="text-sm text-muted-foreground">Yeni versiyon yükleniyor</p>
            </div>
            <div className="bg-muted/20 rounded-xl p-6 border border-border/50 text-center hover:bg-muted/30 transition-colors">
              <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Wrench className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Performans İyileştirmesi</h3>
              <p className="text-sm text-muted-foreground">Hız optimizasyonu</p>
            </div>
            <div className="bg-muted/20 rounded-xl p-6 border border-border/50 text-center hover:bg-muted/30 transition-colors">
              <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Yeni Özellikler</h3>
              <p className="text-sm text-muted-foreground">Geliştirmeler yolda</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              onClick={handleRefresh}
              size="lg"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sayfayı Yenile
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              asChild
            >
              <a href="mailto:support@norvis.ai">
                <Mail className="h-4 w-4" />
                Destek Ekibi
              </a>
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 pt-8 border-t border-border">
            <a
              href="#"
              className="h-12 w-12 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
            <a
              href="#"
              className="h-12 w-12 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
            <a
              href="mailto:support@norvis.ai"
              className="h-12 w-12 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all hover:scale-110"
              aria-label="Email"
            >
              <Mail className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              © 2025 Norvis AI. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for slow spin */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
