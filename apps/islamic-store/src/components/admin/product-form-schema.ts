import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  status: z.enum(["draft", "active"]).default("active"),
  price: z.coerce.number().positive(),
  comparePrice: z.coerce.number().optional().nullable(),
  categoryId: z.coerce.number().int().positive(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  isUpsell: z.boolean().default(false),
  upsellDiscount: z.coerce.number().optional().nullable(),
  colors: z.string().default(""),
});

export type ProductFormValues = z.infer<typeof productSchema>;
