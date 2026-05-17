import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  status: z.enum(["draft", "active"]).default("active"),
  price: z.coerce.number().positive(),
  comparePrice: z.coerce.number().optional().nullable(),
  categoryId: z.coerce.number().int().positive(),
  collectionIds: z.array(z.number().int().positive()).default([]),
  inStock: z.boolean().default(true),
  inventoryQuantity: z.coerce.number().int().min(0).optional().nullable(),
  featured: z.boolean().default(false),
  isUpsell: z.boolean().default(false),
  upsellDiscount: z.coerce.number().optional().nullable(),
  colors: z.array(z.object({ hex: z.string(), name: z.string() })).default([]),
  mainProductIds: z.array(z.number().int().positive()).default([]),
  // Dimensions for shipping
  weight: z.coerce.number().positive().optional().nullable(), // in g
  length: z.coerce.number().positive().optional().nullable(), // in in
  width: z.coerce.number().positive().optional().nullable(),  // in in
  height: z.coerce.number().positive().optional().nullable(),   // in in
});

export type ProductFormValues = z.infer<typeof productSchema>;
