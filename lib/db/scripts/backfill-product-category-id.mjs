import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query(
    "INSERT INTO categories (name, slug, is_active, created_at, updated_at) VALUES ('Uncategorized', 'uncategorized', true, NOW(), NOW()) ON CONFLICT (slug) DO NOTHING",
  );

  const updateResult = await pool.query(`
    UPDATE products p
    SET category_id = c.id
    FROM categories c
    WHERE p.category_id IS NULL
      AND (
        lower(trim(p.category)) = lower(trim(c.name))
        OR lower(trim(p.category)) = lower(trim(c.slug))
      )
  `);

  const uncategorized = await pool.query(
    "SELECT id FROM categories WHERE slug = 'uncategorized' LIMIT 1",
  );
  const uncategorizedId = uncategorized.rows[0]?.id;

  let fallbackAssigned = 0;
  if (uncategorizedId) {
    const fallback = await pool.query(
      "UPDATE products SET category_id = $1 WHERE category_id IS NULL",
      [uncategorizedId],
    );
    fallbackAssigned = fallback.rowCount || 0;
  }

  const counts = await pool.query(
    "SELECT COUNT(*)::int AS total, COUNT(category_id)::int AS with_category_id FROM products",
  );

  console.log(
    JSON.stringify(
      {
        matchedFromExistingCategories: updateResult.rowCount || 0,
        fallbackAssignedToUncategorized: fallbackAssigned,
        totalProducts: counts.rows[0]?.total || 0,
        withCategoryId: counts.rows[0]?.with_category_id || 0,
      },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
