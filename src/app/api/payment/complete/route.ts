import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { upgradeToPremium } from '@/lib/messageLimit';

// POST /api/payment/complete - Complete payment and upgrade user (Simulated for testing)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    console.log('Payment complete - Token payload:', payload ? { userId: payload.userId, email: payload.email } : 'null');
    
    if (!payload) {
      console.error('Payment complete - Invalid token');
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    if (!payload.userId) {
      console.error('Payment complete - Token payload missing userId:', payload);
      return NextResponse.json(
        { success: false, error: 'Invalid token structure' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID required' },
        { status: 400 }
      );
    }

    // Get transaction details
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (transaction.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Transaction already completed' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: transaction.planId || '' },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Update transaction status
    await prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'completed',
        paidAt: new Date(),
      },
    });

    // Determine plan type based on plan name
    const planType = plan.name.toLowerCase().includes('pro') ? 'PRO' : 'PREMIUM';
    
    // Upgrade user to premium/pro
    await upgradeToPremium(payload.userId, 30, planType); // 30 days

    // Create subscription record
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    await prisma.subscription.create({
      data: {
        userId: payload.userId,
        planId: plan.id,
        amount: transaction.amount,
        currency: transaction.currency,
        startDate: now,
        endDate: endDate,
        status: 'active',
        paymentMethod: transaction.provider,
        paymentId: transactionId,
      },
    });

    const messageLimit = planType === 'PRO' ? 700 : 300;
    
    console.log(`✅ User ${payload.userId} upgraded to ${plan.displayName} (${planType})`);

    return NextResponse.json({
      success: true,
      message: `${plan.displayName} üyeliğiniz başarıyla aktif edildi!`,
      data: {
        subscriptionType: planType,
        endDate: endDate,
        messageLimit: messageLimit,
      },
    });

  } catch (error) {
    console.error('Payment complete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
