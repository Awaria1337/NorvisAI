import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { SettingsService } from '@/lib/services/settings.service';

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

        // Create new user in database
        const newUser = await createUser({
            name,
            email,
            password
        });

        // Generate JWT token
        const token = signToken({
            userId: newUser.id,
            email: newUser.email
        });

        console.log('Registration successful for:', newUser.email);

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    createdAt: newUser.createdAt
                },
                token
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