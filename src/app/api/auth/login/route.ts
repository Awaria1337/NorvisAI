import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const { error, value } = loginSchema.validate(body);
        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.details[0].message
                },
                { status: 400 }
            );
        }

        const { email, password } = value;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password'
                },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password'
                },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken(user.id);

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            data: {
                user: userWithoutPassword,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            { status: 500 }
        );
    }
}