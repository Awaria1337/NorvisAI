import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/plans - Get all active plans
export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        active: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    // Parse features JSON
    const plansWithParsedFeatures = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features),
    }));

    return NextResponse.json({
      success: true,
      data: plansWithParsedFeatures,
    });

  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
