import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SettingsService } from '@/lib/services/settings.service';

// Paths that should bypass maintenance mode
const BYPASS_PATHS = [
  '/api/settings/public',
  '/api/admin',
  '/admin/login',
  '/admin/settings',
  '/_next',
  '/favicon.ico',
  '/logo.png',
  '/maintenance'
];

/**
 * Maintenance Mode Middleware
 * Redirects users to maintenance page when maintenance mode is active
 * Admins can still access the admin panel
 */
export async function maintenanceMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path should bypass maintenance check
  const shouldBypass = BYPASS_PATHS.some(path => pathname.startsWith(path));
  if (shouldBypass) {
    return NextResponse.next();
  }

  // Check if maintenance mode is active
  const isMaintenanceMode = await SettingsService.isMaintenanceMode();

  if (isMaintenanceMode && pathname !== '/maintenance') {
    // Redirect to maintenance page
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // If not in maintenance mode but accessing maintenance page, redirect to home
  if (!isMaintenanceMode && pathname === '/maintenance') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
