import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to maintenance page, admin panel, API routes, and static assets
  if (
    pathname === '/maintenance' ||
    pathname.startsWith('/admin') || // Admin panel always accessible
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|css|js)$/)
  ) {
    return NextResponse.next();
  }

  try {
    // Check maintenance mode from API
    const response = await fetch(
      new URL('/api/settings/public', request.url),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      // If maintenance mode is active, redirect to maintenance page
      if (data.data?.maintenanceMode === true) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
    }
  } catch (error) {
    // If settings check fails, allow access to prevent site lockout
    console.error('Middleware settings check error:', error);
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
