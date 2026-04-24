"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";
import type { AdminNavItem, AdminSection } from "@/components/admin/types";
import { hrefMatchesLocation } from "@/components/admin/url-match";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "@/lib/router";

function parentItemActive(item: AdminNavItem, pathname: string): boolean {
  const base = item.href.split(/[?#]/)[0];
  if (!item.children) {
    return pathname === base;
  }
  const childHit = item.children.some((c) => {
    const cBase = c.href.split(/[?#]/)[0];
    return pathname === cBase || pathname.startsWith(`${cBase}/`);
  });
  return childHit || pathname === base || pathname.startsWith(`${base}/`);
}

function childLinkActive(href: string, pathname: string, searchRaw: string): boolean {
  const [pathAndQuery, hash] = href.split("#");
  const qIndex = pathAndQuery.indexOf("?");
  const pathOnly = qIndex >= 0 ? pathAndQuery.slice(0, qIndex) : pathAndQuery;
  const queryOnly = qIndex >= 0 ? pathAndQuery.slice(qIndex + 1) : "";

  if (pathname !== pathOnly) return false;

  if (queryOnly) {
    return hrefMatchesLocation(`${pathOnly}?${queryOnly}`, pathname, searchRaw);
  }

  if (hash) {
    if (typeof window === "undefined") return false;
    return window.location.hash === `#${hash}`;
  }

  return searchRaw === "";
}

type Props = {
  navItems: AdminNavItem[];
  activeSection: AdminSection;
  onLogout: () => void;
};

export function AdminSidebar({ navItems, activeSection, onLogout }: Props) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const searchRaw = searchParams?.toString() ?? "";

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const item of navItems) {
        if (!item.children?.length) continue;
        let shouldOpen = false;
        for (const c of item.children) {
          if (childLinkActive(c.href, pathname, searchRaw)) {
            shouldOpen = true;
            break;
          }
        }
        const base = item.href.split(/[?#]/)[0];
        if (!shouldOpen && (pathname === base || pathname.startsWith(`${base}/`))) {
          shouldOpen = true;
        }
        if (shouldOpen) {
          next[item.key] = true;
        }
      }
      return next;
    });
  }, [navItems, pathname, searchRaw]);

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full shrink-0 flex-col border-border/60 border-b md:sticky md:top-0 md:h-[min(100dvh,100vh)] md:w-[280px] md:border-b-0 md:border-r",
        "bg-card text-card-foreground shadow-sm",
        "no-print",
      )}
    >
      <div className="relative px-5 pb-4 pt-6">
        <div
          className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          aria-hidden
        />
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary shadow-sm shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Urban Ummati</p>
            <p className="truncate font-serif text-lg font-bold tracking-tight text-foreground">Admin</p>
            <p className="mt-1 text-[11px] text-muted-foreground font-medium">Store management</p>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      <ScrollArea className="max-h-[min(280px,42vh)] min-h-0 flex-1 px-3 py-4 md:max-h-none">
        <nav className="space-y-1" aria-label="Admin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const parentActive = parentItemActive(item, pathname);
            const hasChildren = Boolean(item.children?.length);

            if (!hasChildren) {
              const selfActive = pathname === item.href.split(/[?#]/)[0];
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  data-testid={`tab-admin-${item.key}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    selfActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", selfActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            }

            const groupOpen = openGroups[item.key] ?? parentActive;

            return (
              <Collapsible
                key={item.key}
                open={groupOpen}
                onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [item.key]: open }))}
                className="rounded-xl"
              >
                <div
                  className={cn(
                    "flex items-stretch gap-0.5 rounded-xl transition-colors",
                    parentActive ? "bg-accent/50 ring-1 ring-border/50" : "hover:bg-accent/30",
                  )}
                >
                  <Link
                    href={item.href}
                    data-testid={`tab-admin-${item.key}`}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      parentActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px]", parentActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      )}
                      aria-expanded={groupOpen}
                      aria-label={groupOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform duration-200", groupOpen ? "rotate-180" : "rotate-0")}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="overflow-hidden">
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-border/50 py-1 pl-3">
                    {item.children!.map((child) => {
                      const active = childLinkActive(child.href, pathname, searchRaw);
                      return (
                        <Link
                          key={child.key}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg py-2 pl-2 pr-2 text-[13px] transition-colors",
                            active
                              ? "bg-primary/10 font-bold text-primary"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              active ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" : "bg-border",
                            )}
                          />
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>

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
