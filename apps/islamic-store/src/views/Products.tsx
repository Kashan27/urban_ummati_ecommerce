import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "@/lib/router";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Filter, Check, Search, X } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

const SORTS = [
  { id: "newest", label: "New Arrivals" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  // { id: "rating", label: "Top Rated" }
];

export function Products() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const [, setLocation] = useLocation();
  
  // Read params from URL
  const categoryParam = searchParams.get("category");
  const featuredParam = searchParams.get("featured");
  const queryParam = searchParams.get("q");
  
  const [activeCategory, setActiveCategory] = useState(categoryParam || "");
  const [activeSort, setActiveSort] = useState("newest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(queryParam || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    setSearchTerm(queryParam || "");
  }, [queryParam]);

  useEffect(() => {
    setActiveCategory(categoryParam || "");
  }, [categoryParam]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const pushFiltersToUrl = (nextCategory: string, nextSearchTerm: string) => {
    const newParams = new URLSearchParams();

    if (nextCategory) newParams.set("category", nextCategory);
    if (featuredParam) newParams.set("featured", featuredParam);
    if (nextSearchTerm.trim()) newParams.set("q", nextSearchTerm.trim());

    const nextUrl = newParams.toString() ? `/products?${newParams.toString()}` : "/products";
    setLocation(nextUrl);
  };

  // Fetch products
  const { data, isLoading } = useListProducts(
    { 
      category: activeCategory || undefined,
      featured: featuredParam === "true" ? true : undefined,
      limit: 100 // fetch more to allow client-side sorting
    },
    {
      query: {
        queryKey: getListProductsQueryKey({ 
          category: activeCategory || undefined,
          featured: featuredParam === "true" ? true : undefined,
          limit: 100
        })
      }
    }
  );

  // Apply client-side sorting
  const sortedProducts = useMemo(() => {
    if (!data?.products) return [];
    
    const query = searchTerm.trim().toLowerCase();
    const products = query
      ? data.products.filter((p) => {
          const searchable = [
            p.name,
            p.description,
            p.categoryName,
            p.categorySlug,
            p.category,
            ...(p.colors || []),
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(query);
        })
      : [...data.products];
    
    switch (activeSort) {
      case "price-asc":
        return products.sort((a, b) => a.price - b.price);
      case "price-desc":
        return products.sort((a, b) => b.price - a.price);
      case "rating":
        return products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "newest":
      default:
        // Assume ID represents recency or use createdAt if available
        return products.sort((a, b) => b.id - a.id);
    }
  }, [data?.products, activeSort, searchTerm]);

  // Update URL when category changes (without page reload)
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    pushFiltersToUrl(catId, searchTerm);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    pushFiltersToUrl(activeCategory, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    pushFiltersToUrl(activeCategory, "");
  };

  return (
    <main className="flex-1 w-full pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            {featuredParam === "true" ? "New Arrivals" : 
             activeCategory ? categories.find(c => c.slug === activeCategory)?.name : 
             "All Products"}
          </h1>
          <div className="w-16 h-0.5 bg-secondary mx-auto mb-6"></div>
          <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
            Discover our collection of premium Islamic decor, carefully curated to bring beauty, peace, and spiritual connection to your home.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name, category, or color"
                className="w-full h-12 border border-border bg-white pl-11 pr-24 text-sm outline-none focus:border-primary transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 px-4 text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-6 py-4 border-y border-border">
          <button 
            className="flex items-center gap-2 font-sans uppercase tracking-wider text-sm font-bold"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <Filter size={16} /> Filters & Sort
          </button>
          <span className="font-sans text-sm text-muted-foreground">
            {sortedProducts.length} Products
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Sidebar / Filters (Desktop) */}
          <aside className={`w-full md:w-64 shrink-0 ${isMobileFiltersOpen ? 'block mb-8' : 'hidden md:block'}`}>
            <div className="sticky top-24 space-y-10">
              
              {/* Categories */}
              <div>
                <h3 className="font-serif text-xl mb-4 border-b border-border pb-2">Categories</h3>
                <ul className="space-y-3">
                  {/* "All Products" option */}
                  <li key="all">
                    <button
                      onClick={() => handleCategoryChange("")}
                      className={`font-sans text-sm flex items-center justify-between w-full text-left transition-colors ${
                        activeCategory === "" 
                          ? "text-primary font-bold" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All Products
                      {activeCategory === "" && <Check size={14} />}
                    </button>
                  </li>
                  
                  {/* Categories from API */}
                  {isLoadingCategories ? (
                    <li className="animate-pulse">
                      <div className="h-4 bg-muted w-3/4"></div>
                    </li>
                  ) : categories.map(category => (
                    <li key={category.id}>
                      <button
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`font-sans text-sm flex items-center justify-between w-full text-left transition-colors ${
                          activeCategory === category.slug 
                            ? "text-primary font-bold" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {category.name}
                        {activeCategory === category.slug && <Check size={14} />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-serif text-xl mb-4 border-b border-border pb-2">Sort By</h3>
                <ul className="space-y-3">
                  {SORTS.map(sort => (
                    <li key={sort.id}>
                      <button
                        onClick={() => setActiveSort(sort.id)}
                        className={`font-sans text-sm flex items-center justify-between w-full text-left transition-colors ${
                          activeSort === sort.id 
                            ? "text-primary font-bold" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {sort.label}
                        {activeSort === sort.id && <Check size={14} />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Desktop Top Bar */}
            <div className="hidden md:flex justify-between items-center mb-8 pb-4 border-b border-border">
              <span className="font-sans text-sm text-muted-foreground uppercase tracking-widest">
                Showing {sortedProducts.length} Results
              </span>
              {searchTerm.trim() && (
                <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">
                  Search: "{searchTerm.trim()}"
                </span>
              )}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted aspect-square w-full mb-4"></div>
                    <div className="h-4 bg-muted w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-10">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-border">
                <h3 className="font-serif text-2xl mb-2">No products found</h3>
                <p className="font-sans text-muted-foreground mb-6">
                  We couldn't find any products matching your filters{searchTerm.trim() ? ` and search "${searchTerm.trim()}"` : ""}.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setActiveCategory("");
                      setActiveSort("newest");
                      setSearchTerm("");
                      pushFiltersToUrl("", "");
                    }}
                    className="bg-primary text-primary-foreground px-6 py-3 font-sans uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
