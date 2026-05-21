import { useEffect, useState } from "react";
import { Link, useParams } from "@/lib/router";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@workspace/api-client-react";

type Collection = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
};

export function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const response = await fetch(`/api/collections/${encodeURIComponent(slug)}/products?limit=120&offset=0`, {
          method: "GET",
        });
        if (response.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!response.ok) throw new Error("Failed to load collection");
        const data = (await response.json()) as {
          collection?: Collection;
          products?: Product[];
        };
        if (!cancelled) {
          setCollection(data.collection ?? null);
          setProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch {
        if (!cancelled) {
          setCollection(null);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return (
      <main className="flex-1 w-full pt-10 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center py-20 bg-white border border-border">
            <h3 className="font-serif text-2xl mb-2">Collection not found</h3>
            <p className="font-sans text-muted-foreground mb-6">
              This collection may have been removed or is currently inactive.
            </p>
            <Link
              href="/collections"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 font-sans uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
            >
              Back to Collections
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full pb-24">
      {/* Header Banner */}
      {collection?.imageUrl ? (
        <div className="relative w-full h-[300px] md:h-[400px] mb-12">
          <img 
            src={collection.imageUrl} 
            alt={collection.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-4">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl md:text-6xl text-white mb-4 uppercase tracking-tight">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-white/90 text-lg md:text-xl font-sans max-w-2xl mx-auto leading-relaxed">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 mb-10">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            <Link href="/collections" className="hover:text-foreground">
              Collections
            </Link>{" "}
            / {collection?.name ?? slug}
          </div>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl text-foreground">
            {collection?.name ?? "Collection"}
          </h1>
          {collection?.description && (
            <p className="mt-4 text-muted-foreground text-lg max-w-3xl font-sans leading-relaxed">
              {collection.description}
            </p>
          )}
          <div className="mt-4 w-16 h-0.5 bg-secondary"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-square w-full mb-4"></div>
                <div className="h-4 bg-muted w-3/4 mb-2"></div>
                <div className="h-4 bg-muted w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-border">
            <h3 className="font-serif text-2xl mb-2">No products yet</h3>
            <p className="font-sans text-muted-foreground">
              Products will appear here once assigned to this collection in the admin.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
