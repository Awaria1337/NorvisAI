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
    const { type, description, feedback, title, email, name, url } = body;

    // Accept either 'description' or 'feedback' field
    const reportDescription = description || feedback;

    // Validation
    if (!type || !reportDescription) {
      return NextResponse.json(
        { success: false, error: 'Type and description are required' },
        { status: 400 }
      );
    }

    if (reportDescription.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Feedback cannot exceed 2000 characters' },
        { status: 400 }
      );
    }

    // Map Turkish types to English
    const typeMap: Record<string, string> = {
      'Genel': 'other',
      'Geri bildirim': 'feedback',
      'Sorun': 'bug',
      'Hata bildir': 'bug',
      'Çocuk güvenliği endişesi': 'other'
    };

    const mappedType = typeMap[type] || 'other';
    const reportTitle = title || `${type} raporu`;

    // Get metadata
    const userAgent = request.headers.get('user-agent') || undefined;
    
    // Determine priority based on type
    const priority = type === 'Çocuk güvenliği endişesi' ? 'critical' : 'medium';

    // Save to database
    const report = await prisma.userReport.create({
      data: {
        userId: payload.userId,
        type: mappedType,
        title: reportTitle,
        description: reportDescription.trim(),
        email: email || undefined,
        name: name || undefined,
        url: url || undefined,
        userAgent,
        priority,
        status: 'open'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    console.log('📨 New Report Saved to Database:', {
      id: report.id,
      userId: report.userId,
      type: report.type,
      priority: report.priority,
      timestamp: report.createdAt
    });

    return NextResponse.json({
      success: true,
      message: 'Raporunuz başarıyla gönderildi. En kısa sürede değerlendirilerek size geri dönüş yapılacaktır.',
      data: {
        reportId: report.id,
        timestamp: report.createdAt
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