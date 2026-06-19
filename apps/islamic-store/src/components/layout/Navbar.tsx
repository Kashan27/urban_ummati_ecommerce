"use client";

import { Link, usePathname, useRouter } from "@/lib/router";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

type SearchProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryName?: string | null;
  categorySlug?: string | null;
};

type SearchSuggestion =
  | { type: "product"; id: number; href: string; label: string; product: SearchProduct }
  | { type: "category"; id: string; href: string; label: string }
  | { type: "query"; id: string; href: string; label: string };

type NavbarCounts = {
  featured: number;
  collections: number;
  total: number;
};

type NavbarProps = {
  initialCategories: ApiCategory[];
  initialSettings: Record<string, string>;
  initialCounts: NavbarCounts;
};

export function Navbar({ initialCategories, initialSettings, initialCounts }: NavbarProps) {
  const { itemCount } = useCart();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [productResults, setProductResults] = useState<SearchProduct[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const searchPanelId = useMemo(
    () => `search-panel-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = searchTerm.trim();
    const nextUrl = q ? `/products?q=${encodeURIComponent(q)}` : "/products";
    if (q) {
      try {
        const raw = localStorage.getItem("noor_recent_searches");
        const current = raw ? (JSON.parse(raw) as unknown) : [];
        const list = Array.isArray(current) ? current.filter((v) => typeof v === "string") : [];
        const next = [q, ...list.filter((v) => v.toLowerCase() !== q.toLowerCase())].slice(0, 6);
        localStorage.setItem("noor_recent_searches", JSON.stringify(next));
        setRecentSearches(next);
      } catch {}
    }
    setIsSearchOpen(false);
    router.push(nextUrl);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setProductResults([]);
    setActiveIndex(0);
    setSearchLoading(false);
  };

  const query = searchTerm.trim();
  const normalizedQuery = query.toLowerCase();

  const navbarCategories = useMemo(() => {
    const items: { name: string; href: string }[] = [];

    // 1. Categories (Shop by Category)
    if (initialSettings.nav_show_categories !== "false" && initialCategories.length > 0) {
      initialCategories.forEach(cat => {
        items.push({
          name: cat.name.toUpperCase(),
          href: `/products?category=${cat.slug}`
        });
      });
    }

    // 2. New Arrivals
    /* if (settings.nav_show_new_arrivals !== "false" && counts.featured > 0) {
      items.push({ name: "NEW ARRIVALS", href: "/products?featured=true" });
    } */

    // 3. Collections
    if (initialSettings.nav_show_collections !== "false" && initialCounts.collections > 0) {
      items.push({ name: "COLLECTIONS", href: "/collections" });
    }

    // 4. All Products (with Redundancy Filter)
    const showAllProducts = initialSettings.nav_show_all_products !== "false" && initialCounts.total > 0;
    const isRedundant = initialCounts.total <= initialCounts.featured;
    
    if (showAllProducts && !isRedundant) {
      items.push({ name: "ALL PRODUCTS", href: "/products" });
    }

    return items;
  }, [initialCategories, initialSettings, initialCounts]);

  const categoryMatches = useMemo(() => {
    if (!normalizedQuery) return [];
    return navbarCategories.filter((c) => c.name.toLowerCase().includes(normalizedQuery)).slice(0, 4);
  }, [normalizedQuery, navbarCategories]);

  const suggestions: SearchSuggestion[] = useMemo(() => {
    const result: SearchSuggestion[] = [];
    if (query) {
      result.push({ type: "query", id: `q:${query}`, href: `/products?q=${encodeURIComponent(query)}`, label: query });
    }
    for (const c of categoryMatches) {
      result.push({
        type: "category",
        id: `c:${c.href}`,
        href: c.href,
        label: c.name,
      });
    }
    for (const p of productResults.slice(0, 6)) {
      result.push({
        type: "product",
        id: p.id,
        href: `/products/${p.id}`,
        label: p.name,
        product: p,
      });
    }
    return result;
  }, [categoryMatches, productResults, query]);

  useEffect(() => {
    if (!isSearchOpen) return;
    setActiveIndex(0);
    try {
      const raw = localStorage.getItem("noor_recent_searches");
      const current = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(current) ? current.filter((v) => typeof v === "string") : [];
      setRecentSearches(list.slice(0, 6));
    } catch {
      setRecentSearches([]);
    }
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    if (!query) {
      setProductResults([]);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const handle = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`/api/products?limit=200&offset=0`, {
          method: "GET",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as { products?: SearchProduct[] };
        const products = Array.isArray(data.products) ? data.products : [];
        const filtered = products
          .filter((p) => {
            const haystack = [p.name, p.description, p.categoryName ?? "", p.categorySlug ?? ""].join(" ").toLowerCase();
            return haystack.includes(normalizedQuery);
          })
          .slice(0, 8);
        if (!cancelled) setProductResults(filtered);
      } catch (err) {
        if (!cancelled) setProductResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 120);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(handle);
    };
  }, [isSearchOpen, normalizedQuery, query]);

  const highlight = (text: string, q: string) => {
    const raw = text || "";
    if (!q) return raw;
    const needle = q.toLowerCase();
    const hay = raw.toLowerCase();
    const idx = hay.indexOf(needle);
    if (idx === -1) return raw;
    const before = raw.slice(0, idx);
    const match = raw.slice(idx, idx + q.length);
    const after = raw.slice(idx + q.length);
    return (
      <>
        {before}
        <span className="font-semibold text-foreground">{match}</span>
        {after}
      </>
    );
  };

  const activateSuggestion = (s: SearchSuggestion) => {
    setIsSearchOpen(false);
    router.push(s.href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-[#fbfbf9]/95 backdrop-blur-md">
      {initialSettings.free_shipping_threshold && initialSettings.free_shipping_threshold !== "0" && (
        <div className="hidden lg:flex items-center justify-between border-b border-border/70 bg-[#f9f4ec] px-6 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Canadian Dispatch</span>
            <span className="text-border">|</span>
            <span>Free Shipping Over ${initialSettings.free_shipping_threshold}</span>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl items-center bg-[#fbfbf9] px-4 py-4 md:px-6">
        <div className="flex flex-1 items-center justify-start">
          <button
            className="rounded-md p-1.5 text-foreground md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* <div className="hidden items-center gap-4 text-sm uppercase tracking-[0.15em] text-muted-foreground md:flex">
            <Link href="/products?featured=true" className="transition-colors hover:text-foreground">
              New Arrivals
            </Link>
            {(settings.signature_art_category_slug || categories.some(c => c.slug === 'wall-art')) && (
              <>
                <span className="text-border">|</span>
                <Link 
                  href={`/products?category=${settings.signature_art_category_slug || 'wall-art'}`} 
                  className="transition-colors hover:text-foreground"
                >
                  Signature Art
                </Link>
              </>
            )}
          </div> */}
        </div>

        <div className="flex shrink-0 flex-col items-center text-center">
          <Link href="/" className="group inline-flex flex-col items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <Image 
                src="/shield.png" 
                alt="" 
                width={48} 
                height={48} 
                className="h-6 w-auto md:h-12"
                priority
              />
              <h1 className="font-serif text-xl leading-none tracking-[0.12em] text-foreground md:text-5xl md:tracking-[0.26em]">
                URBAN UMMATI
              </h1>
            </div>
            <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-muted-foreground md:text-xs md:tracking-[0.42em]">
              Modern Art. Scared Meaning
            </p>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 text-foreground/80 md:gap-4">
          <button
            className="rounded-md p-1.5 transition-colors hover:text-foreground"
            aria-label="Search"
            onClick={() => {
              setSearchTerm("");
              setIsSearchOpen(true);
            }}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link href="/cart" className="relative p-1.5 transition-colors hover:text-foreground">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {navbarCategories.length > 0 && (
        <div className="hidden border-t border-border/70 bg-[#f9f4ec] md:block">
          <nav className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4 py-3 lg:gap-2">
            {navbarCategories.map((category) => {
              const isActive = category.href === "/collections" && pathname === "/collections";
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
      )}

      {/* Rest of mobile menu and search panel remains unchanged */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background md:hidden">
          <div className="flex h-[100dvh] w-full flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div className="flex items-center gap-2">
                <Image 
                  src="/shield.png" 
                  alt="" 
                  width={32} 
                  height={32} 
                  className="h-8 w-auto"
                />
                <h2 className="font-serif text-2xl tracking-[0.22em]">URBAN UMMATI</h2>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md border border-border p-2"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 custom-scrollbar">
              <button
                className="mb-4 flex items-center justify-between rounded-md border border-border bg-white px-4 py-3 text-sm uppercase tracking-[0.16em] text-muted-foreground"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setSearchTerm("");
                  setIsSearchOpen(true);
                }}
              >
                <span>Search</span>
                <Search className="h-5 w-5" />
              </button>
              <div className="space-y-1">
                {navbarCategories.map((category) => (
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
            </div>
          </div>
        </div>
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeSearch} />
          <div className={`absolute overflow-hidden border border-border bg-background shadow-xl flex flex-col ${
            isMobile 
              ? "inset-0 z-50 h-[100dvh] w-full rounded-none border-none" 
              : "left-1/2 top-16 w-[min(860px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl max-h-[80vh]"
          }`}>
            <form onSubmit={submitSearch} className="flex items-center gap-3 border-b border-border/70 bg-background px-4 py-3">
              {isMobile && (
                <button 
                  type="button" 
                  onClick={closeSearch}
                  className="mr-1 rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search products..."
                  autoComplete="off"
                  enterKeyHint="search"
                />
              </div>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-foreground hover:bg-primary/90">
                Search
              </button>
            </form>

            {/* Search Results Dropdown */}
            <div className="flex-1 overflow-y-auto bg-background">
              {!searchTerm.trim() && recentSearches.length > 0 && (
                <div className="border-b border-border/50 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Searches</span>
                    <button 
                      onClick={() => { localStorage.removeItem("noor_recent_searches"); setRecentSearches([]); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSearchTerm(term); submitSearch({ preventDefault: () => {} } as any); }}
                        className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}

              {!searchLoading && searchTerm.trim() && suggestions.length > 0 && (
                <div className="py-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={suggestion.id}
                      onClick={() => { setSearchTerm(suggestion.label); submitSearch({ preventDefault: () => {} } as any); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      {suggestion.type === 'product' && suggestion.product && (
                        <>
                          {suggestion.product.imageUrl ? (
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                              <Image 
                                src={suggestion.product.imageUrl} 
                                alt="" 
                                fill
                                sizes="40px"
                                className="object-cover" 
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                              <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{suggestion.product.name}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.product.categoryName || 'Product'}</p>
                          </div>
                          <span className="text-sm font-semibold text-primary">${suggestion.product.price}</span>
                        </>
                      )}
                      {suggestion.type === 'category' && (
                        <>
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                            <span className="text-xs font-bold text-muted-foreground">CAT</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{suggestion.label}</p>
                            <p className="text-xs text-muted-foreground">Category</p>
                          </div>
                        </>
                      )}
                      {suggestion.type === 'query' && (
                        <>
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                            <Search className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Search for "{suggestion.label}"</p>
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!searchLoading && searchTerm.trim() && suggestions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No results found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
