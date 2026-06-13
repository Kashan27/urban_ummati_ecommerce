"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@workspace/api-client-react";
type CollectionProductsSectionProps = {
  collectionSlug: string;
  collectionName: string;
  limit?: number;
  initialProducts?: Product[];
};

export function CollectionProductsSection({
  collectionSlug,
  collectionName,
  limit = 4,
  initialProducts,
}: CollectionProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProducts) return;
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/collections/${collectionSlug}/products?limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching collection products:", err);
        setError("Failed to load products");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [collectionSlug, limit]);

  if (isLoading) {
    return (
      <section className="border-y border-border/70 bg-[hsl(35_40%_95%)] px-4 py-12 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured Collection</p>
            <h2 className="mt-2 font-serif text-2xl md:text-4xl lg:text-5xl">{collectionName}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full bg-muted" />
                <div className="mt-4 h-4 w-3/4 bg-muted" />
                <div className="mt-2 h-4 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    // Debug: Show error state instead of hiding
    return (
      <section className="border-y border-border/70 bg-[hsl(35_40%_95%)] px-4 py-12 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured Collection</p>
            <h2 className="mt-2 font-serif text-2xl md:text-4xl lg:text-5xl">{collectionName}</h2>
          </div>
          <div className="p-8 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg">
            {error ? (
              <>
                <p className="text-destructive font-medium mb-2">Error loading products</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground font-medium mb-2">No products found</p>
                <p className="text-sm text-muted-foreground/70">
                  Collection "{collectionName}" has no products assigned to it.
                </p>
              </>
            )}
            <div className="mt-4 text-xs text-muted-foreground/50">
              Debug: {collectionSlug} | Error: {error || 'none'} | Products: {products.length}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-border/70 bg-[hsl(35_40%_95%)] px-4 py-12 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured Collection</p>
            <h2 className="mt-2 font-serif text-2xl md:text-4xl lg:text-5xl">{collectionName}</h2>
          </div>
          <Link
            href={`/collections/${collectionSlug}`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-primary transition-colors hover:text-secondary"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
