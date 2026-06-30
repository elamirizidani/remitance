import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function createPrismaClient(): PrismaClient {
  // DATABASE_URL is the connection pooler URL (e.g. Supabase Transaction Pooler on port 6543).
  // DIRECT_URL is the direct non-pooled connection (port 5432) — used by prisma.config.ts for migrations.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase requires SSL in production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Prevent multiple PrismaClient instances during Next.js hot-reload in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
