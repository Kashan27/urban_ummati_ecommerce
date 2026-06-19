"use client";
import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { UpsellModal } from "@/components/cart/UpsellModal";
import { ClientProviders } from "@/components/layout/ClientProviders";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <div className="flex min-h-[100dvh] flex-col">
        <Navbar />
        <main className="flex-1 bg-[]">{children}</main>
        <Footer />
        <CartDrawer />
        <UpsellModal />
      </div>
    </ClientProviders>
  );
}
