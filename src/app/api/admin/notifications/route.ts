import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/notifications
 * Get all notifications
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    const where: any = {};
    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({
      success: true,
      data: { notifications }
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirimler alınamadı' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, targetType, targetSegment, scheduledAt } = body;

    // Validation
    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Başlık ve mesaj gerekli' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || 'INFO',
        targetType: targetType || 'ALL_USERS',
        targetSegment,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: 'admin@norvis.ai' // TODO: Get from session
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Bildirim oluşturuldu',
      data: { notification }
    });

  } catch (error) {
    console.error('Notification create error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirim oluşturulamadı' },
      { status: 500 }
    );
  }
}
