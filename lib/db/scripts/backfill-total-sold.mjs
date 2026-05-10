import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  await client.query("begin");
  try {
    await client.query(`update products set total_sold = 0`);

    await client.query(`
      update products p
      set total_sold = coalesce(s.qty, 0)
      from (
        select
          (item->>'productId')::int as product_id,
          sum((item->>'quantity')::int) as qty
        from orders o,
          jsonb_array_elements(o.items) as item
        where (o.payment_status = 'paid' or o.paid_at is not null)
        group by 1
      ) s
      where p.id = s.product_id
    `);

    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

