import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  console.log("Seeding order statuses...");
  
  const statuses = [
    { id: 1, name: "received" },
    { id: 2, name: "processed" },
    { id: 3, name: "shipped" },
    { id: 4, name: "delivered" },
    { id: 5, name: "canceled" },
  ];

  for (const status of statuses) {
    await pool.query(
      "INSERT INTO order_statuses (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
      [status.id, status.name]
    );
  }

  console.log("Seeding complete!");
} catch (error) {
  console.error("Seeding failed:", error);
  process.exit(1);
} finally {
  await pool.end();
}
