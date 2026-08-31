import {
  InteractionResponseType,
  MessageFlags,
  type APIChatInputApplicationCommandInteractionData,
  type APIApplicationCommandInteraction,
  type APIApplicationCommandInteractionDataStringOption,
  type APIInteractionResponse,
} from "discord-api-types/v10";
import { isAuthorized } from "@/lib/auth";
import { formatDate, getLastIncident, getStats, getStreak, recordIncident } from "@/lib/counter/service";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logging";
import { sendChannelMessage } from "./send";

function message(content: string, ephemeral = false): APIInteractionResponse {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content,
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    },
  };
}

export async function handleApplicationCommand(
  interaction: APIApplicationCommandInteraction,
): Promise<APIInteractionResponse> {
  const name = interaction.data.name;
  const user = interaction.member?.user ?? interaction.user;
  const userId = user?.id;
  const username = user?.username ?? "unknown";

  switch (name) {
    case "incident": {
      if (!userId || !isAuthorized(userId)) {
        return message("You are not authorized to reset the counter.", true);
      }

      const reasonOption = (
        interaction.data as APIChatInputApplicationCommandInteractionData
      ).options?.find(
        (option) => option.name === "reason",
      ) as APIApplicationCommandInteractionDataStringOption | undefined;

      const reason = reasonOption?.value;

      await recordIncident({ userId, username, reason });
      logger.info("Incident recorded, counter reset", { userId, username, reason });

      const channelId = getEnv().DISCORD_CHANNEL_ID;
      const timestamp = Math.floor(Date.now() / 1000);

      try {
        await sendChannelMessage(channelId, {
          content: [
            "⚠️ **Incident recorded — counter reset to 0**",
            "",
            `**Reported by:** <@${userId}> (\`${username}\`)`,
            `**Reason:** ${reason ?? "_No reason provided_"}`,
            `**When:** <t:${timestamp}:F>`,
          ].join("\n"),
        });
      } catch (error) {
        logger.error("Failed to post incident recap message", error);
      }

      // Acknowledge the interaction without a visible message — the public
      // recap above is the announcement.
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { flags: MessageFlags.Ephemeral },
      };
    }

    case "days": {
      const [streak, lastIncident] = await Promise.all([
        getStreak(),
        getLastIncident(),
      ]);

      if (!streak.lastIncidentAt) {
        return message("No incidents recorded yet.", true);
      }

      const lines = [
        `Current streak: ${streak.days} days`,
        `Last incident: ${formatDate(streak.lastIncidentAt)}`,
      ];

      if (lastIncident?.reason) {
        lines.push(`Reason: ${lastIncident.reason}`);
      }

      return message(lines.join("\n"), true);
    }

    case "stats": {
      const stats = await getStats();
      const recent = stats.mostRecentIncident;

      const lines = [
        `**Current streak:** ${stats.streak.days} days`,
        `**Total incidents:** ${stats.totalIncidents}`,
        `**Most recent incident:** ${recent ? formatDate(recent.createdAt) : "—"}`,
        `**Last reset author:** ${recent ? recent.username : "—"}`,
        `**Reason:** ${recent?.reason ?? "—"}`,
      ];

      return message(lines.join("\n"), true);
    }

    default: {
      return message("Unknown command.", true);
    }
  }
}
