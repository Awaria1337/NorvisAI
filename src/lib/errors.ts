import { NextResponse } from 'next/server';

// Base API Error class
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || 'UNKNOWN_ERROR';
    this.details = details;
  }
}

// Specific error classes
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends ApiError {
  public retryAfter: number;

  constructor(retryAfter = 60) {
    super('Too many requests', 429, 'RATE_LIMIT_ERROR');
    this.retryAfter = retryAfter;
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

// Error response interface
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
  };
  retryAfter?: number;
}

// Success response interface
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// API Response type
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Error handler function
export function handleApiError(error: any, path?: string): NextResponse<ErrorResponse> {
  console.error('API Error:', {
    name: error?.name,
    message: error?.message,
    stack: error?.stack,
    path
  });

  // Handle known API errors
  if (error instanceof ApiError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        path
      }
    };

    // Add retry-after header for rate limiting
    if (error instanceof RateLimitError) {
      response.retryAfter = error.retryAfter;
      return NextResponse.json(response, {
        status: error.statusCode,
        headers: {
          'Retry-After': error.retryAfter.toString()
        }
      });
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle Prisma errors
  if (error?.code === 'P2002') {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNIQUE_CONSTRAINT_ERROR',
        message: 'A record with this data already exists',
        details: error.meta,
        timestamp: new Date().toISOString(),
        path
      }
    } as ErrorResponse, { status: 409 });
  }

  if (error?.code === 'P2025') {
    return NextResponse.json({
      success: false,
      error: {
        code: 'NOT_FOUND_ERROR',
        message: 'The requested record was not found',
        timestamp: new Date().toISOString(),
        path
      }
    } as ErrorResponse, { status: 404 });
  }

  // Handle JWT errors
  if (error?.name === 'JsonWebTokenError') {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_TOKEN_ERROR',
        message: 'Invalid authentication token',
        timestamp: new Date().toISOString(),
        path
      }
    } as ErrorResponse, { status: 401 });
  }

  if (error?.name === 'TokenExpiredError') {
    return NextResponse.json({
      success: false,
      error: {
        code: 'EXPIRED_TOKEN_ERROR',
        message: 'Authentication token has expired',
        timestamp: new Date().toISOString(),
        path
      }
    } as ErrorResponse, { status: 401 });
  }

  // Handle validation errors (Joi)
  if (error?.isJoi) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details?.[0]?.message || 'Validation failed',
        details: error.details,
        timestamp: new Date().toISOString(),
        path
      }
    } as ErrorResponse, { status: 400 });
  }

  // Default error response for unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return NextResponse.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDevelopment ? error?.message || 'Internal server error' : 'Internal server error',
      details: isDevelopment ? { stack: error?.stack } : undefined,
      timestamp: new Date().toISOString(),
      path
    }
  } as ErrorResponse, { status: 500 });
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  meta?: { page?: number; limit?: number; total?: number }
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta
  });
}

// Async error wrapper for API routes
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  path?: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, path);
    }
  };
}

// Validation helper
export function validateInput(schema: any, data: any) {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message, error.details);
  }
  return value;
}

// Auth validation helpers
export function requireAuth(payload: any) {
  if (!payload || !payload.userId) {
    throw new AuthenticationError();
  }
  return payload;
}

export function requireRole(userRole: string, requiredRoles: string[]) {
  if (!requiredRoles.includes(userRole)) {
    throw new AuthorizationError('Insufficient role permissions');
  }
}