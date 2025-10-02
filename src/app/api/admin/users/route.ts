import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/users
 * Get users list with filters, search, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || 'all';
    const status = searchParams.get('status') || 'all';

    // Build where clause
    const where: any = {};

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get users with chat count
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            chats: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

    // Calculate last active and message count
    const usersWithDetails = await Promise.all(users.map(async (user, index) => {
      // Get message count for this user
      const messageCount = await prisma.message.count({
        where: {
          chat: {
            userId: user.id
          }
        }
      });

      // Mock plan based on chat count
      const plans = ['FREE', 'PREMIUM', 'ENTERPRISE'];
      const chatCount = user._count.chats;
      let mockPlan = 'FREE';
      if (chatCount > 10) mockPlan = 'ENTERPRISE';
      else if (chatCount > 3) mockPlan = 'PREMIUM';

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: mockPlan as 'FREE' | 'PREMIUM' | 'ENTERPRISE',
        status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED' | 'INACTIVE',
        totalPrompts: messageCount,
        lastActive: new Date(user.updatedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        createdAt: user.createdAt.toISOString()
      };
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithDetails,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Users list error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users list' 
      },
      { status: 500 }
    );
  }
}
