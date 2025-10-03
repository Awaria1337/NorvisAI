import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, name, image } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // User exists, update last login
      user = await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          image: image || user.image,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new user (Google OAuth user has no password)
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          image: image || null,
          password: null, // No password for OAuth users
        }
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      },
      token
    });
  } catch (error: any) {
    console.error('Google callback error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
