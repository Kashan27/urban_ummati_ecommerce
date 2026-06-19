import { Home } from "@/views/Home";
import Link from "next/link";
import { 
  db, 
  settingsTable, 
  categoriesTable, 
  collectionsTable, 
  productsTable, 
  productCollectionsTable 
} from "@workspace/db";
import { eq, and, asc, desc } from "drizzle-orm";
import { formatProduct, loadProductMediaMaps } from "@/lib/api-formatters";
import { buildSeoMetadata, defaultSeoDescription } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Urban Ummati | Modern Islamic Wall Art",
  description: defaultSeoDescription,
  path: "/",
});

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60;

async function getCollectionProducts(slug: string, limit: number = 4) {
  try {
    const rows = await db
      .select({
        product: productsTable,
        category: categoriesTable,
      })
      .from(productCollectionsTable)
      .innerJoin(collectionsTable, eq(productCollectionsTable.collectionId, collectionsTable.id))
      .innerJoin(productsTable, eq(productCollectionsTable.productId, productsTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(
        and(
          eq(collectionsTable.slug, slug),
          eq(collectionsTable.isActive, true),
          eq(productCollectionsTable.isActive, true),
          eq(productsTable.status, "active"),
        ),
      )
      .orderBy(desc(productsTable.createdAt))
      .limit(limit);

    const productIds = rows.map((r) => r.product.id);
    if (productIds.length === 0) return [];
    
    const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps(productIds);

    return rows.map((r) =>
      formatProduct(
        r.product,
        {
          categoryId: r.category?.id ?? null,
          categoryName: r.category?.name ?? null,
          categorySlug: r.category?.slug ?? null,
        },
        imagesByProductId.get(r.product.id),
        colorsByProductId.get(r.product.id),
      )
    );
  } catch (error) {
    console.error(`Error loading products for collection ${slug}:`, error);
    return [];
  }
}

async function getHomeData() {
  try {
    // 1. Get settings
    const settingsPromise = db.select().from(settingsTable).then((allSettings) => {
      const publicKeys = [
        "tax_percent",
        "free_shipping_threshold",
        "standard_shipping_cost",
        "upsell_discount_percent",
        "low_stock_threshold",
        "display_stock_to_customers",
        "enforce_stock_restrictions",
        "nav_show_new_arrivals",
        "nav_show_collections",
        "nav_show_all_products",
        "nav_show_categories",
        "home_show_all_products",
        "signature_art_category_slug"
      ];
      const settingsMap = allSettings.reduce((acc, s) => {
        if (publicKeys.includes(s.key)) {
          acc[s.key] = s.value;
        }
        return acc;
      }, {} as Record<string, string>);
      const defaults: Record<string, string> = {
        tax_percent: "13",
        free_shipping_threshold: "75",
        standard_shipping_cost: "15",
        upsell_discount_percent: "0",
      };
      return { ...defaults, ...settingsMap };
    });

    // 2. Get active categories
    const categoriesPromise = db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(asc(categoriesTable.name));

    // 3. Get active collections on home page
    const collectionsPromise = db
      .select()
      .from(collectionsTable)
      .where(
        and(
          eq(collectionsTable.isActive, true),
          eq(collectionsTable.showOnHome, true)
        )
      )
      .orderBy(asc(collectionsTable.name));

    // 4. Get featured products
    const featuredPromise = (async () => {
      const rows = await db
        .select()
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .orderBy(desc(productsTable.createdAt));

      const filtered = rows.filter(({ products, categories }) => {
        if (!categories) return false;
        if (products.status !== "active") return false;
        if (products.featured !== true) return false;
        return true;
      });

      const paginated = filtered.slice(0, 8);
      const productIds = paginated.map(({ products }) => products.id);
      if (productIds.length === 0) return [];

      const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps(productIds);

      return paginated.map(({ products, categories }) =>
        formatProduct(
          products,
          {
            categoryId: categories?.id ?? null,
            categoryName: categories?.name ?? null,
            categorySlug: categories?.slug ?? null,
          },
          imagesByProductId.get(products.id),
          colorsByProductId.get(products.id),
        )
      );
    })();

    // Run parallel queries
    const [settings, categories, collections, featuredProducts] = await Promise.all([
      settingsPromise,
      categoriesPromise,
      collectionsPromise,
      featuredPromise,
    ]);

    // Fetch products for each collection in parallel
    const collectionProductsMap: Record<string, any[]> = {};
    if (collections.length > 0) {
      const collectionProductsList = await Promise.all(
        collections.map((col) => getCollectionProducts(col.slug, 4))
      );
      
      collections.forEach((col, index) => {
        collectionProductsMap[col.slug] = collectionProductsList[index];
      });
    }

    return {
      settings,
      categories,
      collections,
      collectionProducts: collectionProductsMap,
      featuredProducts,
    };
  } catch (error) {
    console.error("Error fetching home data directly from DB:", error);
    return {
      settings: {},
      categories: [],
      collections: [],
      collectionProducts: {},
      featuredProducts: [],
    };
  }
}

export default async function Page() {
  const initialData = await getHomeData();
  
  return (
    <Home initialData={initialData}>
      {/*
        SEO CONTENT BLOCK — Server Component (no "use client")
        This section renders in the initial HTML response so crawlers can
        index the H1, description text, keywords and crawlable href links
        immediately, before any JavaScript executes.
      */}
      <section
        aria-label="About Urban Ummati"
        className="sr-only"
      >
        <h1>Modern Islamic Wall Art for Muslim Homes</h1>
        <p>
          Urban Ummati offers premium Islamic wall art, Kun artwork, Arabic calligraphy
          prints, and modern Muslim home decor for peaceful and meaningful spaces.
        </p>
        <nav aria-label="Shop navigation">
          <Link href="/products">Shop Islamic Wall Art</Link>
          <Link href="/collections">Browse Collections</Link>
          <Link href="/products?category=wall-art">Wall Art</Link>
          <Link href="/products?category=arabic-calligraphy">Arabic Calligraphy</Link>
          <Link href="/products?category=wall-clocks">Islamic Wall Clocks</Link>
          <Link href="/about">About Urban Ummati</Link>
          <Link href="/contact">Contact Us</Link>
        </nav>

        <section aria-label="Kun Islamic Wall Art">
          <h2>Kun Islamic Wall Art</h2>
          <p>
            Explore Kun Fayakun wall art and Arabic calligraphy designs created
            for modern Islamic interiors. Each piece is handcrafted to bring
            spiritual meaning and contemporary elegance to your home.
          </p>
          <Link href="/products?category=wall-art">View Islamic Wall Art</Link>
        </section>

        <section aria-label="Arabic Calligraphy Prints">
          <h2>Arabic Calligraphy Prints</h2>
          <p>
            Beautiful Islamic prints and wall decor for homes, offices, and prayer
            spaces. Our Arabic calligraphy collection brings faith-inspired beauty
            to every room.
          </p>
          <Link href="/products">View All Products</Link>
        </section>

        <section aria-label="Featured Collections">
          <h2>Featured Islamic Decor Collections</h2>
          <p>
            Discover curated collections of Islamic home decor, prayer room
            accessories, and Muslim home art designed by Urban Ummati.
          </p>
          <Link href="/collections">Browse All Collections</Link>
        </section>
      </section>
    </Home>
  );
}
