"use client";

import { useEffect, useState } from "react";
import { Settings2, Save, Gift, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminProduct, AdminCategory } from "@/components/admin/types";

type Props = {
  settings?: Record<string, string>;
  onUpdateSettings?: (updates: Record<string, string>) => Promise<void>;
  products?: AdminProduct[];
  categories?: AdminCategory[];
};

export function SettingsSection({ settings, onUpdateSettings, products, categories }: Props) {
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!onUpdateSettings) return;
    setIsSavingSettings(true);
    try {
      await onUpdateSettings(localSettings);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-4 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Global Settings</h2>
            <p className="text-xs text-muted-foreground">Manage store-wide rules, tax, and shipping thresholds</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold tracking-tight">Store Configuration</h3>
          </div>
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
          >
            <Save className="h-3.5 w-3.5" />
            {isSavingSettings ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upsell Discount (%)
              </label>
              <input
                type="number"
                value={localSettings.upsell_discount_percent || ""}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, upsell_discount_percent: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 20"
              />
              <p className="mt-1 text-[10px] text-muted-foreground italic">
                Global discount for upsell items.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={localSettings.tax_percent || ""}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, tax_percent: e.target.value }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 13"
              />
            </div>
          </div>

          <Separator />

          {/* Navigation & Sections */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80">Navigation & Featured Sections</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Signature Art Category
                </label>
                <select
                  value={localSettings.signature_art_category_slug || ""}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, signature_art_category_slug: e.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">None / Hide Link</option>
                  {(categories || [])
                    .filter((c) => c.isActive)
                    .map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-[10px] text-muted-foreground italic">
                  Select which category should be linked as "Signature Art".
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                value={localSettings.free_shipping_threshold || ""}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, free_shipping_threshold: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 75"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Standard Shipping Cost ($)
              </label>
              <input
                type="number"
                value={localSettings.standard_shipping_cost || ""}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, standard_shipping_cost: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 15"
              />
            </div>
          </div>

          <Separator />

          {/* Promotional Offers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80">Promotional Offers</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Free Product Threshold ($)
                </label>
                <input
                  type="number"
                  value={localSettings.free_product_threshold || ""}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, free_product_threshold: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 150"
                />
                <p className="mt-1 text-[10px] text-muted-foreground italic">
                  Spend this much to get a free gift.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Free Gift Product
                </label>
                <select
                  value={localSettings.free_product_id || ""}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, free_product_id: e.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">None / Disabled</option>
                  {(products || [])
                    .filter((p) => p.status === "active")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80">Inventory & Fulfillment</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold text-foreground">Enforce Stock Restrictions</label>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Customers cannot buy more than available stock.
                  </p>
                </div>
                <Toggle 
                  checked={localSettings.enforce_stock_restrictions === "true"}
                  onChange={(checked) => setLocalSettings(prev => ({ ...prev, enforce_stock_restrictions: String(checked) }))}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold text-foreground">Display Stock to Customers</label>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Show current stock levels (e.g. "Only 2 left") on product pages.
                  </p>
                </div>
                <Toggle 
                  checked={localSettings.display_stock_to_customers === "true"}
                  onChange={(checked) => setLocalSettings(prev => ({ ...prev, display_stock_to_customers: String(checked) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Low Stock Display Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={localSettings.low_stock_threshold || ""}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, low_stock_threshold: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 5"
                />
                <p className="mt-1 text-[10px] text-muted-foreground italic">
                  Threshold for low stock warnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function Separator() {
  return <div className="h-px w-full bg-border/50" />;
}
