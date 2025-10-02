import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get current date ranges
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total users
    const totalUsers = await prisma.user.count();

    // New users in last 24h
    const newUsersLast24h = await prisma.user.count({
      where: {
        createdAt: { gte: last24Hours }
      }
    });

    // Calculate user growth percentage
    const totalUsersLast24h = await prisma.user.count({
      where: {
        createdAt: { lt: last24Hours }
      }
    });
    const userGrowth = totalUsersLast24h > 0 
      ? ((newUsersLast24h / totalUsersLast24h) * 100).toFixed(1)
      : 0;

    // Active sessions (users who created a chat in last hour)
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const activeSessions = await prisma.chat.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: lastHour }
      }
    });

    // Total messages
    const totalMessages = await prisma.message.count();

    // Messages in last 24h
    const messagesLast24h = await prisma.message.count({
      where: {
        createdAt: { gte: last24Hours }
      }
    });

    // Calculate message growth
    const messagesBeforeLast24h = totalMessages - messagesLast24h;
    const messageGrowth = messagesBeforeLast24h > 0
      ? ((messagesLast24h / messagesBeforeLast24h) * 100).toFixed(1)
      : 0;

    // Get monthly data for charts (last 12 months)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const userCount = await prisma.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      const messageCount = await prisma.message.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      monthlyData.push({
        month: monthStart.toLocaleDateString('tr-TR', { month: 'short' }),
        users: userCount,
        revenue: messageCount * 0.01, // Mock revenue calculation
      });
    }

    // Top active users (last 30 days)
    const topUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        chats: {
          _count: 'desc'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            chats: true
          }
        }
      },
      where: {
        chats: {
          some: {
            createdAt: {
              gte: last30Days
            }
          }
        }
      }
    });

    const recentActivity = topUsers.map(user => ({
      name: user.name,
      email: user.email,
      amount: `+$${(user._count.chats * 0.99).toFixed(2)}` // Mock revenue per user
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          userGrowth: parseFloat(userGrowth as string),
          activeSessions: activeSessions.length,
          sessionGrowth: 12.5, // Mock data, calculate based on previous period
          totalMessages,
          messageGrowth: parseFloat(messageGrowth as string),
          serverUptime: '99.9%' // Mock data, integrate with actual monitoring
        },
        monthlyData,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics' 
      },
      { status: 500 }
    );
  }
}
