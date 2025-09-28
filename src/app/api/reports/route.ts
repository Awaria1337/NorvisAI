import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/reports - Submit a new report
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
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
    const { type, feedback } = body;

    // Validation
    if (!type || !feedback) {
      return NextResponse.json(
        { success: false, error: 'Type and feedback are required' },
        { status: 400 }
      );
    }

    if (feedback.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Feedback cannot exceed 1000 characters' },
        { status: 400 }
      );
    }

    const validTypes = [
      'Genel',
      'Geri bildirim', 
      'Sorun',
      'Hata bildir',
      'Çocuk güvenliği endişesi'
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report type' },
        { status: 400 }
      );
    }

    // For now, we'll just log the report
    // In production, you might want to store this in a database or send to a support system
    const reportData = {
      id: `report_${Date.now()}`,
      userId: payload.userId,
      type,
      feedback: feedback.trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown'
    };

    console.log('📨 New Report Received:', {
      id: reportData.id,
      userId: reportData.userId,
      type: reportData.type,
      feedbackLength: reportData.feedback.length,
      timestamp: reportData.timestamp
    });

    // TODO: In production, you might want to:
    // 1. Store in database
    // 2. Send email notification to support team
    // 3. Create ticket in support system
    // 4. Integrate with services like Zendesk, Intercom, etc.

    // Example database storage (if you want to add a reports table):
    /*
    await prisma.report.create({
      data: {
        userId: payload.userId,
        type,
        content: feedback.trim(),
        status: 'open',
        priority: type === 'Çocuk güvenliği endişesi' ? 'high' : 'normal'
      }
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Raporunuz başarıyla gönderildi. En kısa sürede değerlendirilerek size geri dönüş yapılacaktır.',
      data: {
        reportId: reportData.id,
        timestamp: reportData.timestamp
      }
    });

  } catch (error) {
    console.error('Submit report error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/reports - Get user's reports (optional)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
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

    // For now, return empty array
    // In production, you would fetch from database
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Report history feature coming soon'
    });

  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}