import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Encryption helpers
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-character-encryption-key!!';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export interface SystemSettingsData {
  // General Settings
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  allowRegistration?: boolean;

  // AI Settings
  defaultModel?: string;
  maxTokensPerRequest?: number;
  enableImageGeneration?: boolean;
  enableCodeGeneration?: boolean;
  enableVoiceChat?: boolean;

  // Security Settings
  maxRequestsPerMinute?: number;
  sessionTimeout?: number;
  requireEmailVerification?: boolean;
  enableTwoFactor?: boolean;
  passwordMinLength?: number;

  // Email Settings
  smtpEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFrom?: string;
  smtpFromName?: string;

  // Notification Settings
  enableNotifications?: boolean;
  notificationSound?: boolean;
  enableEmailNotifications?: boolean;

  // Analytics & Monitoring
  enableAnalytics?: boolean;
  enableErrorTracking?: boolean;
  logLevel?: string;

  // Rate Limiting & Performance
  enableRateLimiting?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;

  updatedBy?: string;
}

export class SettingsService {
  /**
   * Get current system settings
   * Creates default settings if none exist
   */
  static async getSettings() {
    try {
      let settings = await prisma.systemSettings.findFirst();

      if (!settings) {
        // Create default settings
        settings = await prisma.systemSettings.create({
          data: {}
        });
      }

      // Decrypt sensitive data for display
      const settingsData = { ...settings };
      if (settingsData.smtpPassword) {
        try {
          settingsData.smtpPassword = decrypt(settingsData.smtpPassword);
        } catch (e) {
          // If decryption fails, it might not be encrypted yet
          console.warn('Failed to decrypt SMTP password');
        }
      }

      return {
        success: true,
        data: settingsData
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {
        success: false,
        error: 'Failed to fetch system settings'
      };
    }
  }

  /**
   * Update system settings
   */
  static async updateSettings(data: SystemSettingsData) {
    try {
      // Get existing settings
      let settings = await prisma.systemSettings.findFirst();

      if (!settings) {
        // Create if doesn't exist
        settings = await prisma.systemSettings.create({
          data: {}
        });
      }

      // Encrypt sensitive data before saving
      const updateData = { ...data };
      if (updateData.smtpPassword) {
        updateData.smtpPassword = encrypt(updateData.smtpPassword);
      }

      // Update settings
      const updated = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updated,
        message: 'Settings updated successfully'
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      return {
        success: false,
        error: 'Failed to update system settings'
      };
    }
  }

  /**
   * Check if maintenance mode is active
   */
  static async isMaintenanceMode(): Promise<boolean> {
    try {
      const settings = await prisma.systemSettings.findFirst({
        select: { maintenanceMode: true }
      });
      return settings?.maintenanceMode || false;
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
      return false;
    }
  }

  /**
   * Check if registration is allowed
   */
  static async isRegistrationAllowed(): Promise<boolean> {
    try {
      const settings = await prisma.systemSettings.findFirst({
        select: { allowRegistration: true }
      });
      return settings?.allowRegistration !== false; // Default to true
    } catch (error) {
      console.error('Error checking registration status:', error);
      return true; // Default to allowed
    }
  }

  /**
   * Get public settings (safe for client-side)
   */
  static async getPublicSettings() {
    try {
      const settings = await prisma.systemSettings.findFirst({
        select: {
          siteName: true,
          siteDescription: true,
          logoUrl: true,
          maintenanceMode: true,
          maintenanceMessage: true,
          allowRegistration: true,
          enableImageGeneration: true,
          enableCodeGeneration: true,
          enableVoiceChat: true,
          enableNotifications: true,
          notificationSound: true
        }
      });

      return {
        success: true,
        data: settings || {}
      };
    } catch (error) {
      console.error('Error fetching public settings:', error);
      return {
        success: false,
        error: 'Failed to fetch public settings'
      };
    }
  }

  /**
   * Validate settings data
   */
  static validateSettings(data: SystemSettingsData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate site name
    if (data.siteName !== undefined && data.siteName.trim().length === 0) {
      errors.push('Site name cannot be empty');
    }

    // Validate tokens
    if (data.maxTokensPerRequest !== undefined) {
      if (data.maxTokensPerRequest < 100 || data.maxTokensPerRequest > 128000) {
        errors.push('Max tokens must be between 100 and 128000');
      }
    }

    // Validate rate limiting
    if (data.maxRequestsPerMinute !== undefined) {
      if (data.maxRequestsPerMinute < 1 || data.maxRequestsPerMinute > 1000) {
        errors.push('Max requests per minute must be between 1 and 1000');
      }
    }

    // Validate session timeout
    if (data.sessionTimeout !== undefined) {
      if (data.sessionTimeout < 1 || data.sessionTimeout > 720) {
        errors.push('Session timeout must be between 1 and 720 hours');
      }
    }

    // Validate password length
    if (data.passwordMinLength !== undefined) {
      if (data.passwordMinLength < 6 || data.passwordMinLength > 32) {
        errors.push('Password minimum length must be between 6 and 32');
      }
    }

    // Validate SMTP settings if enabled
    if (data.smtpEnabled) {
      if (!data.smtpHost) {
        errors.push('SMTP host is required when SMTP is enabled');
      }
      if (!data.smtpPort || data.smtpPort < 1 || data.smtpPort > 65535) {
        errors.push('Valid SMTP port is required (1-65535)');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
