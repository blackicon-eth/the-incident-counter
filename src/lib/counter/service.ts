import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { counterState, incidents, type Incident } from "@/db/schema";

const DAY_MS = 86_400_000;
const DISPLAY_TIME_ZONE = "Europe/Rome";

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Number of whole UTC days between two dates. Never negative.
 */
export function daysWithoutIncidents(from: Date, to: Date): number {
  const diff = startOfUtcDay(to) - startOfUtcDay(from);
  return Math.max(0, Math.floor(diff / DAY_MS));
}

export function formatDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export interface Streak {
  days: number;
  lastIncidentAt: Date | null;
}

export async function getStreak(): Promise<Streak> {
  const db = getDb();
  const state = await db
    .select()
    .from(counterState)
    .where(eq(counterState.id, 1))
    .get();

  if (!state) {
    return { days: 0, lastIncidentAt: null };
  }

  return {
    days: daysWithoutIncidents(state.lastIncidentAt, new Date()),
    lastIncidentAt: state.lastIncidentAt,
  };
}

export interface RecordIncidentInput {
  userId: string;
  username: string;
  reason?: string;
}

export async function recordIncident(input: RecordIncidentInput): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .insert(counterState)
      .values({ id: 1, lastIncidentAt: now })
      .onConflictDoUpdate({
        target: counterState.id,
        set: { lastIncidentAt: now },
      });

    await tx.insert(incidents).values({
      userId: input.userId,
      username: input.username,
      reason: input.reason ?? null,
      createdAt: now,
    });
  });
}

export async function getLastIncident(): Promise<Incident | null> {
  const db = getDb();
  const recent = await db
    .select()
    .from(incidents)
    .orderBy(desc(incidents.createdAt))
    .limit(1)
    .get();

  return recent ?? null;
}

export async function getIncidentHistory(limit = 20): Promise<Incident[]> {
  const db = getDb();
  return db
    .select()
    .from(incidents)
    .orderBy(desc(incidents.createdAt))
    .limit(limit);
}

export interface Stats {
  streak: Streak;
  totalIncidents: number;
  mostRecentIncident: Incident | null;
}

export async function getStats(): Promise<Stats> {
  const db = getDb();

  const [streak, totalRow, recent] = await Promise.all([
    getStreak(),
    db.select({ total: count() }).from(incidents).get(),
    getLastIncident(),
  ]);

  return {
    streak,
    totalIncidents: totalRow?.total ?? 0,
    mostRecentIncident: recent ?? null,
  };
}
