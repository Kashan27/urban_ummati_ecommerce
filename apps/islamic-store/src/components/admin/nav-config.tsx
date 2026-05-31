import { Package, ShoppingBag, Link as LinkIcon, Tag, Settings, Layers, LayoutDashboard, Gift, Users } from "lucide-react";
import type { AdminNavItem } from "./types";

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", href: "/admin/products", icon: Package },
  { key: "categories", label: "Categories", href: "/admin/categories", icon: Tag },
  { key: "collections", label: "Collections", href: "/admin/collections", icon: Layers },
  { key: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { key: "promo", label: "Free Links", href: "/admin/promo", icon: Gift },
  { key: "upsells", label: "Upsells", href: "/admin/upsells", icon: Tag },
  { key: "admins", label: "Admins", href: "/admin/admins", icon: Users },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
];
