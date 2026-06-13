"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function FullScreenLoader({ isExiting = false }: { isExiting?: boolean }) {
  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fbfbf9] transition-all duration-700 ease-in-out",
        isExiting ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="flex flex-col items-center">
        <div className="relative mb-8 h-20 w-20">
          <img src="/shield.png" alt="Urban Ummati" className="h-full w-auto opacity-90 mx-auto" />
          <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/20 scale-150" />
        </div>
        
        <div className="overflow-hidden">
          <h1 className="font-serif text-3xl md:text-5xl tracking-[0.4em] text-foreground font-light animate-in fade-in slide-in-from-bottom-4 duration-1000">
            URBAN UMMATI
          </h1>
        </div>
        
        <div className="mt-10 flex gap-2">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
        </div>
        
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground/50 animate-pulse">
          Modern Art. Sacred Meaning.
        </p>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute bottom-10 left-10 right-10 text-center">
        <div className="h-px w-24 bg-border/40 mx-auto mb-4" />
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/30">
          Crafting Spiritual Spaces
        </p>
      </div>
    </div>
  );
}
