import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  claimedAt: text("claimed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(),
  stage: integer("stage"),
  title: text("title").notNull(),
  reportDate: text("report_date").notNull(),
  cumulativeDays: integer("cumulative_days").notNull(),
  summary: text("summary").notNull().default(""),
  completed: text("completed").notNull().default(""),
  changes: text("changes").notNull().default(""),
  pendingItems: text("pending_items").notNull().default(""),
  nextGoal: text("next_goal").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  version: integer("version").notNull().default(1),
  createdByEmail: text("created_by_email").notNull(),
  createdByName: text("created_by_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  objectKey: text("object_key").notNull().unique(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  category: text("category").notNull().default("detail"),
  caption: text("caption").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const confirmations = sqliteTable("confirmations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  reportVersion: integer("report_version").notNull(),
  decision: text("decision").notNull(),
  comment: text("comment").notNull().default(""),
  confirmerName: text("confirmer_name").notNull(),
  confirmerEmail: text("confirmer_email").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Report = typeof reports.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
export type Confirmation = typeof confirmations.$inferSelect;
