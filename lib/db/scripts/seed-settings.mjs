import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  console.log("Seeding settings...");
  
  const settings = [
    { key: "upsell_discount_percent", value: "20" },
    { key: "free_shipping_threshold", value: "75" },
    { key: "standard_shipping_cost", value: "15" },
    { key: "tax_percent", value: "13" },
  ];

  for (const s of settings) {
    await pool.query(
      "INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO NOTHING",
      [s.key, s.value]
    );
  }

  console.log("Seeding complete!");
} catch (error) {
  console.error("Seeding failed:", error);
  process.exit(1);
} finally {
  await pool.end();
}
