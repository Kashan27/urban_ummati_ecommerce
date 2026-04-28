import { pgTable, serial, integer, timestamp, unique, boolean } from "drizzle-orm/pg-core";
import { productsTable } from "./products";
import { collectionsTable } from "./collections";

export const productCollectionsTable = pgTable(
  "product_collections",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collectionsTable.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    uniqProductCollection: unique().on(t.productId, t.collectionId),
  }),
);
