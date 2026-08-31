import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const counterState = sqliteTable("counter_state", {
  id: integer("id").primaryKey(),
  lastIncidentAt: integer("last_incident_at", { mode: "timestamp" }).notNull(),
});

export const incidents = sqliteTable("incidents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  reason: text("reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type CounterState = typeof counterState.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
