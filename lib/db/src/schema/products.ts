import { pgTable, text, serial, boolean, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["draft", "active", "archived"] }).notNull().default("active"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  imageUrl: text("image_url").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  inventoryQuantity: integer("inventory_quantity"),
  totalSold: integer("total_sold").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  isUpsell: boolean("is_upsell").notNull().default(false),
  upsellDiscount: numeric("upsell_discount", { precision: 5, scale: 2 }),
  reviewCount: integer("review_count").notNull().default(0),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.8"),
  weight: numeric("weight", { precision: 10, scale: 2 }), // in g
  length: numeric("length", { precision: 10, scale: 2 }), // in in
  width: numeric("width", { precision: 10, scale: 2 }),   // in in
  height: numeric("height", { precision: 10, scale: 2 }),  // in in
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productImagesTable = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productColorsTable = pgTable("product_colors", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  hex: text("hex").notNull(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
