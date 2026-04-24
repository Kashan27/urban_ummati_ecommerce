import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., 'upsell_discount_percent', 'free_shipping_threshold'
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Setting = typeof settingsTable.$inferSelect;
export type NewSetting = typeof settingsTable.$inferInsert;
