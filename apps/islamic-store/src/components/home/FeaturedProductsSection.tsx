"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@workspace/api-client-react";

type FeaturedProductsSectionProps = {
  title?: string;
  limit?: number;
};

export function FeaturedProductsSection({
  title = "Our Products",
  limit = 8,
}: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all active products
        const response = await fetch(`/api/products?limit=${limit}&status=active`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Failed to load products");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  if (isLoading) {
    return (
      <section className="px-4 py-12 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured</p>
            <h2 className="mt-2 font-serif text-2xl md:text-4xl lg:text-5xl">{title}</h2>
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
    return null;
  }

  return (
    <section className="px-4 py-12 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured</p>
            <h2 className="mt-2 font-serif text-2xl md:text-4xl lg:text-5xl">{title}</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-primary transition-colors hover:text-secondary"
          >
            View All Products <ArrowRight size={14} />
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
