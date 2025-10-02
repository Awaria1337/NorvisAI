import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/notifications
 * Get user notifications (only SENT notifications)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/token
    // For now, we'll get all SENT notifications for ALL_USERS or matching segment

    const notifications = await prisma.notification.findMany({
      where: {
        status: 'SENT',
        OR: [
          { targetType: 'ALL_USERS' },
          // TODO: Add user-specific filtering based on plan
        ]
      },
      orderBy: { sentAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        sentAt: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount: notifications.length // TODO: Track read status per user
      }
    });

  } catch (error) {
    console.error('User notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirimler alınamadı' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/mark-read
 * Mark notification as read (for future implementation)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    // TODO: Mark notification as read for this user
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi'
    });

  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { success: false, error: 'İşlem başarısız' },
      { status: 500 }
    );
  }
}
