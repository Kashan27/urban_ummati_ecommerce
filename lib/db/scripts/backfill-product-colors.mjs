import pg from "pg";

const { Client } = pg;

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL must be set");
// }
const connectionString = "postgresql://neondb_owner:npg_evO2dBIkDuf7@ep-sweet-night-aow7up8a-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const client = new Client({ connectionString: connectionString });

async function main() {
  await client.connect();

  const summary = {
    scannedProducts: 0,
    insertedRows: 0,
    skippedProducts: 0,
    badRows: 0,
  };

  await client.query("begin");

  try {
    const { rows: products } = await client.query(`
      select id, colors from products
      where colors is not null and jsonb_array_length(colors) > 0
      order by id asc
    `);

    summary.scannedProducts = products.length;

    for (const product of products) {
      const existing = await client.query(
        "select 1 from product_colors where product_id = $1 limit 1",
        [product.id],
      );

      if (existing.rowCount > 0) {
        summary.skippedProducts += 1;
        continue;
      }

      const colors = product.colors;
      if (!Array.isArray(colors)) {
        summary.badRows += 1;
        continue;
      }

      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        if (!color || typeof color.hex !== "string" || typeof color.name !== "string") {
          summary.badRows += 1;
          continue;
        }

        await client.query(
          `insert into product_colors (product_id, hex, name, sort_order, created_at, updated_at)
           values ($1, $2, $3, $4, now(), now())`,
          [product.id, color.hex, color.name, i],
        );
        summary.insertedRows += 1;
      }
    }

    await client.query("commit");

    console.log("Backfill product_colors complete:");
    console.log(`  Scanned products: ${summary.scannedProducts}`);
    console.log(`  Inserted rows:    ${summary.insertedRows}`);
    console.log(`  Skipped products: ${summary.skippedProducts}`);
    console.log(`  Bad rows:         ${summary.badRows}`);
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
