import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken, generateResetPasswordUrl, sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json(
        { message: 'If the email exists, a password reset link has been sent' },
        { status: 200 }
      );
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return NextResponse.json(
        { error: 'This account uses social login. Please sign in with Google.' },
        { status: 400 }
      );
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Send password reset email
    const resetUrl = generateResetPasswordUrl(resetToken);
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return NextResponse.json(
      { message: 'Password reset link has been sent to your email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
