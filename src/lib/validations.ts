import Joi from 'joi';

// User registration validation
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    })
});

// User login validation
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Chat creation validation
export const createChatSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Chat title cannot be empty',
      'string.max': 'Chat title cannot exceed 100 characters',
      'any.required': 'Chat title is required'
    }),
  
  aiModel: Joi.string()
    .valid('gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku')
    .required()
    .messages({
      'any.only': 'Please select a valid AI model',
      'any.required': 'AI model is required'
    })
});

// Message validation
export const sendMessageSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(10000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 10,000 characters',
      'any.required': 'Message content is required'
    }),
  
  chatId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid chat ID format',
      'any.required': 'Chat ID is required'
    })
});

// API key validation
export const apiKeySchema = Joi.object({
  provider: Joi.string()
    .valid('openai', 'anthropic')
    .required()
    .messages({
      'any.only': 'Please select a valid AI provider',
      'any.required': 'AI provider is required'
    }),
  
  apiKey: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'API key must be at least 10 characters long',
      'any.required': 'API key is required'
    })
});