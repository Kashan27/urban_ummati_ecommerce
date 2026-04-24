import { Link } from "@/lib/router";
import { ArrowRight, Star, ShieldCheck, Truck, Clock4, Sparkles } from "lucide-react";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/ProductCard";

const CATEGORIES = [
  { title: "Wall Art", subtitle: "Statement calligraphy pieces", img: "/product-7.png", url: "/products?category=wall-art" },
  { title: "Prayer Rugs", subtitle: "Soft textures for daily salah", img: "/product-2.png", url: "/products?category=prayer-rugs" },
  { title: "Tasbeeh", subtitle: "Elegant dhikr companions", img: "/product-3.png", url: "/products?category=tasbeeh" },
  { title: "Jewelry", subtitle: "Meaningful wearable reminders", img: "/product-6.png", url: "/products?category=jewelry" },
];

export function Home() {
  const { data: featuredData, isLoading } = useGetFeaturedProducts();

  return (
    <main className="flex-1 w-full overflow-hidden">
      <div className="border-b border-border/70 bg-primary py-2 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-primary-foreground">
        Handpicked Urban Ummati | Fast Canada-Wide Shipping
      </div>

      <section className="section-glow relative overflow-hidden border-b border-border/70 px-4 py-10 md:px-8 md:py-14">
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="editorial-card reveal-fade grain-overlay p-7 md:p-10">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Refined Ramadan Edition</p>
            <h2 className="font-serif text-4xl leading-[0.95] text-foreground md:text-6xl lg:text-7xl">
              Crafted pieces
              <span className="block text-primary">for sacred corners</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Build a prayer space that feels calm, personal, and elevated. Urban Ummati collections are designed to blend spiritual intention with modern interiors.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Shop Collection
              </Link>
              <Link
                href="/products?featured=true"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-background px-6 text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                New Arrivals
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-border/70 pt-5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Sparkles size={14} /> 100k+ happy customers</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={14} /> Premium finish</span>
            </div>
          </div>

          <div className="editorial-card reveal-fade relative min-h-[360px] overflow-hidden p-3 md:min-h-[540px]">
            <img
              src="/product-8.png"
              alt="Urban Ummati premium decor composition"
              className="h-full w-full rounded-sm object-cover object-center"
            />
            <div className="absolute inset-3 rounded-sm bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-xs uppercase tracking-[0.26em] text-white/80">Featured Drop</p>
              <h3 className="mt-2 font-serif text-3xl text-white md:text-4xl">Majlis Collection</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-[hsl(35_42%_96%)] px-4 py-8 md:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-5 w-5 text-secondary" strokeWidth={1.7} />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Shipping</p>
              <p className="font-medium">Free over $75</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-secondary" strokeWidth={1.7} />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Quality</p>
              <p className="font-medium">Crafted for long-term use</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock4 className="mt-0.5 h-5 w-5 text-secondary" strokeWidth={1.7} />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Dispatch</p>
              <p className="font-medium">Processed within 24 hours</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Browse</p>
              <h2 className="mt-2 font-serif text-4xl md:text-5xl">Shop by Category</h2>
            </div>
            <Link href="/products" className="hidden text-xs uppercase tracking-[0.16em] text-primary transition-colors hover:text-secondary md:inline-flex">
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.title} href={cat.url} className="editorial-card group block overflow-hidden p-3">
                <div className="relative h-64 overflow-hidden rounded-sm">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                </div>
                <div className="px-2 pb-1 pt-4">
                  <h3 className="font-serif text-2xl">{cat.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.subtitle}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-primary">
                    Explore <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-[hsl(35_40%_95%)] px-4 py-20 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Editors Picks</p>
              <h2 className="mt-2 font-serif text-4xl md:text-5xl">Best Seller Designs</h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-primary transition-colors hover:text-secondary"
            >
              View Full Catalog <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square w-full bg-muted" />
                  <div className="mt-4 h-4 w-3/4 bg-muted" />
                  <div className="mt-2 h-4 w-1/2 bg-muted" />
                </div>
              ))}
            </div>
          ) : featuredData?.products ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredData.products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">No products available at the moment.</div>
          )}
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="editorial-card p-8 text-center md:p-12">
            <div className="mb-5 flex justify-center gap-1 text-accent-foreground">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={18} className="fill-secondary text-secondary" />
              ))}
            </div>
            <p className="font-serif text-3xl leading-tight md:text-5xl">
              "The Ayatul Kursi wall art transformed our living room. The craftsmanship feels premium and the space now has a calm, welcoming energy."
            </p>
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Aisha M.</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">Toronto, ON</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
