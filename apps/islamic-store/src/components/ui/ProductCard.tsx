"use client";

import { Link } from "@/lib/router";
import { Star, StarHalf } from "lucide-react";
import type { Product } from "@workspace/api-client-react";
import { getProductSlug } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const [imgSrc, setImgSrc] = useState(product.imageUrl || '/product-1.png');

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
    <Link href={`/products/${getProductSlug(product.name, product.id)}`} className="group block w-full bg-white transition-all duration-300 hover:shadow-xl border border-transparent hover:border-border/50">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* Placeholder if no image */}
        <Image 
          src={imgSrc} 
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgSrc('/product-1.png')}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="bg-destructive text-white text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-2 py-1 shadow-sm">
              SALE
            </span>
          )}
          {!product.inStock && (
            <span className="bg-foreground text-background text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-2 py-1 shadow-sm">
              SOLD OUT
            </span>
          )}
        </div>
        
        {/* Quick Add Overlay - reveals on hover (Desktop only) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
          <div className="bg-primary/90 backdrop-blur-sm text-white text-center py-3 text-xs font-sans uppercase tracking-widest cursor-pointer hover:bg-primary transition-colors">
            View Details
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-5 flex flex-col gap-1.5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif text-base md:text-lg leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          <span className="font-sans font-bold text-sm md:text-base text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="font-sans text-xs md:text-sm text-muted-foreground line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {product.colors.slice(0, 5).map((color, idx) => (
              <div 
                key={idx}
                className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[9px] text-muted-foreground self-center ml-1">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
