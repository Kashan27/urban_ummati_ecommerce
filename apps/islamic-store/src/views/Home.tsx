"use client";

import { Link } from "@/lib/router";
import { ArrowRight, Star, ShieldCheck, Truck, Clock4, Sparkles } from "lucide-react";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { OptimizedBanner, type OptimizedBannerItem } from "@/components/ui/OptimizedBanner";
import { CollectionProductsSection } from "@/components/home/CollectionProductsSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

type ApiCollection = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  showOnHome: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export function Home({ initialData }: { initialData?: any }) {
  const { data: featuredData, isLoading } = useGetFeaturedProducts({
    query: {
      initialData: initialData?.featuredProducts ? { products: initialData.featuredProducts, total: initialData.featuredProducts.length } : undefined,
      staleTime: 60000
    }
  });
  const [categories, setCategories] = useState<ApiCategory[]>(initialData?.categories || []);
  const [collections, setCollections] = useState<ApiCollection[]>(initialData?.collections || []);
  const [isLoadingCategories, setIsLoadingCategories] = useState(!initialData?.categories);
  const [isLoadingCollections, setIsLoadingCollections] = useState(!initialData?.collections);
  const [isLoadingSettings, setIsLoadingSettings] = useState(!initialData?.settings);
  const [settings, setSettings] = useState<Record<string, string> | null>(initialData?.settings || null);

  // Fetch settings from API if not provided or empty
  useEffect(() => {
    if (initialData?.settings && Object.keys(initialData.settings).length > 0) return;
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  // Fetch categories from API if not provided
  useEffect(() => {
    if (initialData?.categories?.length > 0) return;
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

  // Fetch collections marked for home screen if not provided
  useEffect(() => {
    if (initialData?.collections?.length > 0) return;
    const fetchHomeCollections = async () => {
      try {
        setIsLoadingCollections(true);
        const response = await fetch("/api/collections/home");
        if (!response.ok) {
          throw new Error("Failed to fetch home collections");
        }
        const data = await response.json();
        setCollections(data.collections || []);
      } catch (error) {
        console.error("Error fetching home collections:", error);
        setCollections([]);
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchHomeCollections();
  }, []);

  // Convert API categories to home page format
  const homeCategories = categories.map(cat => ({
    title: cat.name,
    subtitle: `Explore our ${cat.name.toLowerCase()} collection`,
    img: cat.imageUrl || `/product-${cat.id % 8 + 1}.png`, // Use category image or fallback to placeholder
    url: `/products?category=${cat.slug}`
  }));

  // Transform collections into banner format for the carousel with optimizations
  const bannerData: OptimizedBannerItem[] = useMemo(() => {
    if (!collections.length) return [];
    
    return collections.map((collection, index) => ({
      id: collection.id,
      title: collection.name,
      subtitle: index === 0 ? "Featured Collection" : "Curated For You",
      description: collection.description || `Discover our beautiful ${collection.name.toLowerCase()} collection, thoughtfully designed for your sacred spaces.`,
      imageUrl: collection.imageUrl || `/product-${(collection.id % 8) + 1}.png`,
      // Generate WebP version if available (you'd need to create these variants)
      imageUrlWebP: collection.imageUrl?.replace(/\.(jpg|jpeg|png)$/i, '.webp') || undefined,
      href: `/collections/${collection.slug}`,
      ctaText: "Explore",
      priority: index === 0, // First banner gets priority loading
      placeholderColor: index % 2 === 0 ? "#f5f0e8" : "#f0ebe3", // Alternating placeholder colors
    }));
  }, [collections]);

  const isOverallLoading = (!initialData) && (isLoading || isLoadingCategories || isLoadingCollections || isLoadingSettings);
  const [showLoader, setShowLoader] = useState(!initialData);
  const [isExiting, setIsExiting] = useState(false);

  // Handle loader visibility with a smooth fade-out
  useEffect(() => {
    if (!isOverallLoading) {
      // Start exit animation
      setIsExiting(true);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 700); // Matches the duration-700 in FullScreenLoader
      return () => clearTimeout(timer);
    } else {
      setShowLoader(true);
      setIsExiting(false);
      return undefined;
    }
  }, [isOverallLoading]);

  return (
    <>
      {showLoader && <FullScreenLoader isExiting={isExiting} />}
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="border-b border-border/70 bg-primary py-2 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-primary-foreground">
          Handpicked Urban Ummati | Fast Canada-Wide Shipping
        </div>

      {/* Banner Carousel - Showcasing Collections */}
      {!isLoadingSettings && settings?.nav_show_collections !== "false" && (
        isLoadingCollections ? (
          <section className="relative h-[140px] sm:h-[200px] md:h-[300px] lg:h-[450px] bg-muted animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </section>
        ) : bannerData.length > 0 ? (
          <section className="relative">
            <OptimizedBanner
              banners={bannerData}
              autoPlay={true}
              autoPlayInterval={6000}
              aspectRatio="auto"
              showIndicators={true}
              showArrows={true}
              overlayOpacity={0.5}
              className="rounded-none"
            />
          </section>
        ) : null
      )}

      {/* <section className="section-glow relative overflow-hidden border-b border-border/70 px-4 py-10 md:px-8 md:py-14">
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
      </section> */}

      {/* <section className="border-b border-border/70 bg-[hsl(35_42%_96%)] px-4 py-8 md:px-8">
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
      </section> */}

      {/* Featured Products Section - Active Products Toggleable */}
      {!isLoadingSettings && settings?.home_show_all_products === "true" && (
        <FeaturedProductsSection 
          title="Our Products" 
          limit={8} 
          initialProducts={initialData?.featuredProducts}
        />
      )}

      {!isLoadingSettings && settings?.nav_show_categories === "true" && (
        <section className="px-4 py-12 md:px-8 md:py-20">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Browse</p>
                <h1 className="mt-2 font-serif text-2xl md:text-4xl lg:text-5xl">Shop by Category</h1>
              </div>
              <Link href="/products" className="hidden text-xs uppercase tracking-[0.16em] text-primary transition-colors hover:text-secondary md:inline-flex">
                View All Products
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {isLoadingCategories ? (
                // Loading skeletons
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="editorial-card animate-pulse overflow-hidden p-3">
                    <div className="h-48 md:h-64 rounded-sm bg-muted"></div>
                    <div className="px-2 pb-1 pt-4">
                      <div className="h-6 w-3/4 rounded bg-muted"></div>
                      <div className="mt-2 h-4 w-1/2 rounded bg-muted"></div>
                      <div className="mt-4 h-4 w-1/4 rounded bg-muted"></div>
                    </div>
                  </div>
                ))
              ) : homeCategories.length > 0 ? (
                homeCategories.map((cat) => (
                  <Link key={cat.title} href={cat.url} className="editorial-card group block overflow-hidden p-3">
                    <div className="relative h-48 md:h-64 overflow-hidden rounded-sm">
                      <Image
                        src={cat.img}
                        alt={cat.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    </div>
                    <div className="px-2 pb-1 pt-4">
                      <h3 className="font-serif text-xl md:text-2xl">{cat.title}</h3>
                      <p className="mt-1 text-xs md:text-sm text-muted-foreground">{cat.subtitle}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-primary">
                        Explore <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                // Fallback if no categories
                <div className="col-span-4 text-center py-12">
                  <p className="text-muted-foreground">No categories available</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Collection Products Sections - One section per collection marked for home */}
      {!isLoadingSettings && settings?.nav_show_collections !== "false" && (
        isLoadingCollections ? (
          <section className="border-y border-border/70 bg-[hsl(35_40%_95%)] px-4 py-20 md:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-10">
                <div className="h-4 w-32 bg-muted animate-pulse mb-2" />
                <div className="h-10 w-64 bg-muted animate-pulse" />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        ) : (
          collections.map((collection) => (
            <CollectionProductsSection
              key={collection.id}
              collectionSlug={collection.slug}
              collectionName={collection.name}
              limit={4}
              initialProducts={initialData?.collectionProducts?.[collection.slug]}
            />
          ))
        )
      )}

      {/* <section className="px-4 py-20 md:px-8">
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
      </section> */}
    </main>
    </>
  );
}
