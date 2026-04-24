"use client";

import { useEffect, useState } from "react";
import { Settings2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  settings?: Record<string, string>;
  onUpdateSettings?: (updates: Record<string, string>) => Promise<void>;
};

export function SettingsSection({ settings, onUpdateSettings }: Props) {
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
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="font-serif text-2xl tracking-tight">Global Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage store-wide rules, tax, and shipping thresholds.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <h3 className="font-serif text-lg">Store Configuration</h3>
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
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px w-full bg-border/50" />;
}
