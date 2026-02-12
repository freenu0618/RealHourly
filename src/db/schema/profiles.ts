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
  // Polar subscription
  planType: text("plan_type").notNull().default("free"), // 'free' | 'pro'
  polarCustomerId: text("polar_customer_id"),
  polarSubscriptionId: text("polar_subscription_id"),
  planExpiresAt: timestamp("plan_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
