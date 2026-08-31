import { getEnv } from "@/lib/env";

function parseAuthorizedUserIds(raw: string): Set<string> {
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function getAuthorizedUserIds(): Set<string> {
  const env = getEnv();
  return parseAuthorizedUserIds(env.AUTHORIZED_USER_IDS);
}

export function isAuthorized(userId: string): boolean {
  return getAuthorizedUserIds().has(userId);
}
