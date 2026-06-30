import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import path from 'path';

// Prisma CLI doesn't auto-load .env.local (that's a Next.js convention).
// Load it explicitly for local migrations; hosted builds usually provide process.env directly.
config({ path: path.resolve(process.cwd(), '.env.local') });

const isGenerateCommand = process.argv.includes('generate');
const datasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl && !isGenerateCommand) {
  throw new Error('DIRECT_URL or DATABASE_URL is required for Prisma database commands');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: datasourceUrl ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
