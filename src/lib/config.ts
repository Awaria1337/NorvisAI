/**
 * Centralized configuration management with validation
 * Ensures all required environment variables are set before app starts
 */

interface Config {
  // App
  NODE_ENV: 'development' | 'production' | 'test';
  APP_URL: string;
  
  // Database
  DATABASE_URL: string;
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  
  // Encryption
  ENCRYPTION_KEY: string;
  
  // External APIs (Optional)
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
}

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function validateEnvironment(): Config {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new ConfigError(
      `Missing required environment variables: ${missing.join(', ')}\n\n` +
      `Please create a .env file with these variables or set them in your environment.\n` +
      `See .env.example for reference.`
    );
  }

  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new ConfigError(
      'JWT_SECRET must be at least 32 characters long for security'
    );
  }

  // Validate ENCRYPTION_KEY format
  const encryptionKey = process.env.ENCRYPTION_KEY!;
  if (encryptionKey.length < 32) {
    throw new ConfigError(
      'ENCRYPTION_KEY must be at least 32 characters long for AES-256 encryption'
    );
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new ConfigError(
      `Invalid NODE_ENV: ${nodeEnv}. Must be 'development', 'production', or 'test'`
    );
  }

  // Production-specific validations
  if (nodeEnv === 'production') {
    // Ensure production secrets are strong
    if (jwtSecret === 'your-secret-key' || jwtSecret.includes('change')) {
      throw new ConfigError(
        'JWT_SECRET appears to be a default value. Please use a strong, unique secret in production.'
      );
    }

    if (encryptionKey.includes('example') || encryptionKey.includes('change')) {
      throw new ConfigError(
        'ENCRYPTION_KEY appears to be a default value. Please use a strong, unique key in production.'
      );
    }

    // Warn if no external API keys are configured
    if (!process.env.OPENAI_API_KEY && 
        !process.env.ANTHROPIC_API_KEY && 
        !process.env.GOOGLE_API_KEY && 
        !process.env.OPENROUTER_API_KEY) {
      console.warn(
        '⚠️  WARNING: No external AI API keys configured. ' +
        'Users will need to provide their own API keys to use the service.'
      );
    }
  }

  return {
    NODE_ENV: nodeEnv as 'development' | 'production' | 'test',
    APP_URL: process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    ENCRYPTION_KEY: encryptionKey,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  };
}

// Validate and export config
let config: Config;

try {
  config = validateEnvironment();
  
  // Log success in development
  if (config.NODE_ENV === 'development') {
    console.log('✅ Environment configuration validated successfully');
  }
} catch (error) {
  if (error instanceof ConfigError) {
    console.error('\n❌ Configuration Error:\n');
    console.error(error.message);
    console.error('\n');
    process.exit(1);
  }
  throw error;
}

export { config };
export type { Config };
