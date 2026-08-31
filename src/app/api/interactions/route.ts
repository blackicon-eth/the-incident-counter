import {
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  type APIInteraction,
} from "discord-api-types/v10";
import { getEnv } from "@/lib/env";
import { handleApplicationCommand } from "@/lib/discord/handleInteraction";
import { verifyDiscordSignature } from "@/lib/discord/verify";
import { logger } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const env = getEnv();

  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const rawBody = await request.text();

  if (!signature || !timestamp) {
    logger.warn("Missing signature headers");
    return new Response("Missing signature headers", { status: 401 });
  }

  if (
    !verifyDiscordSignature({
      publicKey: env.DISCORD_PUBLIC_KEY,
      signature,
      timestamp,
      body: rawBody,
    })
  ) {
    logger.warn("Invalid Discord interaction signature");
    return new Response("Invalid request signature", { status: 401 });
  }

  let interaction: APIInteraction;
  try {
    interaction = JSON.parse(rawBody) as APIInteraction;
  } catch {
    logger.warn("Invalid JSON body");
    return new Response("Invalid body", { status: 400 });
  }

  if (interaction.type === InteractionType.Ping) {
    return Response.json({ type: InteractionResponseType.Pong });
  }

  if (interaction.type === InteractionType.ApplicationCommand) {
    try {
      const response = await handleApplicationCommand(interaction);
      return Response.json(response);
    } catch (error) {
      logger.error("Error handling application command", error);
      return Response.json({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "Something went wrong while processing your command.",
          flags: MessageFlags.Ephemeral,
        },
      });
    }
  }

  logger.warn("Unsupported interaction type", { type: interaction.type });
  return new Response("Unsupported interaction type", { status: 400 });
}
