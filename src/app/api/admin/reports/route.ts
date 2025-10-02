import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth';

/**
 * GET /api/admin/reports
 * Get all user reports for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth.isValid || !adminAuth.admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    // Fetch reports
    const [reports, total] = await Promise.all([
      prisma.userReport.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' }, // Critical first
          { createdAt: 'desc' } // Newest first
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.userReport.count({ where })
    ]);

    // Get stats
    const stats = await prisma.userReport.groupBy({
      by: ['status'],
      _count: true
    });

    const statusCounts = stats.reduce((acc: any, stat: any) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          total,
          open: statusCounts.open || 0,
          in_progress: statusCounts.in_progress || 0,
          resolved: statusCounts.resolved || 0,
          closed: statusCounts.closed || 0
        }
      }
    });

  } catch (error) {
    console.error('Admin reports GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
