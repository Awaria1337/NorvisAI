import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/debug/message-count - Check current message count
export async function GET(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        subscriptionType: true,
        messageLimit: true,
        dailyMessageCount: true,
        lastMessageResetDate: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const remaining = user.messageLimit - user.dailyMessageCount;

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        subscriptionType: user.subscriptionType,
        messageLimit: user.messageLimit,
        dailyMessageCount: user.dailyMessageCount,
        remaining: remaining,
        lastMessageResetDate: user.lastMessageResetDate,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
      },
    });

  } catch (error) {
    console.error('Debug message count error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
