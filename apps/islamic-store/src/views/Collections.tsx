import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

type Collection = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
};

export function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/collections", { method: "GET" });
        if (!response.ok) throw new Error("Failed to load collections");
        const data = (await response.json()) as { collections?: Collection[] };
        const list = Array.isArray(data.collections) ? data.collections : [];
        if (!cancelled) setCollections(list);
      } catch {
        if (!cancelled) setCollections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex-1 w-full pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 uppercase tracking-tight">Collections</h1>
          <div className="w-16 h-0.5 bg-secondary mx-auto mb-6"></div>
          <p className="font-sans text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Curated selections of fine Islamic products for every occasion.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-[4/3] w-full rounded-sm mb-4"></div>
                <div className="h-6 w-2/3 bg-muted mb-2"></div>
                <div className="h-4 w-full bg-muted"></div>
              </div>
            ))}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group block"
              >
                <div className="aspect-[4/3] w-full bg-muted rounded-sm overflow-hidden mb-5 border border-border relative">
                  {collection.imageUrl ? (
                    <img 
                      src={collection.imageUrl} 
                      alt={collection.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50 uppercase tracking-widest text-[10px]">
                      {collection.name}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
                <h2 className="font-serif text-2xl text-foreground mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">
                  {collection.name}
                </h2>
                {collection.description && (
                  <p className="font-sans text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {collection.description}
                  </p>
                )}
                <div className="mt-4 flex items-center text-xs font-sans uppercase tracking-[0.2em] font-medium text-primary">
                  View Collection
                  <div className="ml-2 w-4 h-px bg-primary transform origin-left transition-transform duration-300 scale-x-50 group-hover:scale-x-100" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-border rounded-sm">
            <h3 className="font-serif text-2xl mb-2">No collections yet</h3>
            <p className="font-sans text-muted-foreground">
              Collections will appear here once they are created in the admin.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
