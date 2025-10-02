import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/payment/checkout - Create checkout session (simplified version)
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
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId } = body;
    console.log('Checkout request - planId:', planId, 'userId:', payload.userId);

    if (!planId) {
      return NextResponse.json(
        { success: false, error: 'Plan ID required' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    if (!plan.active) {
      return NextResponse.json(
        { success: false, error: 'Plan is not available' },
        { status: 400 }
      );
    }

    // Create payment transaction record
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: payload.userId,
        planId: plan.id,
        planName: plan.displayName,
        amount: plan.price,
        currency: plan.currency,
        status: 'pending',
        provider: 'manual', // Will be replaced with actual payment provider
      },
    });

    // TODO: Integrate with actual payment provider (Stripe, PayPal, etc.)
    // For now, return a simulated checkout URL
    
    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        checkoutUrl: `/payment/process?transactionId=${transaction.id}`,
        plan: {
          id: plan.id,
          name: plan.displayName,
          price: plan.price,
          currency: plan.currency,
        },
      },
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
