import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/admin/notifications/[id]
 * Send a notification (mark as sent)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'send') {
      // Mark notification as sent
      const notification = await prisma.notification.update({
        where: { id: params.id },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Bildirim gönderildi',
        data: { notification }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Geçersiz işlem' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirim güncellenemedi' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/notifications/[id]
 * Delete a notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.notification.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Bildirim silindi'
    });

  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirim silinemedi' },
      { status: 500 }
    );
  }
}
