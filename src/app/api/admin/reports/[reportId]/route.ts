import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth';

/**
 * GET /api/admin/reports/[reportId]
 * Get single report details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth.isValid || !adminAuth.admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reportId } = await params;

    const report = await prisma.userReport.findUnique({
      where: { id: reportId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Admin report GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reports/[reportId]
 * Update report status, priority, or add admin notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth.isValid || !adminAuth.admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reportId } = await params;
    const body = await request.json();
    const { status, priority, adminNote } = body;

    // Build update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    // If status is resolved, set resolvedBy and resolvedAt
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedBy = adminAuth.admin.email;
      updateData.resolvedAt = new Date();
    }

    const report = await prisma.userReport.update({
      where: { id: reportId },
      data: updateData,
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

    console.log('✅ Report updated:', {
      id: report.id,
      status: report.status,
      priority: report.priority,
      updatedBy: adminAuth.admin.email
    });

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report updated successfully'
    });

  } catch (error) {
    console.error('Admin report PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reports/[reportId]
 * Delete a report
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth.isValid || !adminAuth.admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reportId } = await params;

    await prisma.userReport.delete({
      where: { id: reportId }
    });

    console.log('🗑️ Report deleted:', {
      id: reportId,
      deletedBy: adminAuth.admin.email
    });

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Admin report DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
