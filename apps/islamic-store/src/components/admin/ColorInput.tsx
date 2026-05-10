"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Plus, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColorEntry {
  id: string;
  hex: string;
  name: string;
  isValid: boolean;
}

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

// Generate a friendly name from hex color
function generateColorName(hex: string): string {
  // Common color mappings
  const colorMap: Record<string, string> = {
    "#000000": "Black",
    "#FFFFFF": "White",
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#FFFF00": "Yellow",
    "#FF00FF": "Magenta",
    "#00FFFF": "Cyan",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#FFC0CB": "Pink",
    "#A52A2A": "Brown",
    "#808080": "Gray",
    "#C0C0C0": "Silver",
    "#FFD700": "Gold",
  };

  const normalizedHex = hex.toUpperCase();
  if (colorMap[normalizedHex]) {
    return colorMap[normalizedHex];
  }

  // Extract RGB values for custom colors
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Determine color family
  if (r > 200 && g > 200 && b > 200) return "Light";
  if (r < 50 && g < 50 && b < 50) return "Dark";
  if (r > g && r > b) return "Reddish";
  if (g > r && g > b) return "Greenish";
  if (b > r && b > g) return "Blueish";
  
  return "Custom";
}

// Validate hex color
function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

// Normalize hex (convert 3-digit to 6-digit)
function normalizeHex(hex: string): string {
  hex = hex.toLowerCase();
  if (/^#([a-f0-9]{3})$/.test(hex)) {
    const digits = hex.slice(1);
    return `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
  }
  return hex;
}

// Parse comma-separated colors into entries
function parseColors(value: string): ColorEntry[] {
  if (!value.trim()) return [];
  
  const colors = value.split(",").map(c => c.trim()).filter(Boolean);
  
  return colors.map((color, index) => {
    const hex = color.startsWith("#") ? color : `#${color}`;
    const normalizedHex = normalizeHex(hex);
    const valid = isValidHexColor(normalizedHex);
    
    return {
      id: `color-${index}-${Date.now()}`,
      hex: normalizedHex,
      name: generateColorName(normalizedHex),
      isValid: valid,
    };
  });
}

// Serialize entries back to comma-separated string
function serializeColors(entries: ColorEntry[]): string {
  return entries.map(e => e.hex).join(", ");
}

export function ColorInput({
  value,
  onChange,
  label = "Colors",
  placeholder = "#FF0000, #00FF00, #0000FF",
  className,
}: ColorInputProps) {
  const [entries, setEntries] = useState<ColorEntry[]>(() => parseColors(value));
  const [inputValue, setInputValue] = useState(value);
  const [showAddButton, setShowAddButton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync entries when external value changes
  useEffect(() => {
    const newEntries = parseColors(value);
    setEntries(newEntries);
    setInputValue(value);
  }, [value]);

  // Update parent when entries change
  useEffect(() => {
    const serialized = serializeColors(entries);
    if (serialized !== value) {
      onChange(serialized);
    }
  }, [entries, onChange, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Parse and validate in real-time
    const newEntries = parseColors(newValue);
    setEntries(newEntries);
    
    // Show add button if there's valid input
    const hasValidColors = newEntries.some(e => e.isValid);
    setShowAddButton(hasValidColors && newValue.includes(','));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  const updateEntryName = (id: string, newName: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, name: newName } : entry
    ));
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const addColor = () => {
    const newId = `color-${Date.now()}`;
    setEntries(prev => [...prev, {
      id: newId,
      hex: "#000000",
      name: "Black",
      isValid: true,
    }]);
    // Focus the new color's name input after render
    setTimeout(() => {
      document.getElementById(`color-name-${newId}`)?.focus();
    }, 0);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Label */}
      <Label className="text-xs uppercase tracking-wider">{label}</Label>

      {/* Main Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-10"
        />
        {entries.some(e => e.isValid) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex -space-x-1">
            {entries.slice(0, 3).map((entry, i) => (
              <div
                key={entry.id}
                className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                style={{ backgroundColor: entry.hex }}
                title={`${entry.name} (${entry.hex})`}
              />
            ))}
            {entries.length > 3 && (
              <div className="w-4 h-4 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-medium">
                +{entries.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Color List */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Color Preview ({entries.length})
            </span>
            <button
              onClick={addColor}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Color
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200",
                  entry.isValid
                    ? "border-border bg-background hover:border-primary/30 hover:shadow-sm"
                    : "border-destructive/30 bg-destructive/5"
                )}
              >
                {/* Color Swatch */}
                <div className="relative">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg shadow-inner transition-transform duration-200 group-hover:scale-105",
                      !entry.isValid && "opacity-50"
                    )}
                    style={{ backgroundColor: entry.isValid ? entry.hex : "#cccccc" }}
                  />
                  {!entry.isValid && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                  )}
                  {entry.isValid && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>

                {/* Color Info */}
                <div className="flex-1 min-w-0">
                  {/* Hex Code Display */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={cn(
                        "text-xs font-mono font-medium px-1.5 py-0.5 rounded",
                        entry.isValid
                          ? "bg-muted text-muted-foreground"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {entry.hex}
                    </span>
                    {!entry.isValid && (
                      <span className="text-[10px] text-destructive">Invalid</span>
                    )}
                  </div>

                  {/* Friendly Name Input */}
                  <div className="relative">
                    <input
                      id={`color-name-${entry.id}`}
                      type="text"
                      value={entry.name}
                      onChange={(e) => updateEntryName(entry.id, e.target.value)}
                      placeholder="Color name..."
                      className={cn(
                        "w-full text-sm bg-transparent border-b border-transparent focus:border-primary outline-none py-0.5 transition-colors",
                        "placeholder:text-muted-foreground/50",
                        entry.isValid ? "text-foreground" : "text-destructive/70"
                      )}
                    />
                    {entry.name && (
                      <span className="absolute right-0 top-0.5 text-[10px] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        ✎
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all"
                  title="Remove color"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Index Badge */}
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center text-[10px] font-medium text-muted-foreground border border-background">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Add Color Button (bottom) */}
          {entries.length > 0 && (
            <button
              type="button"
              onClick={addColor}
              className="w-full py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Color
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">No colors added yet</p>
          <button
            type="button"
            onClick={addColor}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Add your first color
          </button>
        </div>
      )}
    </div>
  );
}
