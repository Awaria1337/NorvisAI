import { NextRequest, NextResponse } from 'next/server';
import { FeatureFlagsService } from '@/lib/services/feature-flags.service';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth.isValid || !adminAuth.admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await FeatureFlagsService.updateFeature(params.id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Feature PUT error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth.isValid || !adminAuth.admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await FeatureFlagsService.deleteFeature(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Feature DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
