import { NextRequest, NextResponse } from 'next/server';
import { createUser, userExists } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { SettingsService } from '@/lib/services/settings.service';
import { generateToken, generateVerificationUrl, sendVerificationEmail, sendWelcomeEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Check if registration is allowed
        const isAllowed = await SettingsService.isRegistrationAllowed();
        if (!isAllowed) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Yeni kayıt alımı şu anda kapatılmıştır. Lütfen daha sonra tekrar deneyin.' 
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        
        // Validate input data
        const { error, value } = registerSchema.validate(body);
        
        if (error) {
            return NextResponse.json(
                { success: false, error: error.details[0].message },
                { status: 400 }
            );
        }

        const { name, email, password } = value;

        console.log('Register attempt:', { name, email });

        // Check if user already exists
        const existingUser = await userExists(email);
        
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Generate email verification token
        const verificationToken = generateToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create new user in database with verification token
        const newUser = await createUser({
            name,
            email,
            password,
            verificationToken,
            verificationExpires
        });

        // Send verification email
        try {
            const verificationUrl = generateVerificationUrl(verificationToken);
            await sendVerificationEmail(newUser.email, newUser.name, verificationUrl);
            console.log('✅ Verification email sent to:', newUser.email);
        } catch (emailError) {
            console.error('❌ Failed to send verification email:', emailError);
            // Don't fail registration if email fails
        }

        // Generate JWT token
        const token = signToken({
            userId: newUser.id,
            email: newUser.email
        });

        console.log('Registration successful for:', newUser.email);

        return NextResponse.json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    emailVerified: false,
                    createdAt: newUser.createdAt
                },
                token,
                requiresVerification: true
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific errors
        if (error instanceof Error) {
            if (error.message.includes('User already exists')) {
                return NextResponse.json(
                    { success: false, error: 'User with this email already exists' },
                    { status: 409 }
                );
            }
        }
        
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}