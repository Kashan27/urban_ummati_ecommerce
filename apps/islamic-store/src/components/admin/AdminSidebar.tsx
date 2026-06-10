"use client";

import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import type { AdminNavItem, AdminSection } from "@/components/admin/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/lib/router";

type Props = {
  navItems: AdminNavItem[];
  activeSection: AdminSection;
  onLogout: () => void;
};

export function AdminSidebar({ navItems, activeSection, onLogout }: Props) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full shrink-0 flex-col border-border/60 border-b md:sticky md:top-0 md:h-[min(100dvh,100vh)] md:w-[260px] md:border-b-0 md:border-r",
        "bg-card text-card-foreground shadow-sm",
        "no-print",
      )}
    >
      {/* Header - Mirrored from Storefront */}
      <div className="px-5 py-6">
        <Link href="/" className="group block">
          <div className="flex items-center">
            <h1 className="font-serif text-xl leading-none tracking-[0.2em] text-foreground">
              URBAN UMMATI
            </h1>
          </div>
          <p className="mt-1 text-[8px] uppercase tracking-[0.4em] text-muted-foreground">
            Modern Art. Scared Meaning
          </p>
        </Link>
        <div className="mt-4 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
          Admin Panel
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Navigation - Flat List */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1" aria-label="Admin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeSection;

            return (
              <Link
                key={item.key}
                href={item.href}
                data-testid={`tab-admin-${item.key}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border/50 bg-accent/20 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-card px-3 py-2 ring-1 ring-border/50 shadow-sm">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">Console</p>
            <p className="truncate text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{activeSection}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-border/50 bg-background text-foreground hover:bg-accent"
            asChild
          >
            <Link href="/">
              <ExternalLink className="h-4 w-4 text-primary" />
              View storefront
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={onLogout}
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}
