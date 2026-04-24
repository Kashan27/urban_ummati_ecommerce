import { Link } from "@/lib/router";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-[hsl(35_38%_95%)] text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-14 md:px-8">
        <div className="editorial-card mb-14 grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">Urban Ummati Journal</p>
            <h3 className="font-serif text-3xl leading-tight md:text-4xl">
              New collections, meaningful decor stories, and seasonal offers.
            </h3>
          </div>
          <form className="flex flex-col justify-center gap-3 sm:flex-row sm:items-center" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-md border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
            />
            <button
              type="submit"
              className="h-12 rounded-md bg-primary px-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid gap-10 border-b border-border/80 pb-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <h2 className="font-serif text-4xl leading-none tracking-[0.16em]">URBAN UMMATI</h2>
              <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Urban Ummati</p>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Curated pieces for prayer corners, living rooms, and gifting. Every collection blends spiritual meaning with elevated interior aesthetics.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#" className="rounded-full border border-border p-2.5 transition-colors hover:border-primary hover:text-primary" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="rounded-full border border-border p-2.5 transition-colors hover:border-primary hover:text-primary" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="rounded-full border border-border p-2.5 transition-colors hover:border-primary hover:text-primary" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm uppercase tracking-[0.16em] text-muted-foreground">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products?category=wall-art" className="transition-colors hover:text-primary">Wall Art</Link></li>
              <li><Link href="/products?category=prayer-rugs" className="transition-colors hover:text-primary">Prayer Rugs</Link></li>
              <li><Link href="/products?category=tasbeeh" className="transition-colors hover:text-primary">Tasbeeh</Link></li>
              <li><Link href="/products?category=jewelry" className="transition-colors hover:text-primary">Jewelry</Link></li>
              <li><Link href="/products?featured=true" className="transition-colors hover:text-primary">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm uppercase tracking-[0.16em] text-muted-foreground">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="transition-colors hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-primary">Contact</Link></li>
              <li><Link href="/shipping" className="transition-colors hover:text-primary">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="transition-colors hover:text-primary">Returns & Exchanges</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-secondary" />
              <span>123 Design Avenue, Suite 400, Toronto, ON M5V 3L9, Canada</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-secondary" />
              <span>+1 (800) 123-4567</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-secondary" />
              <span>support@urbanummati.com</span>
            </li>
          </ul>
          <div className="flex flex-wrap items-center gap-2 uppercase tracking-[0.14em]">
            <span className="rounded-md border border-border px-2.5 py-1">Visa</span>
            <span className="rounded-md border border-border px-2.5 py-1">Mastercard</span>
            <span className="rounded-md border border-border px-2.5 py-1">Amex</span>
            <span className="rounded-md border border-border px-2.5 py-1">PayPal</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Urban Ummati. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
