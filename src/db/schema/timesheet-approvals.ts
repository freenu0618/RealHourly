import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { timesheets } from "./timesheets";

export const timesheetApprovals = pgTable(
  "timesheet_approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timesheetId: uuid("timesheet_id")
      .notNull()
      .references(() => timesheets.id),
    action: text("action").notNull(), // 'approved' | 'rejected'
    reviewerEmail: text("reviewer_email"),
    reviewerToken: uuid("reviewer_token").notNull().defaultRandom(),
    note: text("note"),
    actedAt: timestamp("acted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_approval_timesheet").on(table.timesheetId),
    index("idx_approval_token").on(table.reviewerToken),
  ],
);
