import { useEffect, useState } from "react";
import { Link } from "@/lib/router";

type Collection = {
  id: number;
  name: string;
  slug: string;
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
    <main className="flex-1 w-full bg-background pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Collections</h1>
          <div className="w-16 h-0.5 bg-secondary mx-auto mb-6"></div>
          <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
            Explore curated sets of products.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-6">
                <div className="h-5 w-2/3 bg-muted mb-2"></div>
                <div className="h-4 w-1/3 bg-muted"></div>
              </div>
            ))}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-muted/30"
              >
                <div className="font-serif text-xl text-foreground">{collection.name}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  View products
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-border">
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

