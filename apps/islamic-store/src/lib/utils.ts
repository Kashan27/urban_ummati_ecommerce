import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductSlug(name: string, id: number | string) {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/-+/g, "-") // remove multiple -
    .trim();
  return `${base}-${id}`;
}

export function getProductIdFromSlug(slug: string) {
  const parts = slug.split("-");
  return parts[parts.length - 1];
}
