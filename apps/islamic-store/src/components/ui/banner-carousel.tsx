"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/router";

export type BannerItem = {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  href: string;
  ctaText?: string;
  overlayColor?: string;
};

type BannerCarouselProps = {
  banners: BannerItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  aspectRatio?: "video" | "wide" | "ultrawide" | "auto";
  showIndicators?: boolean;
  showArrows?: boolean;
  overlayOpacity?: number;
};

export function BannerCarousel({
  banners,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
  aspectRatio = "wide",
  showIndicators = true,
  showArrows = true,
  overlayOpacity = 0.4,
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || banners.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isPaused, banners.length, goToNext]);

  if (banners.length === 0) {
    return null;
  }

  const aspectRatioClasses = {
    video: "aspect-video",
    wide: "aspect-[21/9]",
    ultrawide: "aspect-[3/1]",
    auto: "min-h-[400px] md:min-h-[500px] lg:min-h-[600px]",
  };

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl bg-muted",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              "relative w-full shrink-0",
              aspectRatioClasses[aspectRatio]
            )}
          >
            {/* Background Image with Parallax Effect */}
            <div
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-transform duration-700",
                index === currentIndex && "scale-105"
              )}
              style={{
                backgroundImage: `url(${banner.imageUrl})`,
              }}
            />

            {/* Gradient Overlay - Darker for better text contrast */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"
              style={{ opacity: Math.max(overlayOpacity, 0.6) }}
            />

            {/* Custom Overlay Color if provided */}
            {banner.overlayColor && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: banner.overlayColor,
                  opacity: 0.3,
                }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex h-full items-center">
              <div className="w-full px-6 md:px-12 lg:px-20">
                <div className="max-w-xl">
                  {/* Subtitle */}
                  {banner.subtitle && (
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-primary drop-shadow-lg animate-fade-in">
                      {banner.subtitle}
                    </p>
                  )}

                  {/* Title */}
                  <h2 className="mb-4 font-serif text-3xl text-foreground md:text-4xl lg:text-5xl xl:text-6xl leading-[0.95] drop-shadow-lg animate-slide-up">
                    {banner.title}
                  </h2>

                  {/* Description */}
                  {banner.description && (
                    <p className="mb-6 text-sm text-foreground/80 md:text-base leading-relaxed max-w-md drop-shadow-md animate-fade-in-delay">
                      {banner.description}
                    </p>
                  )}

                  {/* CTA Button */}
                  <Link
                    href={banner.href}
                    className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:gap-3 hover:shadow-lg hover:shadow-primary/25 animate-fade-in-delay-2"
                  >
                    {banner.ctaText || "Explore Collection"}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showIndicators && banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-background/50 hover:bg-background/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
