import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";
import { freeProductLinksTable } from "./freeProductLinks";

export const freeProductRedemptionsTable = pgTable("free_product_redemptions", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id")
    .notNull()
    .references(() => freeProductLinksTable.id),
  email: text("email").notNull(),
  orderId: integer("order_id").references(() => ordersTable.id),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});

export const insertFreeProductRedemptionSchema = createInsertSchema(freeProductRedemptionsTable).omit({
  id: true,
  usedAt: true,
});
export type InsertFreeProductRedemption = z.infer<typeof insertFreeProductRedemptionSchema>;
export type FreeProductRedemption = typeof freeProductRedemptionsTable.$inferSelect;
