import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects";

export const projectShares = pgTable(
  "project_shares",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    shareToken: uuid("share_token").notNull().defaultRandom(),
    label: text("label"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    showTimeDetails: boolean("show_time_details").notNull().default(true),
    showCategoryBreakdown: boolean("show_category_breakdown")
      .notNull()
      .default(true),
    showProgress: boolean("show_progress").notNull().default(true),
    showInvoiceDownload: boolean("show_invoice_download")
      .notNull()
      .default(false),
    isRevoked: boolean("is_revoked").notNull().default(false),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
    accessCount: integer("access_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("idx_shares_token")
      .on(table.shareToken)
      .where(
        sql`${table.deletedAt} IS NULL AND ${table.isRevoked} = false`,
      ),
    index("idx_shares_project")
      .on(table.projectId)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
