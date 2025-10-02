import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/admin-auth';
import { applyRateLimit } from '@/middleware/rateLimit';

/**
 * POST /api/admin/login
 * Admin authentication endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Apply stricter rate limiting for admin login
    const rateLimitResponse = await applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { identifier, password } = body;

    console.log('🔐 Admin login attempt:', {
      identifier,
      passwordLength: password?.length,
      timestamp: new Date().toISOString()
    });

    // Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Kullanıcı adı/Email ve şifre gereklidir' 
        },
        { status: 400 }
      );
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0].trim() || realIp || 'unknown';

    // Authenticate
    const result = await authenticateAdmin(identifier, password, ipAddress);

    console.log('🔐 Auth result:', {
      success: result.success,
      error: result.error,
      hasAdmin: !!result.admin
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Geçersiz kullanıcı adı veya şifre'
        },
        { status: 401 }
      );
    }

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      data: {
        admin: result.admin,
        token: result.token
      },
      message: 'Giriş başarılı'
    });

    // Set HTTP-only cookie for authentication
    response.cookies.set('admin_token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
