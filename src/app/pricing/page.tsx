'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X,
  Circle,
  Sparkles,
  Brain,
  Zap,
  Database,
  Mic,
  Image,
  Users,
  CheckCircle2,
  Crown,
  Infinity,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  messageLimit: number;
  features: string[];
  featured: boolean;
}

const PricingPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'personal' | 'business'>('personal');
  const [dbPlans, setDbPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
    fetchSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const result = await response.json();
      if (result.success) {
        setDbPlans(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setSubscription(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handleClose = () => {
    router.push(ROUTES.CHAT);
  };

  const handleUpgrade = (planName: string) => {
    console.log('handleUpgrade called with:', planName);
    console.log('dbPlans:', dbPlans);
    const plan = dbPlans.find(p => p.name === planName);
    console.log('Found plan:', plan);
    
    // Check if user already has this plan
    if (subscription && subscription.subscriptionType === planName) {
      toast.error('Bu plana zaten sahipsiniz');
      return;
    }
    
    if (plan) {
      console.log('Redirecting to:', `/checkout?planId=${plan.id}`);
      router.push(`/checkout?planId=${plan.id}`);
    } else {
      toast.error('Plan bulunamadı');
    }
  };
  
  const isCurrentPlan = (planName: string) => {
    if (!subscription) return planName === 'FREE';
    return subscription.subscriptionType === planName;
  };
  const personalPlans = [
    {
      name: 'Temel',
      planId: 'FREE',
      price: 0,
      popular: false,
      currentPlan: 'Mevcut Plan',
      features: [
        { text: 'Norvis 3\'e sınırlı erişim', icon: Circle },
        { text: 'Sınırlı bağlam belleği', icon: Database },
        { text: 'Aurora görsel modeli', icon: Image },
        { text: 'Sesli erişim', icon: Mic },
        { text: 'Projeler', icon: Users },
        { text: 'Görevler', icon: CheckCircle2 }
      ]
    },
    {
      name: 'SuperNorvis',
      planId: 'PREMIUM',
      price: 30,
      period: '/ay',
      popular: true,
      buttonText: 'SuperNorvis\'a Yükseltin',
      features: [
        { text: 'Norvis 4\'e artırılmış erişim', icon: Sparkles },
        { text: 'Think ve DeepSearch\'ün yeni alır', icon: Brain },
        { text: 'Norvis 3\'e artırılmış erişim', icon: Zap },
        { text: 'Genişletilmiş hafıza 128,000 adet Token', icon: Database },
        { text: 'Öncelikli ses erişimi', icon: Mic },
        { text: 'Imagine görsel modeli', icon: Image },
        { text: 'Arkadaşlar Ani ve Valentine', icon: Users },
        { text: 'Temeldeki her şey', icon: CheckCircle2 }
      ]
    },
    {
      name: 'SuperNorvis Heavy',
      planId: 'PRO',
      price: 300,
      period: '/ay',
      popular: false,
      buttonText: 'Heavy\'ye Yükseltin',
      features: [
        { text: 'Norvis 4 Heavy için özel önizleme', icon: Crown },
        { text: 'Norvis 4\'e genişletilmiş erişim', icon: Sparkles },
        { text: 'Norvis 3\'e sınırsız erişim', icon: Infinity },
        { text: 'En uzun hafıza 256,000 adet Token', icon: Database },
        { text: 'Yeni özelliklere erken erişim', icon: Clock },
        { text: 'SuperNorvis\'taki her şey', icon: CheckCircle2 }
      ]
    }
  ];

  const plans = personalPlans;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 100%)'
    }}>
      {/* Starry Background Effect */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                         radial-gradient(2px 2px at 60% 70%, white, transparent),
                         radial-gradient(1px 1px at 50% 50%, white, transparent),
                         radial-gradient(1px 1px at 80% 10%, white, transparent),
                         radial-gradient(2px 2px at 90% 60%, white, transparent),
                         radial-gradient(1px 1px at 33% 90%, white, transparent),
                         radial-gradient(1px 1px at 15% 70%, white, transparent)`,
        backgroundSize: '200% 200%',
        backgroundPosition: '0% 0%'
      }} />
      
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="absolute top-6 right-6 z-10 h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">SuperNorvis</h1>
          <p className="text-xl text-gray-400 mb-2">Norvis 4 Tanıtılıyor</p>
          <p className="text-lg text-yellow-500">En güçlü yapay zeka modeli</p>
          
          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="text-sm text-gray-400">Yıllık öde %18 tasarruf et</span>
            <Button 
              variant="outline"
              size="sm"
              className="bg-transparent border-gray-600 text-white hover:bg-white/10"
            >
              Aylık öde
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={cn(
                "relative rounded-3xl p-6 transition-all duration-300",
                plan.popular 
                  ? "bg-[#1a1a1a] text-white border-2 border-white" 
                  : "bg-[#1a1a1a] text-white"
              )}
            >
              {/* Plan Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <Badge className="bg-gray-700 text-white px-3 py-1 text-xs font-semibold rounded-md">
                      Populer
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className={cn(
                  "w-full h-12 font-semibold rounded-full mb-6",
                  "bg-white text-black hover:bg-gray-100",
                  isCurrentPlan(plan.planId) && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => {
                  if (!isCurrentPlan(plan.planId) && plan.planId !== 'FREE') {
                    handleUpgrade(plan.planId);
                  }
                }}
                disabled={isCurrentPlan(plan.planId) || plan.planId === 'FREE'}
              >
                {isCurrentPlan(plan.planId) ? (
                  plan.currentPlan || 'Mevcut Plan'
                ) : (
                  plan.buttonText || `${plan.name}\'a Yükseltin`
                )}
              </Button>

              {/* Features List */}
              <div className="space-y-3">
                {plan.features.map((feature, idx) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <IconComponent 
                        className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" 
                      />
                      <span className="text-sm leading-relaxed text-gray-300">
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-400">
            Tüm Planlarını Görüntüle
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
