import { prisma } from './prisma';

export interface MessageLimitStatus {
  canSendMessage: boolean;
  remaining: number;
  limit: number;
  resetsAt: Date;
  isPremium: boolean;
  subscriptionType: 'FREE' | 'PREMIUM' | 'PRO';
}

/**
 * Check if user can send a message and get remaining count
 */
export async function checkMessageLimit(userId: string): Promise<MessageLimitStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionType: true,
      subscriptionEndDate: true,
      subscriptionStartDate: true,
      dailyMessageCount: true,
      lastMessageResetDate: true,
      messageLimit: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  
  // Check if subscription expired
  const isSubscriptionActive = user.subscriptionEndDate && user.subscriptionEndDate > now;
  const isPremium = (user.subscriptionType === 'PREMIUM' || user.subscriptionType === 'PRO') && isSubscriptionActive;

  // Set message limits based on subscription type
  let currentLimit = 25; // Free plan default
  if (isSubscriptionActive) {
    if (user.subscriptionType === 'PREMIUM') {
      currentLimit = 300;
    } else if (user.subscriptionType === 'PRO') {
      currentLimit = 700;
    }
  }

  // Check if we need to reset monthly count (check if we're in a new subscription month)
  const lastReset = new Date(user.lastMessageResetDate);
  const subscriptionStart = user.subscriptionStartDate ? new Date(user.subscriptionStartDate) : lastReset;
  
  // Calculate if a month has passed since last reset
  let shouldReset = false;
  if (isSubscriptionActive && user.subscriptionStartDate) {
    // Check if we've passed the monthly reset date
    const dayOfMonth = subscriptionStart.getDate();
    const resetDay = now.getDate() === dayOfMonth && 
                     (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear());
    const monthPassed = now > lastReset && 
                       ((now.getMonth() - lastReset.getMonth() + (now.getFullYear() - lastReset.getFullYear()) * 12) >= 1);
    shouldReset = resetDay || monthPassed;
  } else {
    // For free users, reset monthly on the 1st
    shouldReset = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
  }

  let monthlyCount = user.dailyMessageCount;
  
  if (shouldReset) {
    // Reset monthly count
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyMessageCount: 0,
        lastMessageResetDate: now,
        messageLimit: currentLimit,
      },
    });
    monthlyCount = 0;
  } else if (user.messageLimit !== currentLimit) {
    // Update limit if subscription changed
    await prisma.user.update({
      where: { id: userId },
      data: { messageLimit: currentLimit },
    });
  }

  const remaining = Math.max(0, currentLimit - monthlyCount);
  const canSendMessage = remaining > 0;

  // Calculate next reset time (start of next subscription month)
  let resetsAt = new Date(now);
  if (isSubscriptionActive && user.subscriptionStartDate) {
    const startDay = subscriptionStart.getDate();
    resetsAt.setMonth(resetsAt.getMonth() + 1);
    resetsAt.setDate(startDay);
    resetsAt.setHours(0, 0, 0, 0);
  } else {
    // For free users, reset on 1st of next month
    resetsAt.setMonth(resetsAt.getMonth() + 1);
    resetsAt.setDate(1);
    resetsAt.setHours(0, 0, 0, 0);
  }

  return {
    canSendMessage,
    remaining,
    limit: currentLimit,
    resetsAt,
    isPremium,
    subscriptionType: user.subscriptionType || 'FREE',
  };
}

/**
 * Increment user's daily message count
 */
export async function incrementMessageCount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyMessageCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Upgrade user to premium or pro
 */
export async function upgradeToPremium(
  userId: string, 
  durationDays: number = 30,
  planType: 'PREMIUM' | 'PRO' = 'PREMIUM'
): Promise<void> {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + durationDays);

  const messageLimit = planType === 'PRO' ? 700 : 300;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionType: planType,
      subscriptionStartDate: now,
      subscriptionEndDate: endDate,
      messageLimit: messageLimit,
      dailyMessageCount: 0, // Reset count on upgrade
      lastMessageResetDate: now,
    },
  });
}

/**
 * Check and expire subscriptions
 */
export async function checkExpiredSubscriptions(): Promise<number> {
  const now = new Date();
  
  const result = await prisma.user.updateMany({
    where: {
      subscriptionType: {
        in: ['PREMIUM', 'PRO'],
      },
      subscriptionEndDate: {
        lte: now,
      },
    },
    data: {
      subscriptionType: 'FREE',
      messageLimit: 25,
    },
  });

  return result.count;
}

/**
 * Get user's subscription info
 */
export async function getSubscriptionInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionType: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      messageLimit: true,
      dailyMessageCount: true,
      lastMessageResetDate: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const limitStatus = await checkMessageLimit(userId);

  return {
    ...user,
    ...limitStatus,
  };
}
