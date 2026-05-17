import { Link } from "@/lib/router";
import { Star, StarHalf } from "lucide-react";
import type { Product } from "@workspace/api-client-react";

export function ProductCard({ product }: { product: Product }) {
  // Generate star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={14} className="fill-[#F59E0B] text-[#F59E0B]" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} size={14} className="fill-[#F59E0B] text-[#F59E0B]" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-muted-foreground/30" />);
      }
    }
    return stars;
  };

  return (
    <Link href={`/products/${product.id}`} className="group block w-full bg-white transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* Placeholder if no image */}
        <img 
          src={product.imageUrl || '/product-1.png'} 
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/product-1.png';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="bg-destructive text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1">
              SALE
            </span>
          )}
          {!product.inStock && (
            <span className="bg-foreground text-background text-[10px] uppercase font-bold tracking-wider px-2 py-1">
              SOLD OUT
            </span>
          )}
        </div>
        
        {/* Quick Add Overlay - reveals on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-primary/90 backdrop-blur-sm text-white text-center py-3 text-sm font-sans uppercase tracking-widest cursor-pointer hover:bg-primary transition-colors">
            View Details
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif text-lg leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>
        
        {/* <div className="flex items-center gap-2 mt-1">
          <div className="flex gap-0.5">
            {renderStars(product.rating || 5)}
          </div>
          <span className="text-xs text-muted-foreground font-sans">
            ({product.reviewCount || 0})
          </span>
        </div> */}

        <div className="flex items-center gap-3 mt-2">
          <span className="font-sans font-bold text-base text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="font-sans text-sm text-muted-foreground line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-3">
            {product.colors.slice(0, 4).map((color, idx) => (
              <div 
                key={idx}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-muted-foreground self-center ml-1">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
