import { Link, useLocation } from "@/lib/router";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

const CATEGORIES = [
  { name: "WALL ART", href: "/products?category=wall-art" },
  { name: "PRAYER RUGS", href: "/products?category=prayer-rugs" },
  { name: "TASBEEH", href: "/products?category=tasbeeh" },
  { name: "JEWELRY", href: "/products?category=jewelry" },
  { name: "NEW ARRIVALS", href: "/products?featured=true" },
  { name: "ALL PRODUCTS", href: "/products" },
];

export function Navbar() {
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="hidden lg:flex items-center justify-between border-b border-border/70 px-6 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Canadian Dispatch</span>
          <span className="text-border">|</span>
          <span>Free Shipping Over $75</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/about" className="transition-colors hover:text-foreground">About</Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link>
          <Link href="/reviews" className="transition-colors hover:text-foreground">Reviews</Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            className="rounded-md border border-border/80 p-2 text-foreground md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden items-center gap-4 text-sm uppercase tracking-[0.15em] text-muted-foreground md:flex">
            <Link href="/products?featured=true" className="transition-colors hover:text-foreground">
              New Arrivals
            </Link>
            <span className="text-border">|</span>
            <Link href="/products?category=wall-art" className="transition-colors hover:text-foreground">
              Signature Art
            </Link>
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-center text-center">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl leading-none tracking-[0.26em] text-foreground md:text-5xl">
              URBAN UMMATI
            </h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.42em] text-muted-foreground md:text-xs">
              Urban Ummati
            </p>
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-foreground/80 md:gap-4">
          <button
            className="hidden rounded-md border border-transparent p-2 transition-colors hover:border-border hover:text-foreground md:block"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="hidden rounded-md border border-transparent p-2 transition-colors hover:border-border hover:text-foreground md:block"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </button>
          <Link href="/cart" className="relative rounded-md border border-transparent p-2 transition-colors hover:border-border hover:text-foreground">
            <ShoppingBag className="h-6 w-6 md:h-5 md:w-5" />
            <span className="sr-only">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="hidden border-t border-border/70 md:block">
        <nav className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4 py-3 lg:gap-2">
          {CATEGORIES.map((category) => {
            const isActive = location === category.href;
            return (
              <Link
                key={category.name}
                href={category.href}
                className={`rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.15em] transition-all lg:text-xs ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden">
          <div className="mx-auto flex h-full w-full max-w-lg flex-col border-l border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <h2 className="font-serif text-2xl tracking-[0.22em]">URBAN UMMATI</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md border border-border p-2"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
              <div className="space-y-1">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block rounded-md px-3 py-3 text-sm uppercase tracking-[0.16em] text-foreground hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              <div className="mt-8 space-y-3 border-t border-border/70 pt-6 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-1">
                  About Us
                </Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-1">
                  Contact Us
                </Link>
                <Link href="/reviews" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-1">
                  Customer Reviews
                </Link>
              </div>
            </div>
          {itemCount > 0 && (
            <div className="mx-4 mb-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Cart items: {itemCount}
            </div>
          )}
          </div>
        </div>
      )}
    </header>
  );
}
