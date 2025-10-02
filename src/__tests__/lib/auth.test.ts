/**
 * Unit tests for authentication utilities
 */

import { signToken, verifyToken, hashPassword, comparePassword } from '@/lib/auth';

describe('Authentication Utilities', () => {
  describe('signToken and verifyToken', () => {
    it('should create and verify a valid JWT token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com'
      };

      const token = signToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const verified = verifyToken(token);
      expect(verified).toBeTruthy();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const result = verifyToken(invalidToken);
      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token that expires immediately
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      // Wait a bit to ensure expiration
      setTimeout(() => {
        const result = verifyToken(token);
        expect(result).toBeNull();
      }, 100);
    });

    it('should include iat and exp claims in token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com'
      };

      const token = signToken(payload);
      const verified = verifyToken(token);

      expect(verified?.iat).toBeDefined();
      expect(verified?.exp).toBeDefined();
      expect(typeof verified?.iat).toBe('number');
      expect(typeof verified?.exp).toBe('number');
    });
  });

  describe('hashPassword and comparePassword', () => {
    it('should hash password and verify it correctly', async () => {
      const password = 'TestPassword123!';
      
      const hash = await hashPassword(password);
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      
      const hash = await hashPassword(password);
      const isValid = await comparePassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      // Hashes should be different due to random salt
      expect(hash1).not.toBe(hash2);
      
      // But both should verify correctly
      expect(await comparePassword(password, hash1)).toBe(true);
      expect(await comparePassword(password, hash2)).toBe(true);
    });

    it('should handle empty password', async () => {
      const emptyPassword = '';
      const hash = await hashPassword(emptyPassword);
      
      expect(hash).toBeTruthy();
      expect(await comparePassword(emptyPassword, hash)).toBe(true);
      expect(await comparePassword('something', hash)).toBe(false);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(specialPassword);
      
      expect(await comparePassword(specialPassword, hash)).toBe(true);
    });
  });

  describe('getTokenFromRequest', () => {
    it('should extract token from Authorization header', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'authorization') {
              return `Bearer ${mockToken}`;
            }
            return null;
          }
        }
      } as unknown as Request;

      const { getTokenFromRequest } = require('@/lib/auth');
      const token = getTokenFromRequest(mockRequest);
      
      expect(token).toBe(mockToken);
    });

    it('should return null if no Authorization header', () => {
      const mockRequest = {
        headers: {
          get: () => null
        }
      } as unknown as Request;

      const { getTokenFromRequest } = require('@/lib/auth');
      const token = getTokenFromRequest(mockRequest);
      
      expect(token).toBeNull();
    });

    it('should return null if Authorization header does not start with Bearer', () => {
      const mockRequest = {
        headers: {
          get: () => 'Basic some-token'
        }
      } as unknown as Request;

      const { getTokenFromRequest } = require('@/lib/auth');
      const token = getTokenFromRequest(mockRequest);
      
      expect(token).toBeNull();
    });
  });
});
