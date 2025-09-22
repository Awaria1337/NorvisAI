'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Sparkles,
  MessageCircle,
  Upload,
  Clock,
  Zap,
  Database,
  Search,
  FileVideo,
  Code,
  Users,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const PricingPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'personal' | 'business'>('personal');

  const handleClose = () => {
    router.push(ROUTES.CHAT);
  };
  const personalPlans = [
    {
      name: 'Ücretsiz',
      price: 0,
      period: 'USD / ay',
      description: 'Günlük görevler için zeka',
      buttonText: 'Mevcut planın',
      buttonVariant: 'outline' as const,
      popular: false,
      features: [
        { text: 'GPT-5\'e erişim', included: true, icon: <Sparkles className="h-4 w-4" /> },
        { text: 'Sınırlı dosya yüklemesi', included: true, icon: <Upload className="h-4 w-4" /> },
        { text: 'Sınırlı ve daha yavaş görsel üretim', included: true, icon: <Clock className="h-4 w-4" /> },
        { text: 'Sınırlı bellek ve bağlam', included: true, icon: <Database className="h-4 w-4" /> },
        { text: 'Sınırlı derin araştırma', included: true, icon: <Search className="h-4 w-4" /> }
      ],
      footer: 'Mevcut bir planın mı var? Faturalama yardımına bak'
    },
    {
      name: 'Plus',
      price: 20,
      period: 'USD / ay',
      description: 'Gelişmiş zekaya daha fazla erişim',
      buttonText: 'Plus edin',
      buttonVariant: 'default' as const,
      popular: true,
      features: [
        { text: 'Gelişmiş akıl yürütme özelliği GPT-5', included: true, icon: <Sparkles className="h-4 w-4" /> },
        { text: 'Geliştmiş mesajlaşma ve yüklemeler', included: true, icon: <MessageCircle className="h-4 w-4" /> },
        { text: 'Gelişmiş ve daha hızlı görsel oluşturma', included: true, icon: <Zap className="h-4 w-4" /> },
        { text: 'Gelişmiş bellek ve bağlam', included: true, icon: <Database className="h-4 w-4" /> },
        { text: 'Projeler görevler, özel GPT\'ler', included: true, icon: <Users className="h-4 w-4" /> },
        { text: 'Sera video üretimi', included: true, icon: <FileVideo className="h-4 w-4" /> },
        { text: 'Codex ajanı', included: true, icon: <Code className="h-4 w-4" /> }
      ]
    },
    {
      name: 'Pro',
      price: 200,
      period: 'USD / ay',
      description: 'ChatGPT\'nin en iyi özelliklerine tam erişim',
      buttonText: 'Pro edin',
      buttonVariant: 'outline' as const,
      popular: false,
      features: [
        { text: 'Pro akıl yürütme yeteneğine sahip GPT-5', included: true, icon: <Crown className="h-4 w-4" /> },
        { text: 'Sınırsız mesajlar ve yüklemeler', included: true, icon: <MessageCircle className="h-4 w-4" /> },
        { text: 'Sınırsız ve daha hızlı görsel oluşturma', included: true, icon: <Zap className="h-4 w-4" /> },
        { text: 'Maksimum bellek ve bağlam', included: true, icon: <Database className="h-4 w-4" /> },
        { text: 'Maksimum derin araştırma ve ajanı modu', included: true, icon: <Search className="h-4 w-4" /> },
        { text: 'Gelişmiş projeler, görevler ve özel GPT\'ler', included: true, icon: <Users className="h-4 w-4" /> },
        { text: 'Gelişmiş Sera video üretimi', included: true, icon: <FileVideo className="h-4 w-4" /> },
        { text: 'Gelişmiş Codex ajanı', included: true, icon: <Code className="h-4 w-4" /> },
        { text: 'Yeni özelliklerin araştırma ön izlemesi', included: true, icon: <Sparkles className="h-4 w-4" /> }
      ],
      footer: 'Şartnamal banyetine sınırsız olarak tabidır. Daha fazla bilgi'
    }
  ];

  const businessPlans = [
    {
      name: 'Ücretsiz',
      price: 0,
      period: 'USD / ay',
      description: 'Günlük görevler için zeka',
      buttonText: 'Mevcut planın',
      buttonVariant: 'outline' as const,
      popular: false,
      features: [
        { text: 'GPT-5\'e erişim', included: true, icon: <Sparkles className="h-4 w-4" /> },
        { text: 'Sınırlı dosya yüklemesi', included: true, icon: <Upload className="h-4 w-4" /> },
        { text: 'Sınırlı ve daha yavaş görsel üretim', included: true, icon: <Clock className="h-4 w-4" /> },
        { text: 'Sınırlı bellek ve bağlam', included: true, icon: <Database className="h-4 w-4" /> },
        { text: 'Sınırlı derin araştırma', included: true, icon: <Search className="h-4 w-4" /> }
      ],
      footer: 'Mevcut bir planın mı var? Faturalama yardımına bak'
    },
    {
      name: 'Business',
      price: 25,
      period: 'USD / ay',
      description: 'Güvenli ve iş birliğine dayalı bir çalışma alanıyla işletmenin çalışmalarına güç kat',
      buttonText: 'Business abonesi ol',
      buttonVariant: 'default' as const,
      popular: true,
      badge: 'ÖNERİLEN',
      features: [
        { text: 'Pluslakı her şey ve daha fazlası: sınırsız GPT-5 mesajları, GPT-5 thinkinge kapsamlı erişim, GPT-5 pro erişimi ve etkinle beraber ölçeklenen isteğe bağlı krediler.', included: true, icon: <Sparkles className="h-4 w-4" /> },
        { text: 'Şirket bilgilerini bağla: Google Drive, SharePoint, Dropbox, GitHub, Outlook ve özel entegrasyonlar', included: true, icon: <Database className="h-4 w-4" /> },
        { text: 'İşletmeler için gerekli güvenlik: SAML SSO, MFA, SOC 2 Tip 2, alanını ve depolama sırasında şifreleme, eğitimden hariç tutulan veriler', included: true, icon: <Crown className="h-4 w-4" /> },
        { text: 'Kayıt modu: macOS masaüstünde toplantıları ve sesli notları kaydet, ardından herhangi bir sohbette metin deşifrelerini arayarak referans olarak kullan.', included: true, icon: <FileVideo className="h-4 w-4" /> },
        { text: 'Projeler, görevler, dosya yüklemeleri ve özel çalışma alanı GPT\'leri gibi iş özellikleri', included: true, icon: <Users className="h-4 w-4" /> },
        { text: 'Verileşik ajanlar - derin araştırma, ChatGPT ajanı ve Codex; belgelerini, araçlarını ve kod tabanlarin arasında mantık yürütme yaparak sana saatler kazandırabilir.', included: true, icon: <Code className="h-4 w-4" /> },
        { text: 'Çok modlu oluşturma - Sora ile videolar oluştur, görseller üret, canvas oluştur, gelişmiş veri analizi yap ve satır içi kod çalıştır', included: true, icon: <Zap className="h-4 w-4" /> }
      ],
      additionalInfo: '2+ kullanıcı için, yıllık olarak faturalanır\nŞubtamal banyetlerine sınırsız olarak tabidır. Daha fazla bilgi al'
    }
  ];

  const plans = activeTab === 'personal' ? personalPlans : businessPlans;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="absolute top-6 right-6 z-10 h-8 w-8 p-0 rounded-full hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-medium text-foreground mb-6">Planını yükselt</h1>
          
          {/* Toggle Buttons */}
          <div className="inline-flex items-center p-1 bg-muted rounded-lg mb-12">
            <Button 
              variant={activeTab === 'personal' ? 'default' : 'ghost'}
              size="sm" 
              className="px-6"
              onClick={() => setActiveTab('personal')}
            >
              Personal
            </Button>
            <Button 
              variant={activeTab === 'business' ? 'default' : 'ghost'}
              size="sm" 
              className="px-6"
              onClick={() => setActiveTab('business')}
            >
              Business
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={cn(
          "grid gap-8 max-w-6xl mx-auto",
          activeTab === 'business' ? "md:grid-cols-2" : "md:grid-cols-3"
        )}>
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                plan.popular && "border-primary shadow-lg scale-105"
              )}
            >
              {plan.popular && (
                <Badge 
                  className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1"
                >
                  {(plan as any).badge || 'POPÜLER'}
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">$</span>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button 
                  className={cn(
                    "w-full h-12 font-semibold",
                    plan.popular && "bg-primary hover:bg-primary/90"
                  )}
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>

                <div className="space-y-3 pt-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {feature.included ? (
                          <div className="text-primary">
                            {feature.icon}
                          </div>
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm leading-relaxed",
                        feature.included 
                          ? "text-foreground" 
                          : "text-muted-foreground line-through"
                      )}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              {(plan.footer || (plan as any).additionalInfo) && (
                <CardFooter className="pt-6">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {plan.footer || (plan as any).additionalInfo}
                  </p>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;