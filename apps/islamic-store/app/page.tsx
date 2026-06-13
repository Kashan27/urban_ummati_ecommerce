import { Home } from "@/views/Home";
import { headers } from "next/headers";

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60;

async function getHomeData() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  // Use internal URL if available, otherwise fallback to the current host
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || (host ? `${protocol}://${host}` : "http://localhost:3000");
  
  try {
    // Parallel fetch for speed
    const [settingsRes, categoriesRes, collectionsRes, featuredRes] = await Promise.all([
      fetch(`${baseUrl}/api/settings`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/categories`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/collections/home`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/products?featured=true&limit=8`, { next: { revalidate: 60 } }),
    ]);

    const settings = settingsRes.ok ? await settingsRes.json() : {};
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { categories: [] };
    const collectionsData = collectionsRes.ok ? await collectionsRes.json() : { collections: [] };
    const featuredData = featuredRes.ok ? await featuredRes.json() : { products: [] };

    const collections = collectionsData.collections || [];
    
    // Fetch products for each collection in parallel to avoid waterfalls on client
    const collectionProductsMap: Record<string, any[]> = {};
    if (collections.length > 0) {
      const productsResponses = await Promise.all(
        collections.map((col: any) => 
          fetch(`${baseUrl}/api/collections/${col.slug}/products?limit=4`, { next: { revalidate: 3600 } })
            .then(res => res.ok ? res.json() : { products: [] })
            .catch(() => ({ products: [] }))
        )
      );
      
      collections.forEach((col: any, index: number) => {
        collectionProductsMap[col.slug] = productsResponses[index].products || [];
      });
    }

    return {
      settings,
      categories: categoriesData.categories || [],
      collections,
      collectionProducts: collectionProductsMap,
      featuredProducts: featuredData.products || [],
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
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
  
  return <Home initialData={initialData} />;
}
