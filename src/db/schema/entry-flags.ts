import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timeEntries } from "./time-entries";

export const flagTypeEnum = pgEnum("flag_type", [
  "weekend_work",
  "late_night",
  "long_session",
  "backdated",
  "round_number",
]);

export const flagSeverityEnum = pgEnum("flag_severity", [
  "info",
  "warning",
]);

export const entryFlags = pgTable(
  "entry_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timeEntryId: uuid("time_entry_id")
      .notNull()
      .references(() => timeEntries.id),
    flagType: flagTypeEnum("flag_type").notNull(),
    severity: flagSeverityEnum("severity").notNull().default("info"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_flag_entry")
      .on(table.timeEntryId)
      .where(sql`${table.dismissedAt} IS NULL`),
    index("idx_flag_type")
      .on(table.flagType)
      .where(sql`${table.dismissedAt} IS NULL`),
  ],
);
