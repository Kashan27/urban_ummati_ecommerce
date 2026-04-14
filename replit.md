# Workspace

## Overview

Noor Islamic Decor — a full-stack Islamic products e-commerce platform targeting the Canadian market, visually inspired by Wall Art Istanbul. Built with Next.js App Router + PostgreSQL backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: Next.js App Router (`artifacts/islamic-store`) at path `/`
- **API framework**: Next.js Route Handlers (`artifacts/islamic-store/app/api`) at path `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: Next.js build pipeline

## Application Features

- **Homepage**: Hero banner, promotional bar, featured products grid, categories, testimonials, footer
- **Product Catalog**: Grid-based listing with category filtering, star ratings, color swatches
- **Product Detail**: Image gallery, description, color selection, Add to Cart, upsell popup
- **Cart**: localStorage-based cart management, quantity controls, order summary
- **Checkout**: Full form (name, email, phone, address), province selector, shipping/tax calculation
- **Order Confirmation**: Thank you page with order details
- **Free Product Flow**: `/free-product/:token` — token-based free product claims
- **Admin Panel**: Password-protected (`admin` / `admin123`), stats, product CRUD, order management, free link generator

## Design

- Color palette: warm cream background, dark olive green (`#4a5c3f`), gold accent
- Fonts: Playfair Display (headings/logo), Lato (body)
- Inspired by: Wall Art Istanbul (as.wallartistanbul.co)

## Database Schema

- `products` — Islamic products with category, price, colors, featured/upsell flags
- `orders` — Customer orders with items (JSONB), shipping, tax, status flow
- `free_product_links` — Single-use tokens for free product promotions

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm -C artifacts/islamic-store run dev` — run Next.js app locally (frontend + API)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
