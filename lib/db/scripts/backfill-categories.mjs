import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const products = await pool.query(
    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND TRIM(category) <> ''",
  );

  const slugify = (input) =>
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

  let inserted = 0;

  for (const row of products.rows) {
    const name = row.category.trim();
    const slug = slugify(name);
    if (!slug) continue;

    const result = await pool.query(
      "INSERT INTO categories (name, slug, is_active, created_at, updated_at) VALUES ($1, $2, true, NOW(), NOW()) ON CONFLICT (slug) DO NOTHING RETURNING id",
      [name, slug],
    );

    if (result.rowCount) inserted += 1;
  }

  const total = await pool.query("SELECT COUNT(*)::int AS count FROM categories");

  console.log(
    JSON.stringify(
      {
        distinctProducts: products.rowCount,
        inserted,
        totalCategories: total.rows[0].count,
      },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
