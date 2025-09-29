import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {};

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  // General API endpoints
  default: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Auth endpoints (stricter)
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Chat endpoints (moderate)
  chat: {
    maxRequests: 60,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // File upload (very limited)
  upload: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  }
};

export class RateLimitError extends Error {
  constructor(retryAfter: number) {
    super('Too many requests');
    this.name = 'RateLimitError';
    // @ts-ignore
    this.retryAfter = retryAfter;
  }
}

export function getRateLimitKey(request: NextRequest): string {
  // Get client IP (consider proxy headers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';
  
  // Get user ID from JWT token if available
  const authHeader = request.headers.get('authorization');
  let userId = 'anonymous';
  
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      // Simple JWT decode without verification (just for rate limiting)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.userId || 'anonymous';
    } catch {
      // If token parsing fails, use IP-based limiting
    }
  }
  
  return `${ip}:${userId}`;
}

export function getRateLimitConfig(path: string) {
  if (path.includes('/api/auth/')) return RATE_LIMIT_CONFIG.auth;
  if (path.includes('/api/chats/')) return RATE_LIMIT_CONFIG.chat;
  if (path.includes('/api/files/')) return RATE_LIMIT_CONFIG.upload;
  return RATE_LIMIT_CONFIG.default;
}

export async function checkRateLimit(request: NextRequest): Promise<void> {
  const key = getRateLimitKey(request);
  const path = request.nextUrl.pathname;
  const config = getRateLimitConfig(path);
  const now = Date.now();
  
  // Clean expired entries
  if (Math.random() < 0.1) { // 10% chance to cleanup
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
  }
  
  const userStore = store[key];
  
  if (!userStore) {
    // First request
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs
    };
    return;
  }
  
  if (now > userStore.resetTime) {
    // Window expired, reset
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs
    };
    return;
  }
  
  if (userStore.count >= config.maxRequests) {
    const retryAfter = Math.ceil((userStore.resetTime - now) / 1000);
    throw new RateLimitError(retryAfter);
  }
  
  // Increment counter
  userStore.count++;
}

export function createRateLimitResponse(error: RateLimitError): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      // @ts-ignore
      retryAfter: error.retryAfter
    },
    { 
      status: 429,
      headers: {
        // @ts-ignore
        'Retry-After': error.retryAfter.toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        // @ts-ignore
        'X-RateLimit-Reset': (Date.now() + error.retryAfter * 1000).toString()
      }
    }
  );
}

// Middleware wrapper for API routes
export async function withRateLimit<T extends any[]>(
  request: NextRequest,
  handler: (...args: T) => Promise<NextResponse>,
  ...args: T
): Promise<NextResponse> {
  try {
    await checkRateLimit(request);
    return await handler(...args);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.warn(`Rate limit exceeded for ${getRateLimitKey(request)} on ${request.nextUrl.pathname}`);
      return createRateLimitResponse(error);
    }
    throw error;
  }
}

// Utility for manual rate limiting in API routes
export async function applyRateLimit(request: NextRequest): Promise<NextResponse | null> {
  try {
    await checkRateLimit(request);
    return null; // No rate limit hit
  } catch (error) {
    if (error instanceof RateLimitError) {
      return createRateLimitResponse(error);
    }
    throw error;
  }
}