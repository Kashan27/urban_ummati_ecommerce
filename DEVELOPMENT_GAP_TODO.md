# Development Gap Todo

This file tracks modules that are partially developed or not developed yet.
It complements `TODO_PENDING_TASKS.md`, which remains the main spec-aligned checklist.

## Codex Agent Instructions

- At the start of every prompt in this repository, read both:
  - `TODO_PENDING_TASKS.md`
  - `DEVELOPMENT_GAP_TODO.md`
- If the user asks what to do next, choose the next unchecked item from these files unless they specify a different priority.
- Move an item from `[ ]` to `[x]` only after implementation and verification are complete.
- When marking an item done, add a short evidence note with the file, route, command, or test used to verify it.
- If a task is only partly completed, keep it unchecked and update the progress note instead.
- If a task overlaps with `TODO_PENDING_TASKS.md`, update both files so status does not drift.
- Do not hard delete business records. Implement active/inactive, archived, disabled, or cancelled states instead.
- For Drizzle schemas, keep data normalized with real foreign keys via `.references()`, snake_case database names, camelCase TypeScript property names, `createdAt`, and `updatedAt`.

## Current Verification Blockers

- [x] Fix workspace typecheck duplicate exports in `lib/api-zod/src/index.ts`.
  - Required: avoid ambiguous `export *` collisions between generated Zod schemas and generated TypeScript types.
  - Evidence: `pnpm run typecheck` passes after replacing the generated type barrel export with explicit type exports/aliases.

- [x] Fix Next.js 15 route handler context typings.
  - Required: dynamic API route handlers should use Next 15-compatible async params, for example `context: { params: Promise<{ id: string }> }`.
  - Affected routes include admin products/categories, orders, order status, product detail API, and free-product token API.
  - Evidence: `pnpm run typecheck` and `pnpm --filter @workspace/islamic-store run build` pass.

- [x] Fix app-level TypeScript errors.
  - Required: resolve router nullability in `src/lib/router.tsx`.
  - Required: align `PromoSection` props with `Admin.tsx` usage.
  - Required: fix `ProductDetail.tsx` usage of `categoryName` when product type exposes `category`.
  - Evidence: `pnpm run typecheck` and `pnpm --filter @workspace/islamic-store run build` pass.

## Partially Developed Modules

### 1. Product And Category Management

- [x] Replace hard delete with inactive/archived behavior for products.
  - Evidence: Updated `DELETE /api/admin/products/[id]` to set `status = 'archived'`. Added `archived` to `productsTable` status enum.

- [x] Replace hard delete with inactive/archived behavior for categories.
  - Evidence: Updated `DELETE /api/admin/categories/[id]` to set `isActive = false`.

- [x] Complete product schema normalization.
  - Evidence: Removed `category` column from `productsTable`. Updated all API routes and frontend to use `categoryId` with joins.

- [x] Add `updatedAt` to products and update it on product changes.
  - Evidence: Added `updatedAt` to `productsTable` and `ordersTable`. Updated `PUT` routes to refresh `updatedAt`.

- [ ] Add real product image upload/storage.
  - Current: admin product form accepts URL/path strings.
  - Required: add file upload API, storage target, saved asset URL/path, validation, and admin UI upload control.

- [ ] Add collections as a separate module from categories.
  - Current: no collection schema, admin UI, API, or storefront filtering.
  - Required: create normalized collection tables and product relationship, then expose admin CRUD and storefront use.

### 2. Free Product And Offer Flow

- [x] Reject invalid free-product tokens during order creation.
  - Evidence: `/api/orders` returns 400 when `freeProductToken` is provided but not found.

- [x] Reject reused free-product tokens during order creation.
  - Evidence: `/api/orders` returns 409 when token has `usedByEmail/usedAt` or cannot be atomically consumed.

- [x] Enforce duplicate free-product prevention by email in checkout/order creation.
  - Evidence: `/api/orders` returns 409 if email already has any order or any used free-product link (case-insensitive).

- [x] Enforce one specific free product at API level.
  - Evidence: `/api/orders` requires cart to contain exactly one matching `productId` with quantity 1 for the token’s product.

- [ ] Persist and enforce advanced free-link rules.
  - Current: admin promo UI contains concepts like link type, usage limit, expiry, status, and notes, but the current API/schema only persists token, product, and usage email/time.
  - Required: add schema/API support for link status, usage limit, current usage, expiry, notes, disable/archive, and update/delete actions.

- [ ] Add admin controls for "First Product Free" offer rules.
  - Current: admin can generate links and view usage, but there is no rules/eligibility/override management.
  - Required: admin should manage eligibility rules and exceptions according to the agreed business scope.

### 3. Upsell Management

- [ ] Create a dedicated upsell management module.
  - Current: upsells are controlled by product-level `isUpsell` and `upsellDiscount`.
  - Required: add admin flow for selecting upsell products/rules separately from normal product editing.

- [ ] Persist global upsell discount behavior consistently.
  - Current: admin settings include `upsell_discount_percent`, but storefront upsell pricing uses each product's `upsellDiscount`.
  - Required: define whether discount is global, per product, or per rule, then enforce the same behavior in UI and API.

- [ ] Add upsell targeting rules.
  - Current: upsell endpoint returns active upsell products; it does not model rule-based "if product/category X then suggest Y".
  - Required: add targeting schema/API/admin UI if product-specific upsells are required.

### 4. Order Management And Fulfillment

- [ ] Add ShipStation status integration into order status flow.
  - Current: admin can manually set Received, Processed, Shipped.
  - Required: sync carrier/shipment updates and map processed orders to shipped when ShipStation indicates shipment.

- [ ] Store external shipment identifiers.
  - Current: order schema does not store ShipStation order/shipment IDs.
  - Required: persist external IDs and expose them in admin order detail.

- [ ] Add promotional order rules engine.
  - Current: order totals only handle simple free shipping threshold and free-product discount.
  - Required: admin-configurable Spend X -> Free Shipping and Spend X -> Free Product rules.

- [ ] Add payment status to orders.
  - Current: orders store subtotal, shipping, tax, total, status, free-order flags, and discount, but not payment status.
  - Required: payment status should be persisted and visible in admin.

### 5. Checkout, Tax, And Shipping Rules

- [ ] Use admin settings as source of truth for checkout totals.
  - Current: checkout UI and order API hardcode free shipping threshold, shipping cost, and tax percentage.
  - Required: read settings server-side and keep client display aligned with server calculations.

- [ ] Validate country/province tax behavior.
  - Current: Canada and 13 percent tax are hardcoded.
  - Required: implement documented country/province tax rules or explicitly confirm the reduced scope.

- [ ] Make server-side totals authoritative.
  - Current: server recalculates basic totals, but settings and promo rules are incomplete.
  - Required: all final order totals must be computed and validated on the server.

### 6. Admin Security And User Management

- [ ] Add admin user management.
  - Current: login uses `admins` table, but there is no admin UI/API to create, view, disable, or reset admin accounts.
  - Required: add protected admin management flow or a documented setup command.

- [ ] Require a production-grade `ADMIN_SESSION_SECRET`.
  - Current: code falls back to `change-me-admin-session-secret` if env is missing.
  - Required: fail safely or document required env setup before production.

## Totally Required Modules Not Developed

### 1. Stripe Payments

- [ ] Add Stripe Checkout or PaymentIntent flow.
- [ ] Add secure payment confirmation webhooks.
- [ ] Persist payment provider IDs and payment status.
- [ ] Add failed-payment handling and retry path.
- [ ] Connect checkout completion to order confirmation only after payment success, unless COD/manual payment is explicitly agreed.

### 2. ShipStation Shipping Integration

- [ ] Create ShipStation integration service.
- [ ] Sync confirmed paid orders to ShipStation.
- [ ] Store external ShipStation order/shipment IDs.
- [ ] Pull or receive shipment updates.
- [ ] Map shipment updates to local order statuses.

### 3. Collections

- [ ] Create collections schema.
- [ ] Add product-to-collection relationship.
- [ ] Add admin collection CRUD.
- [ ] Add storefront collection browsing/filtering.
- [ ] Avoid storing collection names directly on product rows.

### 4. Product File Upload / Media Library

- [ ] Add upload endpoint.
- [ ] Add storage strategy.
- [ ] Add validation for file size/type.
- [ ] Add admin upload UI.
- [ ] Persist uploaded image metadata.

### 5. Legal And Content Pages

- [ ] Add Privacy Policy route/page.
- [ ] Add Terms and Conditions route/page.
- [ ] Add Contact route/page with usable contact behavior.
- [ ] Add Shipping and Delivery route/page if footer link remains.
- [ ] Add Returns and Exchanges route/page if footer link remains.
- [ ] Add footer social platform links.

### 6. Automated QA

- [ ] Add integration tests for order creation.
- [ ] Add integration tests for promo/free-product behavior.
- [ ] Add integration tests for admin status updates.
- [ ] Add regression tests for upsell behavior.
- [ ] Add E2E test for home -> product -> cart -> checkout -> payment -> confirmation.

## Done Log

Move completed items here only after code and verification are complete.

- [x] Initial gap tracker created from current repo audit.
  - Evidence: `DEVELOPMENT_GAP_TODO.md` created.
- [x] Current verification blockers cleared.
  - Evidence: `pnpm run typecheck` and `pnpm --filter @workspace/islamic-store run build` pass after API export, Next route typing, router, admin promo, and product detail fixes.
