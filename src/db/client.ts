import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

export type Database = LibSQLDatabase<typeof schema>;

let db: Database | undefined;

/**
 * Lazily initializes the Turso (libSQL) database client.
 * The connection is only established on first use.
 */
export function getDb(): Database {
  if (db) {
    return db;
  }

  const env = getEnv();
  const client: Client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

  db = drizzle(client, { schema });
  return db;
}
