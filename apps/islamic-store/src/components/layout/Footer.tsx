import { Link } from "@/lib/router";
import { Facebook, Instagram, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export function Footer() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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

  return (
    // Reduced mt-24 to mt-12 to bring the footer closer to the content
    <footer className="mt-12 border-t border-[#C9A883]/20 bg-[#FAF9F6] text-[#152238]">
      <div className="mx-auto max-w-7xl px-6 py-10"> {/* Reduced py-16 to py-10 */}
        
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-3">
          
          {/* 1. BRAND SECTION */}
          <div className="flex flex-col">
            <Link href="/" className="group inline-block w-fit">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Urban Ummati"
                  width={28}
                  height={28}
                  className="object-contain transition-transform duration-1000 ease-in-out group-hover:rotate-[360deg]"
                />
                <h2 className="font-serif text-2xl tracking-[0.14em]">
                  RBAN UMMATI
                </h2>
              </div>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.4em] text-[#C9A883]">
                Timeless Islamic Living
              </p>
            </Link>
          </div>

          {/* 2. DESCRIPTION */}
          <div className="flex flex-col md:items-center">
            <p className="max-w-[280px] text-sm leading-relaxed text-slate-500 md:text-center">
              Curated Islamic decor designed for calm interiors, 
              meaningful gifting, and intentional living.
            </p>
          </div>

          {/* 3. CONTACT & SOCIALS */}
          <div className="flex flex-col md:items-end gap-5">
            <div className="flex flex-col md:items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A883]">
                Inquiries
              </span>
              <a 
                href="mailto:support@urbanummati.com" 
                className="flex items-center gap-2 text-sm transition-colors hover:text-[#C9A883]"
              >
                <Mail size={14} strokeWidth={1.5} className="text-[#C9A883]" />
                support@urbanummati.com
              </a>
            </div>

            <div className="flex items-center gap-5">
              <a 
                href="#" 
                className="text-slate-400 transition-all hover:scale-110 hover:text-[#C9A883]" 
                aria-label="Instagram"
              >
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a 
                href="#" 
                className="text-slate-400 transition-all hover:scale-110 hover:text-[#C9A883]" 
                aria-label="Facebook"
              >
                <Facebook size={20} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR - Reduced spacing from mt-16 to mt-10 */}
        <div className="mt-10 flex flex-col items-center justify-between border-t border-[#C9A883]/10 pt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 md:flex-row">
          <p>© {new Date().getFullYear()} Urban Ummati</p>
          
          <div className="mt-4 flex items-center gap-6 md:mt-0">
            <Link href="/privacy" className="hover:text-[#C9A883] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#C9A883] transition-colors">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}