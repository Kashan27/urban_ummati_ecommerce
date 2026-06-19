// apps/islamic-store/src/components/layout/AppShell.tsx
"use client";
import { Suspense, useEffect, useState, type ReactNode } from "react";
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

// ─── Tiny child component — isolates usePathname() here only ─────────────────
function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isTrackingRoute = pathname?.startsWith("/tracking");
  const isPlainLayout = isAdminRoute || isTrackingRoute;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {!isPlainLayout && <Navbar />}
      <main className="flex-1 bg-[]">{children}</main>
      {!isPlainLayout && <Footer />}
      {!isPlainLayout && <CartDrawer />}
      {!isPlainLayout && <UpsellModal />}
    </div>
  );
}

// ─── Outer shell — NO hooks that trigger SSR bailout ─────────────────────────
export function AppShell({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    setBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? null);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Suspense fallback={null}>
            <LayoutShell>{children}</LayoutShell>
          </Suspense>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
