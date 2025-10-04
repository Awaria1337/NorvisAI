import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, findUserByEmail } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { generateOTP, sendOTPEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Validate input data
        const { error, value } = loginSchema.validate(body);
        
        if (error) {
            return NextResponse.json(
                { success: false, error: error.details[0].message },
                { status: 400 }
            );
        }

        const { email, password } = value;

        console.log('Login attempt:', { email });

        // Authenticate user with database
        const user = await authenticateUser(email, password);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Get full user for rate limiting check
        const fullUser = await findUserByEmail(email);
        
        // Rate limiting: OTP sadece 1 dakikada bir gönderilebilir
        if (fullUser && fullUser.lastOtpSentAt) {
            const timeSinceLastOtp = Date.now() - fullUser.lastOtpSentAt.getTime();
            const oneMinute = 60 * 1000;
            
            if (timeSinceLastOtp < oneMinute) {
                const waitTime = Math.ceil((oneMinute - timeSinceLastOtp) / 1000);
                return NextResponse.json(
                    { 
                        success: false, 
                        error: `Lütfen ${waitTime} saniye bekleyin ve tekrar deneyin`,
                    },
                    { status: 429 }
                );
            }
        }

        // OTP GÖNDERİMİ - JWT token yerine OTP gönder
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika

        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                otp,
                otpExpires,
                otpVerified: false,
                lastOtpSentAt: new Date()
            }
        });

        // OTP email'i gönder
        try {
            await sendOTPEmail(user.email, user.name, otp);
            console.log('✅ OTP email sent to:', user.email);
        } catch (emailError) {
            console.error('❌ Failed to send OTP email:', emailError);
            return NextResponse.json(
                { success: false, error: 'OTP gönderilemedi. Lütfen tekrar deneyin.' },
                { status: 500 }
            );
        }

        console.log('Login credentials verified for:', user.email);

        // Token YOK - OTP doğrulaması gerekli
        return NextResponse.json({
            success: true,
            requiresOTP: true,
            email: user.email,
            message: 'Doğrulama kodu email adresinize gönderildi'
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}