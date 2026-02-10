import { pgEnum } from "drizzle-orm/pg-core";

export const projectCurrencyEnum = pgEnum("project_currency", [
  "USD",
  "KRW",
  "EUR",
  "GBP",
  "JPY",
]);

export const timeCategoryEnum = pgEnum("time_category", [
  "planning",
  "design",
  "development",
  "meeting",
  "revision",
  "admin",
  "email",
  "research",
  "other",
]);

export const timeIntentEnum = pgEnum("time_intent", ["done", "planned"]);

export const costTypeEnum = pgEnum("cost_type", [
  "platform_fee",
  "tax",
  "tool",
  "contractor",
  "misc",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "scope_rule1",
  "scope_rule2",
  "scope_rule3",
  "scope_rule4",
]);

export const messageToneEnum = pgEnum("message_tone", [
  "polite",
  "neutral",
  "firm",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "completed",
  "paused",
  "cancelled",
]);
