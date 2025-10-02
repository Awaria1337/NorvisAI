'use client';

import React, { useEffect, useState } from 'react';
import { Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionInfo {
  subscriptionType: 'FREE' | 'PREMIUM';
  isPremium: boolean;
  remaining: number;
  limit: number;
  subscriptionEndDate?: Date;
}

export function SubscriptionBadge() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription) {
    return null;
  }

  const isPremium = subscription.isPremium;
  const planName = isPremium ? 'Premium' : 'Free';
  const percentage = (subscription.remaining / subscription.limit) * 100;

  return (
    <div className="px-3 py-2 space-y-2">
      {/* Plan Badge */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        isPremium 
          ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
          : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      )}>
        {isPremium ? (
          <Crown className="h-4 w-4 text-yellow-500" />
        ) : (
          <Zap className="h-4 w-4 text-gray-500" />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-sm font-semibold",
              isPremium ? "text-yellow-600 dark:text-yellow-500" : "text-gray-700 dark:text-gray-300"
            )}>
              {planName}
            </span>
            {isPremium && subscription.subscriptionEndDate && (
              <span className="text-xs text-gray-500">
                {new Date(subscription.subscriptionEndDate).toLocaleDateString('tr-TR', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Message Limit Progress */}
      <div className="px-2 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Günlük mesaj</span>
          <span className={cn(
            "font-medium",
            percentage < 20 ? "text-red-500" : "text-gray-700 dark:text-gray-300"
          )}>
            {subscription.remaining} / {subscription.limit}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              percentage > 50 
                ? "bg-green-500" 
                : percentage > 20 
                ? "bg-yellow-500" 
                : "bg-red-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {!isPremium && (
        <a 
          href="/pricing" 
          className="block w-full px-3 py-2 text-center text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all"
        >
          Premium'a Yükselt
        </a>
      )}
    </div>
  );
}
