import { Package, ShoppingBag, Users, Link as LinkIcon, Tag, Settings, Layers } from "lucide-react";
import type { AdminNavItem } from "./types";

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: Users },
  {
    key: "products",
    label: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { key: "products-all", label: "All Products", href: "/admin/products" },
      { key: "products-new", label: "Add Product", href: "/admin/products#add" },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    href: "/admin/categories",
    icon: Tag,
    children: [
      { key: "categories-all", label: "All Categories", href: "/admin/categories" },
      { key: "categories-new", label: "Add Category", href: "/admin/categories#new" },
    ],
  },
  {
    key: "collections",
    label: "Collections",
    href: "/admin/collections",
    icon: Layers,
    children: [
      { key: "collections-all", label: "All Collections", href: "/admin/collections" },
      { key: "collections-new", label: "Add Collection", href: "/admin/collections#new" },
    ],
  },
  {
    key: "orders",
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    children: [
      { key: "orders-all", label: "All Orders", href: "/admin/orders" },
      { key: "orders-received", label: "Received", href: "/admin/orders?status=received" },
      { key: "orders-processed", label: "Processed", href: "/admin/orders?status=processed" },
      { key: "orders-shipped", label: "Shipped", href: "/admin/orders?status=shipped" },
    ],
  },
  { key: "promo", label: "Free Links", href: "/admin/promo", icon: LinkIcon },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
];
