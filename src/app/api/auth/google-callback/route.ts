import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

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
          emailVerified: true, // Google OAuth users are pre-verified
        }
      });
      console.log('✅ New user created:', user.id);
      
      // Send welcome email to new Google OAuth users
      try {
        await sendWelcomeEmail(user.email, user.name);
        console.log('✅ Welcome email sent to:', user.email);
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }
    }

    // Generate JWT token for Google OAuth users (no OTP needed)
    const token = generateToken({ userId: user.id, email: user.email });
    
    console.log('✅ JWT token generated for Google user');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.profileImage,
        createdAt: user.createdAt.toISOString()
      },
      isNewUser,
      message: isNewUser 
        ? 'Hesap başarıyla oluşturuldu!' 
        : 'Hoş geldiniz!'
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
