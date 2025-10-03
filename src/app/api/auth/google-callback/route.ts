import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, name, image } = await request.json();

    console.log('🔐 Google OAuth callback:', { email, name, hasImage: !!image });

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

    let isNewUser = false;

    if (user) {
      console.log('✅ Existing user found:', user.id);
      // User exists, update profile info and last login
      user = await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          profileImage: image || user.profileImage,
          updatedAt: new Date()
        }
      });
      console.log('✅ User profile updated');
    } else {
      console.log('🆕 Creating new Google OAuth user');
      isNewUser = true;
      
      // Create new user (Google OAuth user has no password)
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          profileImage: image || null,
          password: null, // No password for OAuth users
        }
      });
      console.log('✅ New user created:', user.id);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    console.log('✅ JWT token generated');

    return NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      },
      token,
      message: isNewUser ? 'Hesap başarıyla oluşturuldu!' : 'Hoş geldiniz!'
    });
  } catch (error: any) {
    console.error('❌ Google callback error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
