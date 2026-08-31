import { config } from "dotenv";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import * as schema from "../db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required. Set them in your .env file.",
    );
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS counter_state (
      id INTEGER PRIMARY KEY,
      last_incident_at INTEGER NOT NULL
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      reason TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  const lastIncidentAt = process.env.SEED_LAST_INCIDENT_AT
    ? new Date(process.env.SEED_LAST_INCIDENT_AT)
    : new Date();

  await db
    .insert(schema.counterState)
    .values({ id: 1, lastIncidentAt })
    .onConflictDoUpdate({
      target: schema.counterState.id,
      set: { lastIncidentAt },
    });

  console.log(
    `Seeded counter_state: last incident at ${lastIncidentAt.toISOString()}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
