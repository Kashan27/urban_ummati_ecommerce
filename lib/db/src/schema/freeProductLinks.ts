import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const freeProductLinksTable = pgTable("free_product_links", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  productId: integer("product_id").notNull(),
  status: text("status").notNull().default("active"), // active, disabled, archived
  type: text("type").notNull().default("single-use"), // single-use, multi-use, time-limited
  usageLimit: integer("usage_limit").notNull().default(1),
  currentUsage: integer("current_usage").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  notes: text("notes"),
  usedByEmail: text("used_by_email"), // Legacy/Fallback for single-use
  usedAt: timestamp("used_at"),       // Legacy/Fallback for single-use
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFreeProductLinkSchema = createInsertSchema(freeProductLinksTable).omit({ id: true, createdAt: true });
export type InsertFreeProductLink = z.infer<typeof insertFreeProductLinkSchema>;
export type FreeProductLink = typeof freeProductLinksTable.$inferSelect;
