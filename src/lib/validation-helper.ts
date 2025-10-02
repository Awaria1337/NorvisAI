/**
 * Validation helper for API routes
 * Makes it easy to validate request bodies with Joi schemas
 */

import { NextResponse } from 'next/server';
import Joi from 'joi';

interface ValidationResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Validate request body against Joi schema
 * Returns formatted error response if validation fails
 */
export function validateBody<T>(
  body: any,
  schema: Joi.ObjectSchema<T>
): ValidationResult {
  const { error, value } = schema.validate(body, {
    abortEarly: false, // Return all errors
    stripUnknown: true  // Remove unknown fields
  });

  if (error) {
    // Format all validation errors
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');

    return {
      success: false,
      error: errorMessage
    };
  }

  return {
    success: true,
    data: value
  };
}

/**
 * Create validation error response
 */
export function validationErrorResponse(error: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error,
      type: 'ValidationError'
    },
    { status: 400 }
  );
}

/**
 * Middleware-style validation function
 * Use in API routes to validate and return error response automatically
 */
export async function withValidation<T>(
  body: any,
  schema: Joi.ObjectSchema<T>
): Promise<{ value?: T; response?: NextResponse }> {
  const result = validateBody(body, schema);

  if (!result.success) {
    return {
      response: validationErrorResponse(result.error!)
    };
  }

  return {
    value: result.data
  };
}

// Export validation schemas for convenience
export {
  registerSchema,
  loginSchema,
  createChatSchema,
  sendMessageSchema,
  apiKeySchema
} from './validations';
