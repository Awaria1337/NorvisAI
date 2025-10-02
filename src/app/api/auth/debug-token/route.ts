import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// GET /api/auth/debug-token - Debug endpoint to check token validity
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No token provided',
        details: {
          hasAuthHeader: !!authHeader,
          authHeaderValue: authHeader ? `${authHeader.substring(0, 20)}...` : null,
        },
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    return NextResponse.json({
      success: true,
      data: {
        tokenValid: !!payload,
        payload: payload,
        hasUserId: payload ? !!payload.userId : false,
        hasEmail: payload ? !!payload.email : false,
      },
    });
  } catch (error) {
    console.error('Token debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
