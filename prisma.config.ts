import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import path from 'path';

// Prisma CLI doesn't auto-load .env.local (that's a Next.js convention).
// Load it explicitly so DIRECT_URL is available during migrations.
config({ path: path.resolve(process.cwd(), '.env.local') });

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
  throw new Error('DIRECT_URL is not set in .env.local');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: directUrl,
  },
});
