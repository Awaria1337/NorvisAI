/**
 * Admin Authentication & Authorization
 * Role-based access control for admin panel
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { config } from './config';

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
  LOG_VIEWER = 'LOG_VIEWER'
}

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for admin
 */
export function signAdminToken(payload: Omit<AdminTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.JWT_SECRET, { 
    expiresIn: '8h' // Admin sessions expire after 8 hours
  });
}

/**
 * Verify admin JWT token
 */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, config.JWT_SECRET) as AdminTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate admin with username/email and password
 */
export async function authenticateAdmin(
  identifier: string, // username or email
  password: string,
  ipAddress?: string
): Promise<{ success: boolean; admin?: any; token?: string; error?: string }> {
  try {
    console.log('🔍 Looking for admin:', identifier);
    
    // Find admin by email
    const admin = await prisma.admin.findFirst({
      where: {
        email: identifier
      }
    });

    console.log('📊 Admin found:', {
      found: !!admin,
      email: admin?.email,
      active: admin?.active,
      role: admin?.role,
      passwordStartsWith: admin?.password?.substring(0, 10)
    });

    if (!admin) {
      console.log('❌ Admin not found');
      return {
        success: false,
        error: 'Geçersiz kullanıcı adı veya şifre'
      };
    }

    // Check if admin is active
    if (!admin.active) {
      console.log('❌ Admin not active');
      return {
        success: false,
        error: 'Hesap askıya alınmış'
      };
    }

    console.log('🔑 Comparing password...');
    console.log('Password from DB starts with:', admin.password.substring(0, 10));
    console.log('Password length:', admin.password.length);
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password mismatch');
      return {
        success: false,
        error: 'Geçersiz kullanıcı adı veya şifre'
      };
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLogin: new Date()
      }
    });

    // Generate token
    const token = signAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    });

    return {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin
      },
      token
    };

  } catch (error) {
    console.error('Admin authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Log admin action for audit trail
 * TODO: Implement audit logging when AdminAuditLog model is added
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    // TODO: Implement when audit log is ready
    console.log('Admin action:', { adminId, action, ipAddress });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

/**
 * Check if admin has required role
 */
export function hasAdminRole(
  adminRole: AdminRole,
  requiredRole: AdminRole | AdminRole[]
): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Super admin has all permissions
  if (adminRole === AdminRole.SUPER_ADMIN) {
    return true;
  }

  return roles.includes(adminRole);
}

/**
 * Role hierarchy check
 */
export function canAccessResource(
  adminRole: AdminRole,
  resource: string
): boolean {
  const permissions: Record<AdminRole, string[]> = {
    [AdminRole.SUPER_ADMIN]: ['*'], // All permissions
    [AdminRole.SUPPORT_ADMIN]: [
      'users:read',
      'users:write',
      'tickets:read',
      'tickets:write',
      'notifications:read',
      'notifications:write',
      'stats:read'
    ],
    [AdminRole.LOG_VIEWER]: [
      'logs:read',
      'stats:read',
      'users:read'
    ]
  };

  const rolePermissions = permissions[adminRole] || [];
  
  // Super admin has all permissions
  if (rolePermissions.includes('*')) {
    return true;
  }

  return rolePermissions.includes(resource);
}

/**
 * Extract admin token from request
 */
export function getAdminTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify admin authentication from request
 * Checks token from cookie or authorization header
 */
export async function verifyAdminAuth(request: Request): Promise<{
  isValid: boolean;
  admin?: any;
  error?: string;
}> {
  try {
    // Try to get token from cookie first
    const cookieHeader = request.headers.get('cookie');
    let token: string | null = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const adminTokenCookie = cookies.find(c => c.startsWith('admin_token='));
      if (adminTokenCookie) {
        token = adminTokenCookie.split('=')[1];
      }
    }

    // If not in cookie, try authorization header
    if (!token) {
      token = getAdminTokenFromRequest(request);
    }

    if (!token) {
      return {
        isValid: false,
        error: 'No authentication token found'
      };
    }

    // Verify token
    const payload = verifyAdminToken(token);
    if (!payload) {
      return {
        isValid: false,
        error: 'Invalid or expired token'
      };
    }

    // Fetch admin from database to ensure they still exist and are active
    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true
      }
    });

    if (!admin) {
      return {
        isValid: false,
        error: 'Admin account not found'
      };
    }

    if (!admin.active) {
      return {
        isValid: false,
        error: 'Admin account is inactive'
      };
    }

    return {
      isValid: true,
      admin
    };
  } catch (error) {
    console.error('verifyAdminAuth error:', error);
    return {
      isValid: false,
      error: 'Authentication verification failed'
    };
  }
}

/**
 * Create initial admin account (for setup)
 */
export async function createAdminAccount(
  email: string,
  password: string,
  name: string,
  role: string = 'admin'
): Promise<{ success: boolean; admin?: any; error?: string }> {
  try {
    // Check if admin already exists
    const existing = await prisma.admin.findFirst({
      where: { email }
    });

    if (existing) {
      return {
        success: false,
        error: 'Admin account already exists'
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return {
      success: true,
      admin
    };

  } catch (error) {
    console.error('Failed to create admin account:', error);
    return {
      success: false,
      error: 'Failed to create admin account'
    };
  }
}
