import type { ComponentType, SVGProps } from "react";

export type AdminSection =
  | "dashboard"
  | "products"
  | "categories"
  | "collections"
  | "orders"
  | "promo"
  | "settings";

export type AdminProduct = {
  id: number;
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  price: number;
  comparePrice: number | null;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  category: string | null;
  imageUrl: string;
  images: string[];
  inStock: boolean;
  inventoryQuantity: number | null;
  totalSold: number;
  featured: boolean;
  isUpsell: boolean;
  upsellDiscount: number | null;
  colors: string[];
  mainProductIds?: number[];
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminCollection = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminNavItem = {
  key: AdminSection;
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children?: Array<{
    key: string;
    label: string;
    href: string;
  }>;
};
