import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const freeProductLinksTable = pgTable("free_product_links", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  productId: integer("product_id").notNull(),
  usedByEmail: text("used_by_email"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFreeProductLinkSchema = createInsertSchema(freeProductLinksTable).omit({ id: true, createdAt: true });
export type InsertFreeProductLink = z.infer<typeof insertFreeProductLinkSchema>;
export type FreeProductLink = typeof freeProductLinksTable.$inferSelect;
