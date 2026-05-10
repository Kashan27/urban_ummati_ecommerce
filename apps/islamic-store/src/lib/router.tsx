"use client";

import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useSearchParams,
} from "next/navigation";
import type { ComponentProps } from "react";

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

export function Link({ href, ...props }: LinkProps) {
  return <NextLink href={href} {...props} />;
}

export const useRouter = useNextRouter;
export const usePathname = useNextPathname;

export function useLocation(): [string, (to: string) => void] {
  const pathname = useNextPathname();
  const searchParams = useSearchParams();
  const router = useNextRouter();

  const search = searchParams?.toString() ?? "";
  const path = pathname ?? "/";
  const location = search ? `${path}?${search}` : path;

  return [location, (to: string) => router.push(to)];
}

export function useSearch(): string {
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  return search ? `?${search}` : "";
}

export function useParams<T extends Record<string, string>>() {
  const params = useNextParams();
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params ?? {})) {
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (typeof firstValue === "string") {
      normalized[key] = firstValue;
    }
  }

  return normalized as T;
}
