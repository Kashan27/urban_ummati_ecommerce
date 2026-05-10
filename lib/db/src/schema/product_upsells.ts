import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { productsTable } from "./products";

export const productUpsellsTable = pgTable(
  "product_upsells",
  {
    id: serial("id").primaryKey(),
    mainProductId: integer("main_product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    upsellProductId: integer("upsell_product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    uniqUpsell: unique().on(t.mainProductId, t.upsellProductId),
  }),
);
