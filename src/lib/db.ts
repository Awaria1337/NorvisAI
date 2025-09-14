import { prisma } from './prisma';
import { hashPassword, comparePassword } from './auth';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new user with hashed password
 */
export async function createUser(userData: CreateUserData): Promise<UserResponse> {
  const hashedPassword = await hashPassword(userData.password);
  
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });
}

/**
 * Find user by ID (without password)
 */
export async function findUserById(id: string): Promise<UserResponse | null> {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Authenticate user by email and password
 */
export async function authenticateUser(email: string, password: string): Promise<UserResponse | null> {
  const user = await findUserByEmail(email);
  
  if (!user) {
    return null;
  }

  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    return null;
  }

  // Return user without password
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Check if user exists by email
 */
export async function userExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    select: {
      id: true,
    },
  });

  return !!user;
}

/**
 * Update user information
 */
export async function updateUser(id: string, data: Partial<CreateUserData>): Promise<UserResponse | null> {
  const updateData: any = {};
  
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email.toLowerCase();
  if (data.password) updateData.password = await hashPassword(data.password);

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
}