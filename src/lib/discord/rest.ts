import { REST } from "@discordjs/rest";
import { getEnv } from "@/lib/env";

let rest: REST | undefined;

export function getRest(): REST {
  if (!rest) {
    const env = getEnv();
    rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);
  }

  return rest;
}
