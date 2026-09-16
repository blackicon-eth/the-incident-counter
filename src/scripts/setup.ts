#!/usr/bin/env tsx

import { config } from "dotenv";
import { migrate } from "drizzle-orm/libsql/migrator";
import { sql } from "drizzle-orm";
import { Routes } from "discord-api-types/v10";
import { getDb } from "../db/client";
import { getEnv } from "../lib/env";
import { getRest } from "../lib/discord/rest";
import { registerCommands } from "./register-commands";
import { seedCounter } from "./seed";

config({ path: ".env.local" });
config({ path: ".env" });

const migrationsFolder = new URL("../../drizzle", import.meta.url).pathname;

function usage(): void {
  console.log(`Usage: incidents-counter <command>

Commands:
  setup              Validate access, migrate, seed if needed, and register commands
  doctor             Validate environment, database, Discord, and channel access
  db:migrate         Apply pending Drizzle migrations
  db:seed            Initialize the counter only when it does not exist
  discord:register   Register the global Discord slash commands
  discord:check      Check the bot token and configured channel
`);
}

function checkEnvironment(): void {
  getEnv();
  console.log("Environment: ok");
}

async function checkDatabase(): Promise<void> {
  await getDb().run(sql`SELECT 1`);
  console.log("Turso: ok");
}

async function checkDiscord(): Promise<void> {
  const env = getEnv();
  const rest = getRest();
  const bot = await rest.get(Routes.user("@me"));
  await rest.get(Routes.channel(env.DISCORD_CHANNEL_ID));
  const botName = typeof bot === "object" && bot && "username" in bot
    ? String(bot.username)
    : "unknown";
  console.log(`Discord: ok (${botName}; channel ${env.DISCORD_CHANNEL_ID})`);
}

async function migrateDatabase(): Promise<void> {
  await migrate(getDb(), { migrationsFolder });
  console.log("Database migrations: ok");
}

async function doctor(): Promise<void> {
  checkEnvironment();
  await checkDatabase();
  await checkDiscord();
  console.log("Doctor: all checks passed");
}

async function setup(): Promise<void> {
  await doctor();
  await migrateDatabase();
  await seedCounter();
  await registerCommands();
  console.log("Setup complete");
}

async function main(): Promise<void> {
  const command = process.argv[2];

  if (!command || command === "--help" || command === "-h") {
    usage();
    return;
  }

  switch (command) {
    case "setup":
      await setup();
      break;
    case "doctor":
      await doctor();
      break;
    case "db:migrate":
      checkEnvironment();
      await migrateDatabase();
      break;
    case "db:seed":
      await seedCounter();
      break;
    case "discord:register":
      await registerCommands();
      break;
    case "discord:check":
      checkEnvironment();
      await checkDiscord();
      break;
    default:
      usage();
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
