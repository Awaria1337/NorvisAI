import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'norvis-ai-encryption-key-32chars!!';
const ALGORITHM = 'aes-256-cbc';

// Create a 32-byte key from the encryption key
function getKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

// Encrypt API key
function encryptApiKey(apiKey: string): string {
  try {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

// Decrypt API key
function decryptApiKey(encryptedKey: string): string {
  try {
    const key = getKey();
    const parts = encryptedKey.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted key format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

// GET /api/user/api-keys - Get user's API keys
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/user/api-keys - Starting request');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token extracted, verifying...');
    
    const payload = verifyToken(token);
    
    if (!payload) {
      console.log('Token verification failed');
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('Token verified for user:', payload.userId);

    // Test database connection first
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connected successfully');

    // Fetch user's API keys
    console.log('Fetching API keys for user:', payload.userId);
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: payload.userId
      },
      select: {
        id: true,
        provider: true,
        encryptedKey: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found API keys:', apiKeys.length);

    // Return keys with masked display (don't decrypt for security)
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      encryptedKey: key.encryptedKey.substring(0, 8) + '••••••••••••••••'
    }));

    return NextResponse.json({
      success: true,
      data: maskedKeys
    });

  } catch (error) {
    console.error('Get API keys error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/user/api-keys - Add new API key
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/user/api-keys - Starting request');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token extracted, verifying...');
    
    const payload = verifyToken(token);
    
    if (!payload) {
      console.log('Token verification failed');
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('Token verified for user:', payload.userId);

    const body = await request.json();
    console.log('Request body:', { provider: body.provider, hasApiKey: !!body.apiKey });
    
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      console.log('Missing provider or apiKey');
      return NextResponse.json(
        { success: false, error: 'Provider and API key are required' },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders = ['openai', 'anthropic', 'google', 'openrouter', 'deepseek', 'mistral', 'cohere', 'perplexity'];
    if (!validProviders.includes(provider)) {
      console.log('Invalid provider:', provider);
      return NextResponse.json(
        { success: false, error: 'Invalid provider' },
        { status: 400 }
      );
    }

    console.log('Provider validation passed');

    // Check if user already has a key for this provider
    console.log('Checking for existing key...');
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        userId: payload.userId,
        provider: provider
      }
    });

    if (existingKey) {
      console.log('User already has key for provider:', provider);
      return NextResponse.json(
        { success: false, error: `You already have an API key for ${provider}` },
        { status: 409 }
      );
    }

    console.log('No existing key found, encrypting new key...');

    // Encrypt the API key
    const encryptedKey = encryptApiKey(apiKey);
    console.log('API key encrypted successfully');

    // Save to database
    console.log('Saving to database...');
    const newApiKey = await prisma.apiKey.create({
      data: {
        provider,
        encryptedKey,
        userId: payload.userId
      },
      select: {
        id: true,
        provider: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('API key saved successfully:', newApiKey.id);

    return NextResponse.json({
      success: true,
      data: newApiKey
    }, { status: 201 });

  } catch (error) {
    console.error('Add API key error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}