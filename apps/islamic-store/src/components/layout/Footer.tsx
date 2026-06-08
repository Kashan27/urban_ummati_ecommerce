import { Link } from "@/lib/router";
import { Facebook, Globe, Instagram, Mail } from "lucide-react";
import { useEffect, useState } from "react";

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

type ApiSocialPlatform = {
  id: number;
  name: string;
  platformLink: string;
  isActive: boolean;
  iconKey: string | null;
  displayOrder: number;
  handle: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
};

function TikTokIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.6 5.82c-.88-.94-1.34-2.04-1.4-3.32h-2.98v13.14c0 1.43-1.16 2.6-2.6 2.6-1.43 0-2.6-1.17-2.6-2.6 0-1.44 1.17-2.6 2.6-2.6.27 0 .52.04.77.11V9.9c-.25-.03-.51-.05-.77-.05-3.1 0-5.6 2.5-5.6 5.59 0 3.1 2.5 5.6 5.6 5.6 3.09 0 5.59-2.5 5.59-5.6V8.46c1.34.95 2.92 1.47 4.6 1.49V7c-1.06-.03-2.08-.45-2.81-1.18z" />
    </svg>
  );
}

function SocialPlatformIcon({ iconKey, size }: { iconKey: string | null; size: number }) {
  const key = (iconKey ?? "").trim().toLowerCase();
  if (key === "instagram") return <Instagram size={size} strokeWidth={1.5} />;
  if (key === "facebook") return <Facebook size={size} strokeWidth={1.5} />;
  if (key === "tiktok") return <TikTokIcon size={size} />;
  return <Globe size={size} strokeWidth={1.5} />;
}

export function Footer() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [socialPlatforms, setSocialPlatforms] = useState<ApiSocialPlatform[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
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

  useEffect(() => {
    const fetchSocialPlatforms = async () => {
      try {
        const response = await fetch("/api/social-platforms");
        if (!response.ok) throw new Error("Failed to fetch social platforms");
        const data = await response.json();
        setSocialPlatforms(data.platforms || []);
      } catch (error) {
        console.error("Error fetching social platforms:", error);
        setSocialPlatforms([]);
      }
    };
    fetchSocialPlatforms();
  }, []);

  return (
    // Reduced mt-24 to mt-12 to bring the footer closer to the content
    <footer className="mt-12 border-t border-[#C9A883]/20 bg-[#FAF9F6] text-[#152238]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-4">
          
          {/* 1. BRAND SECTION (LEFT) */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="group inline-block w-fit">
              <div className="flex items-center">
                <h2 className="font-serif text-2xl tracking-[0.14em]">
                  URBAN UMMATI
                </h2>
              </div>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.4em] text-[#C9A883]">
                Timeless Islamic Living
              </p>
            </Link>
            
            <p className="text-sm leading-relaxed text-slate-500">
              Curated Islamic decor designed for calm interiors, 
              meaningful gifting, and intentional living.
            </p>

            <div className="flex items-center gap-5 pt-2">
              {socialPlatforms.map((platform) => (
                <a
                  key={platform.id}
                  href={platform.platformLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-slate-400 transition-all hover:scale-110 hover:text-[#C9A883]"
                  aria-label={platform.name}
                >
                  <SocialPlatformIcon iconKey={platform.iconKey} size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* 2. COLLECTIONS */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A883]">
              Collections
            </h3>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <Link href="/products?featured=true" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                <span className="text-[#C9A883]">•</span> New Arrivals
              </Link>
              {!isLoadingCategories && categories.length > 0 ? (
                categories.slice(0, 4).map((category) => (
                  <Link 
                    key={category.id} 
                    href={`/products?category=${category.slug}`} 
                    className="hover:text-[#C9A883] transition-colors flex items-center gap-2"
                  >
                    <span className="text-[#C9A883]">•</span> {category.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/products" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                    <span className="text-[#C9A883]">•</span> Wall Art
                  </Link>
                  <Link href="/products" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                    <span className="text-[#C9A883]">•</span> Canvas Prints
                  </Link>
                  <Link href="/products" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                    <span className="text-[#C9A883]">•</span> Framed Art
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 3. CUSTOMER CARE */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A883]">
              Customer Care
            </h3>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <Link href="/faq" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                <span className="text-[#C9A883]">•</span> FAQs
              </Link>
              <Link href="/contact" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                <span className="text-[#C9A883]">•</span> Contact Us
              </Link>
              <Link href="/shipping-policy" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                <span className="text-[#C9A883]">•</span> Shipping Policy
              </Link>
              <Link href="/returns-policy" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                <span className="text-[#C9A883]">•</span> Returns & Refunds
              </Link>
            </div>
          </div>

          {/* 4. LEGAL INFO (RIGHT) */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A883]">
              Legal Info
            </h3>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <Link href="/privacy-policy" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                <span className="text-[#C9A883]">•</span> Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                <span className="text-[#C9A883]">•</span> Terms & Conditions
              </Link>
              <Link href="/cookie-policy" className="hover:text-[#C9A883] transition-colors flex items-center gap-2">
                <span className="text-[#C9A883]">•</span> Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-[#C9A883]/10 pt-6 md:flex-row">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
            © {new Date().getFullYear()} Urban Ummati
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#C9A883] md:mt-0">
            <Mail size={12} strokeWidth={2} />
            <a href="mailto:social@urbanummati.store" className="hover:underline">
              social@urbanummati.store
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
