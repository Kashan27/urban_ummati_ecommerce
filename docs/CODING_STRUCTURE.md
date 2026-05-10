# Project Coding Structure

This document outlines the architecture and coding conventions for the Urban Ummati Islamic E-commerce project.

## 🏗 Monorepo Overview
The project is a monorepo managed by **pnpm**.

- **`apps/`**: Contains the end-user applications.
  - **`islamic-store/`**: The main Next.js 15 e-commerce application.
- **`lib/`**: Shared libraries and utilities.
  - **`db/`**: Drizzle ORM schema and database connection logic.
  - **`api-spec/`**: OpenAPI specification and Orval configuration for code generation.
  - **`api-client-react/`**: Generated React Query hooks for API interaction.
  - **`api-zod/`**: Generated Zod schemas for API validation.
- **`scripts/`**: Maintenance and automation scripts.

---

## 💻 Frontend & API (apps/islamic-store)

### Frameworks & Libraries
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router).
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/).
- **UI Components**: Radix UI primitives with [Shadcn UI](https://ui.shadcn.com/) patterns.
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query) via `@workspace/api-client-react`.
- **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation.

### Directory Structure
- **`app/`**: Next.js App Router.
  - **`api/`**: Next.js Route Handlers (Backend API).
  - **`[route]/`**: Page routes. Typically, these files only import and render a "View" component from `src/views/`.
- **`src/`**: Core application logic.
  - **`components/`**: Reusable UI components.
    - `ui/`: Base primitives (mostly Shadcn).
    - `layout/`: Global layout components like Header, Footer, Sidebar.
    - `admin/`: Components specific to the admin dashboard.
    - `cart/`: Cart-related components.
  - **`hooks/`**: Custom React hooks.
  - **`lib/`**: Shared utilities, formatters, and context providers.
  - **`views/`**: The primary content for each page route. This separation keeps the `app/` directory clean and focuses on routing.

---

## 🗄 Database (lib/db)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/).
- **Database**: PostgreSQL.
- **Schema Management**:
  - Schemas are defined in `src/schema/` in a modular fashion (e.g., `products.ts`, `orders.ts`).
  - All schemas are exported from `src/schema/index.ts`.
- **Connection**: Managed in `src/index.ts` using `pg` Pool.

---

## 🔌 API Specification & Generation (lib/api-spec)
The project follows an **API-First** approach.
1. **Define**: The API is defined in `openapi.yaml`.
2. **Generate**: [Orval](https://orval.dev/) is used to generate type-safe clients and validation schemas.
   - Outputs to `@workspace/api-client-react` (React Query hooks).
   - Outputs to `@workspace/api-zod` (Zod validation).

---

## 🛠 Development Workflow

### Scripts
- `pnpm dev`: Starts the Next.js development server.
- `pnpm build`: Builds the entire monorepo.
- `pnpm typecheck`: Runs TypeScript compiler check across all packages.

### Coding Conventions
- **Type Safety**: Use TypeScript for everything. Avoid `any`.
- **API Interaction**: Use the generated hooks from `@workspace/api-client-react` instead of raw `fetch`.
- **Validation**: Use Zod schemas from `@workspace/api-zod` for validating API responses and form inputs.
- **Components**: Prefer functional components and React hooks. Use Tailwind CSS for styling.
- **Separation of Concerns**: Keep business logic in hooks or utility files, and keep components focused on UI. Use the "Views" pattern to keep page-level logic organized.
