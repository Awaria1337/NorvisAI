import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOTP, sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email gereklidir' },
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

    // Son OTP gönderim zamanını kontrol et (rate limiting - 1 dakika)
    if (user.lastOtpSentAt) {
      const timeSinceLastOtp = Date.now() - user.lastOtpSentAt.getTime();
      const oneMinute = 60 * 1000;
      
      if (timeSinceLastOtp < oneMinute) {
        const waitTime = Math.ceil((oneMinute - timeSinceLastOtp) / 1000);
        return NextResponse.json(
          { error: `Lütfen ${waitTime} saniye bekleyin ve tekrar deneyin` },
          { status: 429 }
        );
      }
    }

    // 6 haneli OTP oluştur
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika

    // OTP'yi veritabanına kaydet
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpires,
        otpVerified: false,
        lastOtpSentAt: new Date(),
      },
    });

    // OTP email'i gönder
    try {
      await sendOTPEmail(user.email, user.name, otp);
      console.log('✅ OTP email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      return NextResponse.json(
        { error: 'OTP gönderilemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Doğrulama kodu email adresinize gönderildi',
        expiresIn: 300 // 5 dakika (saniye cinsinden)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
