import { pgTable, uuid, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const usageCounts = pgTable(
  "usage_counts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    feature: text("feature").notNull(), // 'nlp_parse' | 'ai_chat'
    period: text("period").notNull(), // 'YYYY-MM' format
    count: integer("count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("uq_usage_user_feature_period").on(t.userId, t.feature, t.period)],
);
