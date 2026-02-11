import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { aiActionTypeEnum, aiActionStatusEnum } from "./enums";
import { profiles } from "./profiles";
import { projects } from "./projects";

export const aiActions = pgTable(
  "ai_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    type: aiActionTypeEnum("type").notNull(),
    status: aiActionStatusEnum("status").notNull().default("pending"),
    title: text("title").notNull(),
    message: text("message"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    actedAt: timestamp("acted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_ai_actions_user_status")
      .on(table.userId, table.status)
      .where(sql`${table.status} = 'pending'`),
  ],
);
