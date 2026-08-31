import { config } from "dotenv";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { COMMANDS } from "../lib/discord/commands";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const applicationId = process.env.DISCORD_APPLICATION_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!applicationId || !botToken) {
    throw new Error(
      "DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN are required. Set them in your .env file.",
    );
  }

  const rest = new REST({ version: "10" }).setToken(botToken);

  await rest.put(Routes.applicationCommands(applicationId), { body: COMMANDS });

  console.log(
    `Registered ${COMMANDS.length} application commands: ${COMMANDS.map(
      (c) => c.name,
    ).join(", ")}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
