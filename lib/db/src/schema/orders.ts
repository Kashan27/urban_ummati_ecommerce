import { pgTable, text, serial, boolean, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { orderStatusesTable } from "./order_statuses";
import { productsTable } from "./products";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("Canada"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  statusId: integer("status_id")
    .notNull()
    .references(() => orderStatusesTable.id)
    .default(1),
  isFreeOrder: boolean("is_free_order").notNull().default(false),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentProvider: text("payment_provider", { enum: ["stripe"] }),
  paymentStatus: text("payment_status", {
    enum: ["pending", "paid", "failed", "canceled", "refunded"],
  })
    .notNull()
    .default("pending"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt: timestamp("paid_at"),
  shipstationOrderId: text("shipstation_order_id"),
  shipstationOrderKey: text("shipstation_order_key"),
  shipstationShipmentId: text("shipstation_shipment_id"),
  shipstationShipmentStatus: text("shipstation_shipment_status"),
  shipstationTrackingNumber: text("shipstation_tracking_number"),
  shipstationCarrierCode: text("shipstation_carrier_code"),
  shipstationServiceCode: text("shipstation_service_code"),
  shipstationSyncedAt: timestamp("shipstation_synced_at"),
  shippedAt: timestamp("shipped_at"),
  notes: text("notes"),
  trackingToken: text("tracking_token").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  color: text("color"),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
  weight: numeric("weight", { precision: 10, scale: 2 }),
  length: numeric("length", { precision: 10, scale: 2 }),
  width: numeric("width", { precision: 10, scale: 2 }),
  height: numeric("height", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
