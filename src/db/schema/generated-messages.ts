import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { messageToneEnum } from "./enums";
import { alerts } from "./alerts";

export const generatedMessages = pgTable(
  "generated_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    alertId: uuid("alert_id")
      .notNull()
      .references(() => alerts.id),
    tone: messageToneEnum("tone").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    copiedAt: timestamp("copied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_messages_alert")
      .on(table.alertId, table.tone)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
