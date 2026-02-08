import {
  pgTable,
  uuid,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { alertTypeEnum } from "./enums";
import { projects } from "./projects";

export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    alertType: alertTypeEnum("alert_type").notNull(),
    triggeredAt: timestamp("triggered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_alerts_project")
      .on(table.projectId, table.alertType, table.dismissedAt)
      .where(sql`${table.deletedAt} IS NULL`),
    uniqueIndex("idx_alerts_active")
      .on(table.projectId, table.alertType)
      .where(
        sql`${table.dismissedAt} IS NULL AND ${table.deletedAt} IS NULL`,
      ),
  ],
);
