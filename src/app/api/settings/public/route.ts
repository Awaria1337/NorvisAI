import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settings.service';

/**
 * GET /api/settings/public
 * Get public system settings (no auth required)
 * Safe for client-side consumption
 */
export async function GET(request: NextRequest) {
  try {
    const result = await SettingsService.getPublicSettings();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Public settings GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
