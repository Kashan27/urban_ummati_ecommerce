import { ReactNode } from "react";

export default function TrackingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fdfcfb] flex flex-col">
      {/* 
          This layout intentionally omits the global Navbar and Footer 
          to provide a focused, standalone tracking experience.
      */}
      {children}
    </div>
  );
}
