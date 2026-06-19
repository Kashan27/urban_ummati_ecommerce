"use client";
import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { UpsellModal } from "@/components/cart/UpsellModal";
import { ClientProviders } from "@/components/layout/ClientProviders";

type AppShellProps = {
  children: ReactNode;
  navbarData: {
    categories: Array<{
      id: number;
      name: string;
      slug: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string | null;
    }>;
    settings: Record<string, string>;
    counts: {
      featured: number;
      collections: number;
      total: number;
    };
  };
};

export function AppShell({ children, navbarData }: AppShellProps) {
  return (
    <ClientProviders>
      <div className="flex min-h-[100dvh] flex-col">
        <Navbar
          initialCategories={navbarData.categories}
          initialSettings={navbarData.settings}
          initialCounts={navbarData.counts}
        />
        <main className="flex-1 bg-[]">{children}</main>
        <Footer />
        <CartDrawer />
        <UpsellModal />
      </div>
    </ClientProviders>
  );
}
