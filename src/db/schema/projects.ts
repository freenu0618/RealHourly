import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projectCurrencyEnum, projectStatusEnum } from "./enums";
import { clients } from "./clients";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    clientId: uuid("client_id").references(() => clients.id),
    name: text("name").notNull(),
    aliases: text("aliases")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    startDate: date("start_date", { mode: "string" }),
    expectedHours: numeric("expected_hours").notNull().default("0"),
    expectedFee: numeric("expected_fee").notNull().default("0"),
    currency: projectCurrencyEnum("currency").notNull().default("USD"),
    platformFeeRate: numeric("platform_fee_rate").notNull().default("0"),
    taxRate: numeric("tax_rate").notNull().default("0"),
    progressPercent: integer("progress_percent").notNull().default(0),
    /** @deprecated Use `status` instead. Will be removed in a future migration. */
    isActive: boolean("is_active").notNull().default(true),
    status: projectStatusEnum("status").notNull().default("active"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    // idx_projects_user_active removed — status index covers all use cases
    index("idx_projects_user_status")
      .on(table.userId, table.status)
      .where(sql`${table.deletedAt} IS NULL`),
    index("idx_projects_client")
      .on(table.clientId)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
