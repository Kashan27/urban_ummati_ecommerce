"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";


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
    auto: "min-h-[400px] md:min-h-[500px] lg:min-h-[600px]",
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
      
      {/* Banner Image - using regular img for better compatibility */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-700 ease-out",
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
  autoPlay = true,
  autoPlayInterval = 5000,
  priority = true,
}: OptimizedBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  // Preload images
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    banners.forEach((banner, index) => {
      if (index < 3) { // Preload first 3 images
        const img = new window.Image();
        img.src = banner.imageUrl;
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [banner.id]: true }));
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
    auto: "min-h-[400px] md:min-h-[500px] lg:min-h-[600px]",
  };

  const currentBanner = banners[currentIndex];
  const isImageReady = imagesLoaded[currentBanner.id] || priority;

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl bg-muted",
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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          className={cn(
            "transition-transform duration-700 ease-out",
            isTransitioning ? "scale-105" : "scale-100"
          )}
        />
      </div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"
        style={{ opacity: Math.max(overlayOpacity, 0.6) }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="w-full px-6 md:px-12 lg:px-20">
          <div className="max-w-xl">
            {currentBanner.subtitle && (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-primary drop-shadow-lg">
                {currentBanner.subtitle}
              </p>
            )}
            <h2 className="mb-4 font-serif text-3xl text-foreground md:text-4xl lg:text-5xl xl:text-6xl leading-[0.95] drop-shadow-lg">
              {currentBanner.title}
            </h2>
            {currentBanner.description && (
              <p className="mb-6 text-sm text-foreground/80 md:text-base leading-relaxed max-w-md drop-shadow-md">
                {currentBanner.description}
              </p>
            )}
            <Link
              href={currentBanner.href}
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:gap-3 hover:shadow-lg"
            >
              {currentBanner.ctaText || "Explore"}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "w-8 bg-primary"
                  : "w-2 bg-primary/40 hover:bg-primary/60"
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
