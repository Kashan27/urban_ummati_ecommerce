"use client";

import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import type { ComponentProps } from "react";

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

export function Link({ href, ...props }: LinkProps) {
  return <NextLink href={href} {...props} />;
}

export function useLocation(): [string, (to: string) => void] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.toString();
  const location = search ? `${pathname}?${search}` : pathname;

  return [location, (to: string) => router.push(to)];
}

export function useSearch(): string {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  return search ? `?${search}` : "";
}

export function useParams<T extends Record<string, string>>() {
  const params = useNextParams();
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }

  return normalized as T;
}
