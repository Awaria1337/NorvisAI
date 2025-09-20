import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Extract token from request
        const token = getTokenFromRequest(request);
        
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'No token provided' },
                { status: 401 }
            );
        }

        // Verify JWT token
        const payload = verifyToken(token);
        
        if (!payload) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Find user in database
        const user = await findUserById(payload.userId);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Auth verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}