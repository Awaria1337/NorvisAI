'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [email, setEmail] = useState('zilelimert38@gmail.com');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchPlanDetails();
    }
    
    const testToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/debug-token', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const result = await response.json();
          console.log('Token debug result:', result);
        } catch (error) {
          console.error('Token debug error:', error);
        }
      }
    };
    testToken();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      const response = await fetch('/api/plans');
      const result = await response.json();
      
      if (result.success) {
        const selectedPlan = result.data.find((p: any) => p.id === planId);
        setPlan(selectedPlan);
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
      toast.error('Plan bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Giriş yapmanız gerekiyor');
      router.push('/auth/login');
      return;
    }

    if (!cardNumber || cardNumber.length < 16) {
      toast.error('Geçerli bir kart numarası girin');
      return;
    }
    if (!expiryDate || expiryDate.length < 5) {
      toast.error('Son kullanma tarihini girin (AA / YY)');
      return;
    }
    if (!cvc || cvc.length < 3) {
      toast.error('CVC kodunu girin');
      return;
    }
    if (!name || name.trim().length < 3) {
      toast.error('Ad ve soyadınızı girin');
      return;
    }
    if (!address || address.trim().length < 5) {
      toast.error('Adresinizi girin');
      return;
    }
    if (!checkbox1 || !checkbox2) {
      toast.error('Lütfen tüm onay kutularını işaretleyin');
      return;
    }

    setProcessing(true);
    
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (!token) {
        toast.error('Giriş yapmanız gerekiyor');
        router.push('/auth/login');
        return;
      }

      // 1. Create checkout session
      console.log('Creating checkout session for planId:', planId);
      const checkoutResponse = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const checkoutResult = await checkoutResponse.json();
      console.log('Checkout response:', checkoutResult);

      if (!checkoutResult.success) {
        toast.error(checkoutResult.error || 'Ödeme başlatılamadı');
        setProcessing(false);
        return;
      }

      // 2. Simulate payment completion (for demo)
      toast.loading('Ödeme işleniyor...', { duration: 2000 });
      
      setTimeout(async () => {
        try {
          console.log('Completing payment with transactionId:', checkoutResult.data?.transactionId);
          const completeResponse = await fetch('/api/payment/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              transactionId: checkoutResult.data.transactionId 
            }),
          });

          console.log('Complete response status:', completeResponse.status);
          
          if (!completeResponse.ok) {
            const errorText = await completeResponse.text();
            console.error('Payment completion HTTP error:', completeResponse.status, errorText);
            toast.error('Ödeme tamamlanamadı. Lütfen tekrar deneyin.');
            setProcessing(false);
            return;
          }

          const completeResult = await completeResponse.json();
          console.log('Payment complete result:', completeResult);

          if (completeResult && completeResult.success) {
            toast.success('🎉 Tebrikler! Premium üyeliğiniz aktif edildi!');
            
            // Refresh user data in auth store
            if (typeof window !== 'undefined') {
              window.location.href = '/chat';
            }
          } else {
            console.error('Payment completion failed:', completeResult);
            toast.error(completeResult?.error || 'Ödeme tamamlanamadı');
            setProcessing(false);
          }
        } catch (error) {
          console.error('Payment completion exception:', error);
          toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
          setProcessing(false);
        }
      }, 2000);

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Bir hata oluştu');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Plan bulunamadı</h2>
          <Button onClick={() => router.push('/pricing')}>
            Planları Görüntüle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center">
          <ArrowLeft 
            className="h-5 w-5 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mr-4" 
            onClick={() => router.push('/pricing')}
          />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">OpenAI</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left Side - Summary */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                ChatGPT Plus Subscription abonesi ol
              </h2>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                ${plan.price},00 <span className="text-base font-normal text-gray-600 dark:text-gray-400">aylık.</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">ChatGPT Plus Subscription</span>
                <span className="text-gray-900 dark:text-gray-100">${plan.price},00</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Aylık olarak faturalanır</p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Ara Toplam</span>
                <span className="text-gray-900 dark:text-gray-100">${plan.price},00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">VAT (20%)</span>
                <span className="text-gray-900 dark:text-gray-100">${(plan.price * 0.2).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Bugün ödenmesi gereken toplam tutar</span>
                <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">${(plan.price * 1.2).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">İletişim bilgileri</h3>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">E-posta</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Ödeme yöntemi</h3>
              
              <div className="flex gap-2 mb-4">
                <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-blue-600 dark:border-blue-500 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Kart</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Kart numarası</label>
                  <div className="relative">
                    <Input 
                      placeholder="1234 1234 1234 1234"
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '');
                        if (value.length <= 16 && /^\d*$/.test(value)) {
                          setCardNumber(value);
                        }
                      }}
                      className="w-full h-11 pr-32 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                      <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="MC" className="h-5 opacity-70" />
                      <img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg" alt="Visa" className="h-5 opacity-70" />
                      <img src="https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg" alt="Disc" className="h-5 opacity-70" />
                      <img src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg" alt="Amex" className="h-5 opacity-70" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Son Kullanma Tarihi</label>
                    <Input 
                      placeholder="AA / YY"
                      value={expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + ' / ' + value.slice(2, 4);
                        }
                        if (value.length <= 7) {
                          setExpiryDate(value);
                        }
                      }}
                      className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Güvenlik kodu</label>
                    <Input 
                      placeholder="CVC"
                      value={cvc}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setCvc(value);
                        }
                      }}
                      className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Billing address</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Ad ve soyadı</label>
                  <Input 
                    placeholder="Ad Soyad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Ülke veya bölge</label>
                  <select className="w-full h-11 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <option>Türkiye</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Adres</label>
                  <Input 
                    placeholder="Adres"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 cursor-pointer" 
                  checked={checkbox1}
                  onChange={(e) => setCheckbox1(e.target.checked)}
                />
                <label className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer" onClick={() => setCheckbox1(!checkbox1)}>
                  İşleme olarak satın alıyorum
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 cursor-pointer" 
                  checked={checkbox2}
                  onChange={(e) => setCheckbox2(e.target.checked)}
                />
                <label className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer" onClick={() => setCheckbox2(!checkbox2)}>
                  İptal ödeme kadar yüksek belirlenen tutar ve sıklıkta seneden ödeme alınacaktır. <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline" onClick={(e) => e.stopPropagation()}>Kullanım şartlarınızda</a> belirtildiği gibi
                </label>
              </div>
            </div>

            {/* Subscribe Button */}
            <Button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full h-12 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold rounded-md shadow-sm"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'Abone ol'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
