import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { costTypeEnum } from "./enums";
import { projects } from "./projects";

export const costEntries = pgTable(
  "cost_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    date: date("date", { mode: "string" }),
    amount: numeric("amount").notNull(),
    costType: costTypeEnum("cost_type").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_cost_project")
      .on(table.projectId)
      .where(sql`${table.deletedAt} IS NULL`),
    index("idx_cost_project_type")
      .on(table.projectId, table.costType)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
