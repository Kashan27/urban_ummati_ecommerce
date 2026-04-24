import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const orderStatusesTable = pgTable("order_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., 'received', 'processed', 'shipped'
});

export type OrderStatus = typeof orderStatusesTable.$inferSelect;
export type NewOrderStatus = typeof orderStatusesTable.$inferInsert;
