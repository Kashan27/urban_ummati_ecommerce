"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";


export interface OptimizedBannerItem {
  id: number | string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  imageUrlWebP?: string;
  imageUrlMobile?: string;
  imageUrlTablet?: string;
  placeholderColor?: string;
  href?: string;
  ctaText?: string;
  priority?: boolean;
}

interface OptimizedBannerProps {
  banners: OptimizedBannerItem[];
  className?: string;
  aspectRatio?: "video" | "wide" | "ultrawide" | "auto";
  overlayOpacity?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  priority?: boolean;
}

// Skeleton loader for banner
function BannerSkeleton({ aspectRatio = "wide" }: { aspectRatio?: string }) {
  const aspectClasses = {
    video: "aspect-video",
    wide: "aspect-[21/9]",
    ultrawide: "aspect-[3/1]",
    auto: "h-[140px] sm:h-[200px] md:h-[300px] lg:h-[450px]",
  };

  return (
    <div className={cn("relative w-full animate-pulse", aspectClasses[aspectRatio as keyof typeof aspectClasses])}>
      <div className="absolute inset-0 bg-muted" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground/50" />
      </div>
    </div>
  );
}

// Image with LQIP and loading state
function OptimizedBannerImage({
  src,
  alt,
  priority = false,
  placeholderColor = "#f5f5f5",
  className,
  fill = true,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  placeholderColor?: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate LQIP color
  const lqipStyle = {
    backgroundColor: placeholderColor,
  };

  if (hasError) {
    // Show placeholder color instead of error message
    return (
      <div 
        className={cn("w-full h-full", className)} 
        style={{ backgroundColor: placeholderColor || '#f5f5f5' }}
      />
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* LQIP Placeholder */}
      {isLoading && (
        <div 
          className="absolute inset-0 animate-pulse" 
          style={lqipStyle}
        />
      )}
      
      {/* Banner Image - using Next.js Image for optimization */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={cn(
          "object-cover transition-all duration-700 ease-out",
          isLoading ? "scale-105 blur-sm opacity-0" : "scale-100 blur-0 opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}

export function OptimizedBanner({
  banners,
  className,
  aspectRatio = "wide",
  overlayOpacity = 0.4,
  showIndicators = true,
  showArrows = true,
  autoPlay = true,
  autoPlayInterval = 5000,
  priority = true,
}: OptimizedBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Preload images
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    banners.forEach((banner, index) => {
      if (index < 3) { // Preload first 3 images
        const img = new window.Image();
        img.src = banner.imageUrl;
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [String(banner.id)]: true }));
        };
      }
    });
  }, [banners]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentIndex, isTransitioning]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, banners.length, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === banners.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, banners.length, goToSlide]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused || banners.length <= 1) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isPaused, banners.length, goToNext]);

  if (banners.length === 0) {
    return <BannerSkeleton aspectRatio={aspectRatio} />;
  }

  const aspectClasses = {
    video: "aspect-video",
    wide: "aspect-[21/9]",
    ultrawide: "aspect-[3/1]",
    auto: "h-[140px] sm:h-[200px] md:h-[300px] lg:h-[450px]",
  };

  const currentBanner = banners[currentIndex];
  const isImageReady = imagesLoaded[String(currentBanner.id)] || priority;

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-none sm:rounded-2xl bg-[#f5f5f5]",
        aspectClasses[aspectRatio],
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Loading Skeleton */}
      {!isImageReady && <BannerSkeleton aspectRatio={aspectRatio} />}

      {/* Banner Image with Optimizations */}
      <div className={cn("absolute inset-0 transition-opacity duration-500", isImageReady ? "opacity-100" : "opacity-0")}>
        <OptimizedBannerImage
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          priority={priority}
          placeholderColor="#f5f5f5"
          sizes="100vw"
          className={cn(
            "transition-transform duration-700 ease-out w-full h-full object-cover",
            isTransitioning ? "scale-105" : "scale-100"
          )}
        />
      </div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-background via-background/50 sm:via-background/80 to-transparent"
        style={{ opacity: Math.max(overlayOpacity, 0.4) }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="w-full sm:w-1/2 px-6 sm:px-10 md:px-12 lg:px-16">
          <div className="max-w-sm sm:max-w-md md:max-w-lg">
            {currentBanner.subtitle && (
              <p className="mb-2 sm:mb-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary drop-shadow-lg line-clamp-1">
                {currentBanner.subtitle}
              </p>
            )}
            <h2 className="mb-3 sm:mb-4 font-serif text-xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight drop-shadow-lg line-clamp-3 sm:line-clamp-none">
              {currentBanner.title}
            </h2>
            {currentBanner.description && (
              <p className="hidden md:block mb-6 text-sm text-foreground/80 md:text-base leading-relaxed drop-shadow-md">
                {currentBanner.description}
              </p>
            )}
            <Link
              href={currentBanner.href ?? "/products"}
              className="inline-flex items-center gap-1.5 bg-primary px-3.5 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:gap-2.5 hover:shadow-lg active:scale-95"
            >
              {currentBanner.ctaText || "Explore"}
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 z-20 grid h-9 w-9 sm:h-12 sm:w-12 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground opacity-0 sm:opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 group-hover:opacity-100 active:scale-95"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 z-20 grid h-9 w-9 sm:h-12 sm:w-12 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground opacity-0 sm:opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 group-hover:opacity-100 active:scale-95"
            aria-label="Next banner"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "w-6 sm:w-8 bg-primary"
                  : "w-1.5 sm:w-2 bg-primary/40 hover:bg-primary/60"
              )}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default OptimizedBanner;
