import { formatDate, getStreak } from "@/lib/counter/service";
import { sendChannelMessage } from "@/lib/discord/send";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const env = getEnv();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    logger.warn("Cron request rejected: invalid CRON_SECRET");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const streak = await getStreak();
    const days = streak.days;
    const lastIncidentDate = streak.lastIncidentAt
      ? formatDate(streak.lastIncidentAt)
      : "";

    const imageUrl = new URL("/api/og", env.APP_URL);
    imageUrl.searchParams.set("days", String(days));
    imageUrl.searchParams.set("lastIncidentDate", lastIncidentDate);

    await sendChannelMessage(env.DISCORD_CHANNEL_ID, {
      content: `🟢 ${days} days without Discord incidents`,
      embeds: [{ image: { url: imageUrl.toString() } }],
    });

    logger.info("Daily counter posted to Discord", { days });

    return Response.json({ ok: true, days });
  } catch (error) {
    logger.error("Failed to post daily counter", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
