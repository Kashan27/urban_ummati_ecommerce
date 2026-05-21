import { Link } from "@/lib/router";
import { Star } from "lucide-react";

type Review = {
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
};

const REVIEWS: Review[] = [
  {
    name: "Ayesha",
    location: "Toronto, ON",
    rating: 5,
    title: "Beautiful quality and fast shipping",
    body: "The wall frame looks even better in person. Packaging was secure and delivery was quick within Canada.",
  },
  {
    name: "Omar",
    location: "Mississauga, ON",
    rating: 5,
    title: "Perfect for gifting",
    body: "Bought as a gift and it was loved. The design feels premium and minimal.",
  },
  {
    name: "Sana",
    location: "Vancouver, BC",
    rating: 4,
    title: "Great customer support",
    body: "Support replied quickly and helped me update my address before dispatch. Really smooth experience.",
  },
  {
    name: "Bilal",
    location: "Calgary, AB",
    rating: 5,
    title: "Exactly the aesthetic I wanted",
    body: "Matches my living room decor perfectly. Will be ordering more for my prayer corner.",
  },
  {
    name: "Maryam",
    location: "Ottawa, ON",
    rating: 5,
    title: "Excellent craftsmanship",
    body: "Clean finish, beautiful typography, and the colors are accurate to the photos.",
  },
  {
    name: "Hassan",
    location: "Montreal, QC",
    rating: 4,
    title: "Love the collection",
    body: "The pieces feel curated and intentional. The store experience is easy from browsing to checkout.",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star
          key={idx}
          size={14}
          className={idx < rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-muted-foreground/30"}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <main className="flex-1 w-full pt-10 pb-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Reviews</h1>
          <div className="w-16 h-0.5 bg-secondary mx-auto mb-6"></div>
          <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
            What customers are saying about Urban Ummati.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <div key={`${review.name}-${review.title}`} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <Stars rating={review.rating} />
              <div className="mt-3 font-serif text-lg text-foreground">{review.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.body}</div>
              <div className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {review.name} • {review.location}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Browse</div>
              <div className="mt-2 font-serif text-2xl text-foreground">Find your next piece</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Explore products and curated collections designed for modern spaces.
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Shop Products
              </Link>
              <Link
                href="/collections"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-muted/30"
              >
                View Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

