/**
 * Utility functions for color handling
 * Uses color-name-list library for 30,000+ color names
 */

import { colornames } from "color-name-list";

/**
 * Get friendly name for a color from the library
 * @param color - Hex color code (e.g., "#FF0000")
 * @returns Friendly color name (e.g., "Red") or the hex code if not found
 */
export function getColorName(color: string): string {
  if (!color || typeof color !== "string") return "";

  // If it's not a hex code, return as-is (it's already a friendly name)
  if (!color.startsWith("#")) {
    return color.charAt(0).toUpperCase() + color.slice(1);
  }
  
  // Normalize the hex color
  const normalized = normalizeHexColor(color.toLowerCase());
  
  // Look up in the color-name-list library (30,000+ colors)
  const colorData = colornames.find(c => c.hex.toLowerCase() === normalized);
  
  if (colorData) {
    return colorData.name;
  }
  
  // If not found in library, return the hex code (no auto-generated names like "Greenish")
  return normalized || color;
}

/**
 * Check if a color name exists in the library
 * @param color - Hex color code
 * @returns true if the color exists in the library
 */
export function isKnownColor(color: string): boolean {
  if (!color || !color.startsWith("#")) return false;
  
  const normalized = normalizeHexColor(color.toLowerCase());
  return colornames.some(c => c.hex.toLowerCase() === normalized);
}

/**
 * Normalize hex color to 6-digit format
 */
function normalizeHexColor(hex: string): string | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  // Validate 6-digit hex
  if (hex.length !== 6 || !/^[0-9A-F]{6}$/i.test(hex)) {
    return null;
  }
  
  return '#' + hex.toUpperCase();
}

/**
 * Check if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Get all colors from the library (useful for autocomplete)
 * @returns Array of color objects with name and hex
 */
export function getAllColors(): { name: string; hex: string }[] {
  return colornames.map(c => ({ name: c.name, hex: c.hex }));
}

/**
 * Search for colors by name (useful for autocomplete)
 * @param query - Search query
 * @returns Array of matching colors
 */
export function searchColors(query: string): { name: string; hex: string }[] {
  const lowerQuery = query.toLowerCase();
  return colornames
    .filter(c => c.name.toLowerCase().includes(lowerQuery))
    .slice(0, 20) // Limit to 20 results
    .map(c => ({ name: c.name, hex: c.hex }));
}
