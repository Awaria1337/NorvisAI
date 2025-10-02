import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/prompts
 * Get all prompt logs with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const model = searchParams.get('model') || 'all';
    const status = searchParams.get('status') || 'all';

    // Build where clause
    const where: any = {
      role: 'user' // Only get user prompts, not assistant responses
    };

    // Search in content
    if (search) {
      where.content = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Filter by model
    if (model !== 'all') {
      where.model = {
        contains: model,
        mode: 'insensitive'
      };
    }

    // Get messages with user and chat info
    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        content: true,
        model: true,
        tokensUsed: true,
        createdAt: true,
        chat: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Get total count
    const totalCount = await prisma.message.count({ where });

    // Format messages for display
    const prompts = messages.map(msg => ({
      id: msg.id,
      userId: msg.chat.user.id,
      userName: msg.chat.user.name,
      userEmail: msg.chat.user.email,
      model: msg.model || 'Unknown',
      prompt: msg.content,
      timestamp: msg.createdAt.toISOString(),
      tokens: msg.tokensUsed || 0,
      status: 'success', // We can add error tracking later
      responseTime: '1.2s' // Mock - can be calculated if we add latency tracking
    }));

    return NextResponse.json({
      success: true,
      data: {
        prompts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Prompts list error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch prompts' 
      },
      { status: 500 }
    );
  }
}
