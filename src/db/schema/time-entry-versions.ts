import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { timeEntries } from "./time-entries";
import { profiles } from "./profiles";

export const timeEntryVersions = pgTable(
  "time_entry_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timeEntryId: uuid("time_entry_id")
      .notNull()
      .references(() => timeEntries.id),
    changedBy: uuid("changed_by")
      .notNull()
      .references(() => profiles.id),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    changeType: text("change_type").notNull(), // 'create' | 'update' | 'delete'
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
  },
  (table) => [
    index("idx_version_entry").on(table.timeEntryId),
    index("idx_version_changed_at").on(table.changedAt),
  ],
);
