import { Link, useLocation } from "@/lib/router";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";

const CATEGORIES = [
  { name: "WALL ART", href: "/products?category=wall-art" },
  { name: "PRAYER RUGS", href: "/products?category=prayer-rugs" },
  { name: "TASBEEH", href: "/products?category=tasbeeh" },
  { name: "JEWELRY", href: "/products?category=jewelry" },
  { name: "NEW ARRIVALS", href: "/products?featured=true" },
  { name: "ALL PRODUCTS", href: "/products" },
];

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

export function Navbar() {
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [productResults, setProductResults] = useState<SearchProduct[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
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
    setLocation(nextUrl);
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

  const categoryMatches = useMemo(() => {
    if (!normalizedQuery) return [];
    return CATEGORIES.filter((c) => c.name.toLowerCase().includes(normalizedQuery)).slice(0, 4);
  }, [normalizedQuery]);

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
            const haystack = [
              p.name,
              p.description,
              p.categoryName ?? "",
              p.categorySlug ?? "",
            ]
              .join(" ")
              .toLowerCase();

            return haystack.includes(normalizedQuery);
          })
          .slice(0, 8);

        if (!cancelled) setProductResults(filtered);
      } catch (err) {
        if (!cancelled) setProductResults([]);
        if (err instanceof DOMException && err.name === "AbortError") return;
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
    setLocation(s.href);
  };

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
            className="rounded-md border border-transparent p-2 transition-colors hover:border-border hover:text-foreground"
            aria-label="Search"
            onClick={() => {
              setSearchTerm("");
              setIsSearchOpen(true);
            }}
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

      {isSearchOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeSearch}
          />
          <div className="absolute left-1/2 top-16 w-[min(860px,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
            <form
              onSubmit={submitSearch}
              className="flex items-center gap-3 border-b border-border/70 bg-background px-4 py-4"
            >
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-white px-4 py-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      closeSearch();
                      return;
                    }

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveIndex((v) => Math.min(v + 1, Math.max(0, suggestions.length - 1)));
                      return;
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex((v) => Math.max(v - 1, 0));
                      return;
                    }

                    if (e.key === "Enter") {
                      const s = suggestions[activeIndex];
                      if (s) {
                        e.preventDefault();
                        activateSuggestion(s);
                      }
                    }
                  }}
                  className="w-full bg-transparent text-base outline-none"
                  placeholder="Search products, categories..."
                  role="combobox"
                  aria-expanded
                  aria-controls={searchPanelId}
                  aria-autocomplete="list"
                  autoComplete="off"
                />
                {searchLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground/70" />
                ) : searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setProductResults([]);
                      setActiveIndex(0);
                      searchInputRef.current?.focus();
                    }}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeSearch}
                className="rounded-xl border border-border px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90"
              >
                Search
              </button>
            </form>

            <div id={searchPanelId} className="grid grid-cols-1 gap-0 md:grid-cols-12">
              <div className="border-b border-border/70 px-4 py-4 md:col-span-4 md:border-b-0 md:border-r md:px-6">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Quick Links
                </div>

                {!query ? (
                  <>
                    {recentSearches.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Recent
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                setSearchTerm(r);
                                setActiveIndex(0);
                                searchInputRef.current?.focus();
                              }}
                              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-foreground/80 hover:bg-muted"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Popular
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["Wall art", "Prayer rugs", "Tasbeeh", "Jewelry", "Gift", "New arrivals"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              setSearchTerm(p);
                              setActiveIndex(0);
                              searchInputRef.current?.focus();
                            }}
                            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-foreground/80 hover:bg-muted"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 space-y-2">
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Categories
                    </div>
                    <div className="space-y-2">
                      {categoryMatches.length > 0 ? (
                        categoryMatches.map((c) => (
                          <button
                            key={c.href}
                            type="button"
                            onClick={() =>
                              activateSuggestion({
                                type: "category",
                                id: `c:${c.href}`,
                                href: c.href,
                                label: c.name,
                              })
                            }
                            className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-left text-sm hover:bg-muted"
                          >
                            <span className="text-foreground">{highlight(c.name, query)}</span>
                            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">View</span>
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No category matches</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-4 md:col-span-8 md:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Results
                  </div>
                  {query && (
                    <button
                      type="button"
                      className="text-xs font-medium uppercase tracking-[0.18em] text-primary hover:text-primary/80"
                      onClick={() => activateSuggestion({ type: "query", id: `q:${query}`, href: `/products?q=${encodeURIComponent(query)}`, label: query })}
                    >
                      View all
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {query && suggestions.length === 0 && !searchLoading ? (
                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                      No results. Try a different keyword.
                    </div>
                  ) : (
                    suggestions.map((s, idx) => {
                      const isActive = idx === activeIndex;
                      if (s.type === "product") {
                        const meta = [s.product.categoryName, s.product.categorySlug]
                          .filter(Boolean)
                          .join(" • ");
                        return (
                          <button
                            key={`${s.type}:${s.id}`}
                            type="button"
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => activateSuggestion(s)}
                            className={`flex w-full items-center gap-4 rounded-xl border px-3 py-2 text-left transition-colors ${
                              isActive ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-muted"
                            }`}
                          >
                            <div className="h-14 w-14 overflow-hidden rounded-lg bg-muted">
                              <img
                                src={s.product.imageUrl || "/product-1.png"}
                                alt={s.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm text-foreground">{highlight(s.product.name, query)}</div>
                              <div className="truncate text-xs text-muted-foreground">
                                {meta ? highlight(meta, query) : "Product"}
                              </div>
                            </div>
                            <div className="shrink-0 text-sm font-semibold text-foreground">
                              ${Number(s.product.price).toFixed(2)}
                            </div>
                          </button>
                        );
                      }

                      if (s.type === "category") {
                        return (
                          <button
                            key={`${s.type}:${s.id}`}
                            type="button"
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => activateSuggestion(s)}
                            className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition-colors ${
                              isActive ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-muted"
                            }`}
                          >
                            <span className="text-sm text-foreground">{highlight(s.label, query)}</span>
                            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Category</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={`${s.type}:${s.id}`}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => activateSuggestion(s)}
                          className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition-colors ${
                            isActive ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-muted"
                          }`}
                        >
                          <span className="text-sm text-foreground">{highlight(s.label, query)}</span>
                          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Search</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
