Also check this /Users/kashanxensys/Desktop/Kashan/urban_ummati_ecommerce/TODO_PENDING_TASKS.md and /Users/kashanxensys/Desktop/Kashan/urban_ummati_ecommerce/DEVELOPMENT_GAP_TODO.md every time. Mark tasks done only after implementation and verification are complete, or choose the next pending task from these files.



When generating schema definitions using drizzle-orm/pg-core, you must strictly follow these normalization and relationship rules:

1. Mandatory Normalization (No Strings for Categories)
Foreign Keys: Never store descriptive attributes (like category_name) in a primary entity table. You must create a separate reference table.

Syntax: Use the .references() method to establish a database-level Foreign Key constraint.

2. Drizzle PostgreSQL Column Standards
Primary Keys: Use serial('id').primaryKey() or uuid('id').defaultRandom().primaryKey().

Foreign Keys: Use the singular parent table name suffixed with _id (e.g., category_id).

Timestamping: Always include createdAt and updatedAt columns using timestamp('created_at').defaultNow().

3. Naming Conventions
All table and column names must be snake_case inside the pgTable definition, while the TypeScript variable names should be camelCase.

✅ Correct Drizzle Implementation Pattern
If asked to create a product and category schema, follow this exact pattern:

TypeScript
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// 1. Define the reference table first
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

// 2. Define the main table with a Foreign Key reference
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});
Tip: If you also want the agent to generate the "Relational Queries" (the code that lets you fetch a product with its category easily), let me know—I can provide the relations block instructions for Drizzle as well!
note: items should be active or inactive don't hard delete
