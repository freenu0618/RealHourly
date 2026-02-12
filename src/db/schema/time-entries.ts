import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timeCategoryEnum, timeIntentEnum } from "./enums";
import { projects } from "./projects";

export const timeEntries = pgTable(
  "time_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    date: date("date", { mode: "string" }).notNull(),
    minutes: integer("minutes").notNull(),
    category: timeCategoryEnum("category").notNull(),
    intent: timeIntentEnum("intent").notNull().default("done"),
    taskDescription: text("task_description").notNull().default(""),
    sourceText: text("source_text"),
    issues: text("issues")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    // Timesheet integration
    timesheetId: uuid("timesheet_id"),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_time_project_date")
      .on(table.projectId, table.date)
      .where(sql`${table.deletedAt} IS NULL`),
    index("idx_time_project_intent")
      .on(table.projectId, table.intent)
      .where(sql`${table.deletedAt} IS NULL`),
    index("idx_time_project_category")
      .on(table.projectId, table.category)
      .where(sql`${table.deletedAt} IS NULL`),
    index("idx_time_timesheet")
      .on(table.timesheetId)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
