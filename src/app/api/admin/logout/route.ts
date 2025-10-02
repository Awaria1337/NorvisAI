import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, logAdminAction } from '@/lib/admin-auth';

/**
 * POST /api/admin/logout
 * Admin logout endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin is logged in
    const adminAuth = await verifyAdminAuth(request);
    
    // Log logout action if admin was authenticated
    if (adminAuth.isValid && adminAuth.admin) {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() 
                        || request.headers.get('x-real-ip') 
                        || 'unknown';
      
      await logAdminAction(
        adminAuth.admin.id,
        'logout',
        { method: 'manual' },
        ipAddress,
        request.headers.get('user-agent') || undefined
      );
    }

    // Clear cookie
    const response = NextResponse.json({
      success: true,
      message: 'Çıkış başarılı'
    });

    // Remove admin_token cookie
    response.cookies.delete('admin_token');

    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    
    // Even on error, clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'Çıkış yapıldı'
    });
    
    response.cookies.delete('admin_token');
    return response;
  }
}
