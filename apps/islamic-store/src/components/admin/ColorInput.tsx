"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { colornames } from "color-name-list";

// Color type matching the database schema
export interface Color {
  hex: string;
  name: string;
}

export interface ColorEntry extends Color {
  id: string;
  isValid: boolean;
}

interface ColorInputProps {
  value: Color[] | string[] | any[];  // Supports both old format (strings) and new format (objects)
  onChange: (value: Color[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

// Helper to normalize value to Color[] format
function normalizeValue(value: any[]): Color[] {
  if (!Array.isArray(value)) return [];
  
  return value.map(item => {
    // If already in new format
    if (typeof item === 'object' && item !== null && 'hex' in item) {
      return { hex: item.hex, name: item.name || item.hex };
    }
    // If in old format (string)
    if (typeof item === 'string') {
      return { hex: item, name: item };
    }
    // Fallback
    return { hex: '#000000', name: 'Black' };
  });
}

// Get color name from the color-name-list library (30,000+ names)
function getLibraryColorName(hex: string): string | null {
  const normalizedHex = hex.toLowerCase();
  const color = colornames.find(c => c.hex.toLowerCase() === normalizedHex);
  return color ? color.name : null;
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

export function ColorInput({
  value,
  onChange,
  label = "Colors",
  placeholder = "#FF0000, #00FF00, #0000FF",
  className,
}: ColorInputProps) {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];
  
  // Normalize value to Color[] format
  const normalizedValue = normalizeValue(safeValue);
  
  // State for entries - initialize from normalized value
  const [entries, setEntries] = useState<ColorEntry[]>(() => {
    return normalizedValue.map((color, index) => ({
      ...color,
      id: `color-${index}-${Date.now()}`,
      isValid: isValidHexColor(color.hex),
    }));
  });

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    // Only update if value is a valid array and different from current entries
    if (!Array.isArray(value)) return;
    
    // Ensure we don't have an infinite loop by checking if values are actually different
    const currentValueStr = JSON.stringify(value);
    const entriesValue = entries.map(e => ({ hex: e.hex, name: e.name }));
    const entriesValueStr = JSON.stringify(entriesValue);
    if (currentValueStr === entriesValueStr) return;
    
    const normalizedValue = normalizeValue(value);
    
    const newEntries = normalizedValue.map((color: Color, index: number) => ({
      ...color,
      id: entries[index]?.id || `color-${index}-${Date.now()}`,
      isValid: isValidHexColor(color.hex),
    }));
    setEntries(newEntries);
  }, [value]);

  // Helper to update parent - using ref to prevent infinite loops
  const isUpdatingRef = useRef(false);
  
  const updateParent = (newEntries: ColorEntry[]) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    const colors: Color[] = newEntries.map(e => ({ hex: e.hex, name: e.name }));
    onChange(colors);
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const handleAddFromInput = () => {
    if (!inputValue.trim()) return;

    const hexCodes = inputValue.split(",").map(c => c.trim()).filter(Boolean);
    const newEntries: ColorEntry[] = [];

    hexCodes.forEach((code) => {
      const hex = code.startsWith("#") ? code : `#${code}`;
      const normalizedHex = normalizeHex(hex);
      
      if (!isValidHexColor(normalizedHex)) return;
      
      // Check if already exists
      if (entries.some(e => e.hex.toLowerCase() === normalizedHex.toLowerCase())) return;
      
      // Get name from library or use hex as fallback
      const libraryName = getLibraryColorName(normalizedHex);
      const displayName = libraryName || normalizedHex;
      
      newEntries.push({
        id: `color-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        hex: normalizedHex,
        name: displayName,
        isValid: true,
      });
    });

    if (newEntries.length > 0) {
      setEntries(prev => [...prev, ...newEntries]);
    }
    
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFromInput();
    }
  };

  const updateEntryName = (id: string, newName: string) => {
    const newEntries = entries.map(entry => 
      entry.id === id ? { ...entry, name: newName } : entry
    );
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const removeEntry = (id: string) => {
    const newEntries = entries.filter(entry => entry.id !== id);
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const addColor = () => {
    const newId = `color-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newEntries = [...entries, {
      id: newId,
      hex: "#000000",
      name: "Black",
      isValid: true,
    }];
    setEntries(newEntries);
    updateParent(newEntries);
    // Focus the new color's name input after render
    setTimeout(() => {
      document.getElementById(`color-name-${newId}`)?.focus();
    }, 0);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Label */}
      <Label className="text-xs uppercase tracking-wider">{label}</Label>

      {/* Input for adding new colors */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-20"
        />
        <button
          type="button"
          onClick={handleAddFromInput}
          disabled={!inputValue.trim()}
          className="absolute right-1 top-1 h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      {/* Color List */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Colors ({entries.length})
            </span>
            <button
              type="button"
              onClick={addColor}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Custom
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
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
                  {/* Hex Code */}
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

                  {/* Name Input - User can customize */}
                  <input
                    id={`color-name-${entry.id}`}
                    type="text"
                    value={entry.name}
                    onChange={(e) => updateEntryName(entry.id, e.target.value)}
                    placeholder="Enter color name..."
                    className={cn(
                      "w-full text-sm bg-transparent border-b border-transparent focus:border-primary outline-none py-0.5 transition-colors",
                      "placeholder:text-muted-foreground/50",
                      entry.isValid ? "text-foreground" : "text-destructive/70"
                    )}
                  />
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
        </div>
      )}
    </div>
  );
}
