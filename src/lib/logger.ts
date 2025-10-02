/**
 * Production-ready logging system
 * Replaces console.log with structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    
    // In development, use colorful console output
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m',    // Cyan
        info: '\x1b[32m',     // Green
        warn: '\x1b[33m',     // Yellow
        error: '\x1b[31m',    // Red
      };
      const reset = '\x1b[0m';
      const color = colors[level];
      
      let output = `${color}[${timestamp}] ${level.toUpperCase()}${reset}: ${message}`;
      
      if (context && Object.keys(context).length > 0) {
        output += `\n  Context: ${JSON.stringify(context, null, 2)}`;
      }
      
      if (error) {
        output += `\n  Error: ${error.message}`;
        if (error.stack) {
          output += `\n  Stack: ${error.stack}`;
        }
      }
      
      return output;
    }
    
    // In production, use structured JSON for log aggregation
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    });
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    const formattedMessage = this.formatMessage(entry);

    // Route to appropriate console method
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }

    // In production, you could send to external logging service here
    // if (this.isProduction) {
    //   this.sendToExternalService(entry);
    // }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  // Convenience methods for common use cases
  apiRequest(method: string, path: string, context?: Record<string, any>): void {
    this.info(`API ${method} ${path}`, context);
  }

  apiError(method: string, path: string, error: Error, context?: Record<string, any>): void {
    this.error(`API ${method} ${path} failed`, error, context);
  }

  authSuccess(userId: string, email: string): void {
    this.info('User authenticated', { userId, email });
  }

  authFailure(email: string, reason: string): void {
    this.warn('Authentication failed', { email, reason });
  }

  aiRequest(provider: string, model: string, userId: string): void {
    this.info('AI request initiated', { provider, model, userId });
  }

  aiSuccess(provider: string, model: string, tokensUsed?: number): void {
    this.info('AI request completed', { provider, model, tokensUsed });
  }

  aiError(provider: string, model: string, error: Error): void {
    this.error('AI request failed', error, { provider, model });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogEntry };
