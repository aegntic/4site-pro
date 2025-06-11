
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { 
  prepare: false,
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from '../db/schema';
    