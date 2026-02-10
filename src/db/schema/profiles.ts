import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { projectCurrencyEnum } from "./enums";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: text("display_name"),
  defaultCurrency: projectCurrencyEnum("default_currency")
    .notNull()
    .default("USD"),
  hourlyGoal: integer("hourly_goal"),
  timezone: text("timezone").notNull().default("Asia/Seoul"),
  locale: text("locale").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
