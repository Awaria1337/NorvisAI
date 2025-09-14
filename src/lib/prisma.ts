import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: "postgresql://postgres:2041999@localhost:5432/Norvisdb?schema=public"
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Debug: Log the DATABASE_URL being used
console.log('DATABASE_URL:', process.env.DATABASE_URL);