import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/ai-stats
 * Get AI usage statistics and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '7d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    // Total prompts (messages)
    const totalPrompts = await prisma.message.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Calculate average response time (mock for now - you can add responseTime field to Message model)
    const avgResponseTime = 1.4; // Mock

    // Token usage (mock - add tokenCount field to Message model for real data)
    const messages = await prisma.message.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        tokensUsed: true
      }
    });
    const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokensUsed || 0), 0);

    // Error rate (mock - add status field to track errors)
    const errorRate = 0.8; // Mock

    // Prompts by model over time
    const promptsByDay = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        model,
        COUNT(*) as count
      FROM messages
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt"), model
      ORDER BY date ASC
    ` as any[];

    // Aggregate by day for chart
    const dailyData: any = {};
    promptsByDay.forEach((row: any) => {
      const dateKey = new Date(row.date).toLocaleDateString('tr-TR', { day: '2-digit' });
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, gpt4: 0, claude: 0, gemini: 0 };
      }
      
      const model = (row.model || '').toLowerCase();
      if (model.includes('gpt-4') || model.includes('gpt4')) {
        dailyData[dateKey].gpt4 += Number(row.count);
      } else if (model.includes('claude')) {
        dailyData[dateKey].claude += Number(row.count);
      } else if (model.includes('gemini')) {
        dailyData[dateKey].gemini += Number(row.count);
      }
    });

    const promptData = Object.values(dailyData);

    // Token consumption over time (mock data based on message count)
    const messagesByDay = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM messages
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    ` as any[];

    const tokenData = messagesByDay.map((row: any) => ({
      date: new Date(row.date).toLocaleDateString('tr-TR', { day: '2-digit' }),
      tokens: Number(row.count) * 500 // Mock: estimate 500 tokens per message
    }));

    // Latency data (mock - add latency tracking for real data)
    const latencyData = [
      { time: '00:00', avg: 1.2, p95: 2.3 },
      { time: '04:00', avg: 0.9, p95: 1.8 },
      { time: '08:00', avg: 1.5, p95: 2.9 },
      { time: '12:00', avg: 1.8, p95: 3.2 },
      { time: '16:00', avg: 1.6, p95: 2.8 },
      { time: '20:00', avg: 1.3, p95: 2.4 },
    ];

    // Model performance comparison
    const modelStats = await prisma.message.groupBy({
      by: ['model'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        model: true
      }
    });

    const modelPerformance = modelStats.map((stat, index) => ({
      model: stat.model || 'Unknown',
      calls: stat._count.model,
      avgLatency: `${(1.0 + Math.random() * 0.8).toFixed(1)}s`, // Mock
      successRate: (98 + Math.random() * 2).toFixed(1), // Mock
      cost: `$${(stat._count.model * 0.01).toFixed(2)}` // Mock
    }));

    // Calculate growth percentages
    const prevPeriodPrompts = await prisma.message.count({
      where: {
        createdAt: {
          gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
          lt: startDate
        }
      }
    });

    const promptGrowth = prevPeriodPrompts > 0 
      ? ((totalPrompts - prevPeriodPrompts) / prevPeriodPrompts * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalPrompts,
          promptGrowth: parseFloat(promptGrowth as string),
          avgResponseTime,
          responseTimeChange: -8.2, // Mock
          totalTokens,
          tokenGrowth: 18.1, // Mock
          errorRate,
          errorRateChange: -0.3 // Mock
        },
        promptData,
        tokenData,
        latencyData,
        modelPerformance
      }
    });

  } catch (error) {
    console.error('AI Stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch AI statistics' 
      },
      { status: 500 }
    );
  }
}
