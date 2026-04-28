import { Link } from "@/lib/router";

export function About() {
  return (
    <main className="flex-1 w-full bg-background pt-10 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">About Urban Ummati</h1>
          <div className="w-16 h-0.5 bg-secondary mx-auto mb-6"></div>
          <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
            Urban Ummati creates modern Islamic decor designed for prayer corners, living rooms, and gifting—made to feel timeless and intentional.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-2">
            <h2 className="font-serif text-2xl text-foreground">Our Story</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We curate pieces that blend spiritual meaning with elevated interior aesthetics. Each item is selected to help you build a calm, beautiful space
              that supports remembrance, reflection, and everyday barakah.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              From wall art to thoughtful gifts, we focus on quality materials, clear typography, and designs that complement modern homes.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-foreground">Based In Canada</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Orders are dispatched from Canada. You’ll see shipping details at checkout and in your confirmation email.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Shop Products
              </Link>
              <Link
                href="/collections"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-muted/30"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-foreground">What We Value</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Quality</div>
              <div className="mt-2 text-sm text-foreground">Carefully curated pieces made to last and look beautiful in your space.</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Meaning</div>
              <div className="mt-2 text-sm text-foreground">Designs rooted in faith—made to inspire remembrance and reflection.</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Service</div>
              <div className="mt-2 text-sm text-foreground">Responsive support and clear communication from checkout to delivery.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

