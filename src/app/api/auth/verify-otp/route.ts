import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email ve OTP gereklidir' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // OTP kontrolü
    if (!user.otp || !user.otpExpires) {
      return NextResponse.json(
        { error: 'OTP bulunamadı. Lütfen yeni bir kod isteyin.' },
        { status: 400 }
      );
    }

    // OTP süre kontrolü
    if (new Date() > user.otpExpires) {
      return NextResponse.json(
        { error: 'OTP kodunun süresi doldu. Lütfen yeni bir kod isteyin.' },
        { status: 400 }
      );
    }

    // OTP eşleşme kontrolü
    if (user.otp !== otp) {
      return NextResponse.json(
        { error: 'Geçersiz OTP kodu' },
        { status: 400 }
      );
    }

    // OTP doğrulandı - temizle ve işaretle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpires: null,
        otpVerified: true,
      },
    });

    // JWT token oluştur
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    console.log('✅ OTP verified for:', user.email);

    return NextResponse.json(
      {
        success: true,
        message: 'Giriş başarılı!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
