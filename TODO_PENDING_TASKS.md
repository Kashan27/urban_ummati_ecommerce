# Islamic Decor E-Commerce Pending Tasks

This file tracks remaining work against the agreed specification:

**Source document (Client: Syed Ali — Islamic Products E‑Commerce, Canada):**  
`attached_assets/Islamic_Decor_Ecommerce_(1)_1775774173478.docx` — *Website Functional Specification & Agreement*

Section headings below labelled **§5.x** quote **§5 Admin Panel Functionalities** from that document verbatim.

## Rules

- Move tasks from **Pending** to **Done** only after code **and** verification are complete.
- Keep scope aligned to the document unless mutually changed with the client.

---

## Pending

### 1. Payments (Stripe) — doc §4.8, §6

- [x] Add Stripe Checkout / PaymentIntent flow. *(verified: checkout redirects to Stripe via `/api/payments/stripe/checkout-session`; dummy card success)*
- [x] Add secure server-side payment confirmation (webhooks). *(verified: `stripe listen --forward-to localhost:3009/api/payments/stripe/webhook` updates order payment status)*
- [x] Persist payment status with the order. *(verified: `orders.payment_status`, Stripe session/intent IDs persisted)*
- [x] Add failed-payment handling and retry path. *(verified: `/api/payments/stripe/retry-session` + Checkout “Retry Payment” button)*

### 2. Shipping Integration (ShipStation) — doc §4.9, §6

- [x] Create ShipStation integration service. *(implemented: ShipStation client/service in `/app/api/integrations/shipstation/service.ts`)*
- [x] Sync confirmed orders to ShipStation automatically. *(verified: Stripe webhook triggers ShipStation sync on `checkout.session.completed`)*
- [x] Store external shipment identifiers on order records. *(verified: `orders.shipstation_order_id` + shipment/tracking fields persisted)*
- [x] Pull shipping updates and map them to local order statuses. *(verified: admin endpoints refresh/poll shipments and set local status to shipped when tracking/shipDate present)*

### 3. Free Product Flow Hardening — doc §3 additional requirements, §4.5

- [x] Enforce one specific free product at a time at API level (document scope). *(verified via server validation in `/api/orders`)* 
- [x] Consume `freeProductToken` on order placement (`usedByEmail`, `usedAt` on link / order). *(verified: token consumption is atomic in `/api/orders` transaction)* 
- [x] Reject reused or invalid tokens during order creation. *(verified: 400 invalid token, 409 reused token)*
- [x] Ensure free-product link can land customer on cart with tokenized context. *(verified: promo link copies to `/cart?promoToken=...` and cart auto-adds the item with token)*
- [x] Keep duplicate prevention by email fully enforced on checkout. *(verified: `/api/orders` blocks duplicate email claims)*

### 4. Admin Panel — **document §5 Admin Panel Functionalities** (Syed Ali)

#### §5.1 Product management *(document wording)*

- [x] Add / edit products (admin UI + APIs).
- [x] Delete products from **admin UI** *(backend: `DELETE /api/admin/products/[id]` exists; UI button added).*
- [x] Manage pricing (admin).
- [x] Product images via **URL list** in admin *(document also implies upload; true file upload TBD below).*
- [x] **Upload** product images (file storage + admin upload). *(verified: supports Vercel Blob and local fallback).*
- [x] **Categories** — management UI + APIs.
- [x] **Normalized statuses** — Statuses are stored in a separate table (`order_statuses`) using IDs in the `orders` table.
- [x] **Soft Delete & Normalization** — Products and categories use active/inactive/archived status instead of hard delete; products use categoryId without redundant text columns.
- [x] **Collections** — separate from categories: data model + admin UI + APIs *(verified: `pnpm --filter @workspace/db run push-force` (no pending changes) + `curl http://localhost:3009/api/collections` and `/api/collections/ramzan-special/products?...` return expected data).*

#### §5.2 Offer management *(document wording)*

- [x] **Manage “First Product Free” logic** in admin including link generation with rules (single/multi-use, expiry, status).
- [x] **Track users who have used the offer** — admin visibility: list/report of redemptions per link in Promo section.
- [x] Generate shareable free-product links (multi-use supported).
- [x] Link / offer **usage ledger** in admin aligned with §5.2 tracking requirement (via Redemptions history).

#### §5.3 Upsell management *(document wording)*

- [x] **Configure upsell products** — dedicated admin flows *(added UpsellSection).*
- [x] **Set discount percentages** — admin-level control matching doc §4.6 *(global and product-level supported).*
- [x] Storefront upsell modal with discount display *(customer-facing §4.6).*

#### §5.4 Order management *(document wording)*

- [x] **View all orders** — admin orders view uses full list with filters and pagination.
- [x] **Access order details** — dedicated order detail view (line items, customer, totals, timeline).
- [x] **Basic status tracking** — status can be updated *(dashboard + orders table; limited list).*
- [x] **Order status flow:** Received → Processed → Shipped *(implemented in UI/API for rows shown).*
- [x] **Additional logic — receipt printed → set status to Processed** *(implemented in Admin UI).*
- [x] **Clean Printing** — Print logic only prints the receipt layout, hiding the sidebar and dashboard.
- [x] **Additional logic — ShipStation:** fetch / display sync; map **Processed → Shipped** from carrier data.
- [x] **Promotional logic (admin + rules engine):** Spend **X** → Free Shipping; Spend **X** → Free Product *(implemented in settings and Cart).*

#### Admin cross-cutting (security / contract)

- [x] Replace hardcoded admin login with secure session *(cookie + DB admins; document assumes protected admin).*
- [x] **Password storage** — use strong hashing for admin passwords at rest *(scrypt-based hashing implemented).*
- [x] **Admin user management UI/API** (list/create/deactivate admin accounts).

### 5. Checkout & Tax / Shipping — doc §4.7, §5.4 promos

- [x] Make shipping and tax rules configurable from admin/settings *(doc: tax by country e.g. 13%, shipping cost shown).*
- [x] Validate country-based tax behavior as documented (Canada / 13% flow).
- [x] Server-side totals as source of truth for every order.

### 6. Content / Legal — doc §4.1 footer

- [x] Privacy Policy — working route/page.
- [x] Terms & Conditions — working route/page.
- [x] Contact — working route/page + usable contact behavior. *(verified: `/contact` route added and builds; includes mailto-based contact form)*
- [x] Footer: social platforms links (placeholders or real URLs). *(verified: `curl -sSf http://localhost:3009/api/social-platforms`; rendered by `src/components/layout/Footer.tsx`)*

### 7. Reliability & QA

- [ ] Integration tests: orders, promo, admin status updates.
- [ ] E2E: home → cart → checkout → payment → confirmation.
- [x] Regression: free product and upsell behavior. *(verified: automated free gifts don't trigger upsell loops).*

---

## Done

*(Only after verification.)*

- [x] Base storefront flow: home, product catalog, detail, cart, checkout UI, confirmation *(doc §3–4 storefront path).*
- [x] Admin: secure session auth; routing for dashboard, products, categories, orders, promo *(doc §5 structure; partial §5 completion).*
- [x] Admin: full orders list with status filtering and pagination *(doc §5.4).*
- [x] Admin: normalized order statuses using separate table and status IDs *(doc §5.4).*
- [x] Admin: automatic status transition to "Processed" on receipt printing *(doc §5.4).*
- [x] Admin: secure password storage using scrypt hashing.
- [x] Product create/edit/delete, pricing, category CRUD, active/inactive product toggle, image **URLs** in admin.
- [x] Offer management: link generation and usage ledger/tracking in admin.
- [x] Admin dashboard stats + **recent** orders with status updates *(partial vs §5.4 “view all”).*
- [x] Upsell modal on storefront with discount display *(doc §4.6 customer side).*
- [x] Free-product link generation + token validation endpoints *(scaffold; hardening in §3 above).*
- [x] Configurable tax/shipping rules and promotional thresholds (admin + storefront).
- [x] Dedicated Upsell Management section in Admin.
- [x] Admin User Management (list/create/deactivate).
- [x] Privacy Policy and Terms & Conditions pages.

---

## Quick reference: doc §5 → this file

| Document (Syed Ali) | Task group in this file |
|---------------------|-------------------------|
| §5.1 Product management | §5.1 under **4. Admin Panel** |
| §5.2 Offer management | §5.2 under **4. Admin Panel** |
| §5.3 Upsell management | §5.3 under **4. Admin Panel** |
| §5.4 Order management | §5.4 under **4. Admin Panel** |

Stripe, ShipStation, checkout/tax, and free-product hardening are tied to **§1, §2, §3, §5** elsewhere in the document; they stay in sections **1–3 and 5** above.
