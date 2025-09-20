import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

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

        // Generate JWT token
        const token = signToken({
            userId: user.id,
            email: user.email
        });

        console.log('Login successful for:', user.email);

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}