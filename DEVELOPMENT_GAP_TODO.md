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
  - Current: URL/path strings still supported, plus upload is now implemented.
  - Progress: `POST /api/admin/uploads/product-image` uploads to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (returns a public blob URL). In dev (no token), it falls back to saving under `public/uploads/products` and returns a `/uploads/...` URL.
  - Pending: end-to-end verification on Vercel (upload → blob URL → save product → storefront loads blob image).

- [x] Add collections as a separate module from categories.
  - Evidence: `pnpm --filter @workspace/db run push-force` (no pending changes) + `curl http://localhost:3009/api/collections` and `/api/collections/ramzan-special/products?...` return data; admin page `/admin/collections` and storefront pages `/collections`, `/collections/[slug]` are built.

### 2. Free Product And Offer Flow

- [x] Reject invalid free-product tokens during order creation.
  - Evidence: `/api/orders` returns 400 when `freeProductToken` is provided but not found.

- [x] Reject reused free-product tokens during order creation.
  - Evidence: `/api/orders` returns 409 when token has `usedByEmail/usedAt` or cannot be atomically consumed.

- [x] Enforce duplicate free-product prevention by email in checkout/order creation.
  - Evidence: `/api/orders` returns 409 if email already has any order or any used free-product link (case-insensitive).

- [x] Enforce one specific free product at API level.
  - Evidence: `/api/orders` requires cart to contain exactly one matching `productId` with quantity 1 for the token’s product.

- [x] Persist and enforce advanced free-link rules.
  - Evidence: Updated `free_product_links` schema with status, type, usage limits, and expiry. Added `free_product_redemptions` table. Updated API routes and frontend (`Admin.tsx`, `Cart.tsx`, `FreeProduct.tsx`) to enforce these rules. Verified with `pnpm run typecheck` and database push.

- [ ] Add admin controls for "First Product Free" offer rules.
  - Current: admin can generate links with advanced rules (usage limit, expiry, status, type) and view redemptions history.
  - Required: add global rules/eligibility/override management if needed beyond per-link rules.

### 3. Upsell Management

- [x] Storefront upsell modal with discount display.
  - Evidence: Implemented `UpsellModal.tsx` and integrated with `CartContext`.
  - Fix: Resolved recursive popup issue by adding `skipUpsell` option to `addItem`, preventing "upsell fatigue" when adding items from the modal.

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

- [x] Add Stripe Checkout or PaymentIntent flow.
  - Evidence: `POST /api/payments/stripe/checkout-session` creates Checkout Session and redirects; dummy card success.
- [x] Add secure payment confirmation webhooks.
  - Evidence: `POST /api/payments/stripe/webhook` updates `orders.payment_status` on `checkout.session.completed` using `stripe listen --forward-to localhost:3009/api/payments/stripe/webhook`.
- [x] Persist payment provider IDs and payment status.
  - Evidence: `orders.payment_provider`, `orders.payment_status`, `orders.stripe_checkout_session_id`, `orders.stripe_payment_intent_id`, `orders.paid_at` populated.
- [x] Add failed-payment handling and retry path.
  - Evidence: `POST /api/payments/stripe/retry-session` + Checkout “Retry Payment” button when `?canceled=1&orderId=...`.
- [x] Connect checkout completion to order confirmation only after payment success, unless COD/manual payment is explicitly agreed.
  - Evidence: Stripe Checkout success returns to `/order-confirmation/[id]`; cart is cleared only when order is paid/free.

### 2. ShipStation Shipping Integration

- [x] Create ShipStation integration service.
  - Evidence: `/app/api/integrations/shipstation/service.ts` implements Basic Auth client, create order, and list shipments.
- [x] Sync confirmed paid orders to ShipStation.
  - Evidence: Stripe webhook `/api/payments/stripe/webhook` calls ShipStation sync after marking order paid.
- [x] Store external ShipStation order/shipment IDs.
  - Evidence: `orders.shipstation_order_id` + shipment/tracking columns are persisted after sync/refresh.
- [x] Pull or receive shipment updates.
  - Evidence: Admin `POST /api/admin/shipstation/poll` and `GET /api/orders/[id]/shipstation` refresh from ShipStation shipments endpoint.
- [x] Map shipment updates to local order statuses.
  - Evidence: refresh sets `orders.status_id=3` and `orders.shipped_at` when ShipStation tracking/shipDate exists.

### 3. Collections

- [x] Create collections schema.
  - Evidence: `lib/db/src/schema/collections.ts` + `pnpm --filter @workspace/db run push-force` (no pending changes).
- [x] Add product-to-collection relationship.
  - Evidence: `lib/db/src/schema/product_collections.ts` + `curl http://localhost:3009/api/collections/ramzan-special/products?limit=1&offset=0`.
- [x] Add admin collection CRUD.
  - Evidence: `/api/admin/collections` + `/api/admin/collections/[id]` + admin UI at `/admin/collections`.
- [x] Add storefront collection browsing/filtering.
  - Evidence: `/collections` + `/collections/[slug]` + `GET /api/collections`.
- [x] Avoid storing collection names directly on product rows.
  - Evidence: products accept `collectionIds` and relationships persist via join table (no collection name field on products).

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
- [x] Add footer social platform links.
  - Evidence: `apps/islamic-store/app/api/social-platforms/route.ts` + `apps/islamic-store/src/components/layout/Footer.tsx`; `curl -sSf http://localhost:3009/api/social-platforms`

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
