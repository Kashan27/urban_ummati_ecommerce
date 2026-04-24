"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { setBaseUrl } from "@workspace/api-client-react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { UpsellModal } from "@/components/cart/UpsellModal";

export function AppShell({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    setBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? null);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <div className="flex min-h-[100dvh] flex-col">
            {!isAdminRoute && <Navbar />}
            {children}
            {!isAdminRoute && <Footer />}
            {!isAdminRoute && <CartDrawer />}
            {!isAdminRoute && <UpsellModal />}
          </div>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
