import pg from "pg";

const { Client } = pg;

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL must be set");
// }
const connectionString = "postgresql://neondb_owner:npg_evO2dBIkDuf7@ep-sweet-night-aow7up8a-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const client = new Client({ connectionString });

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
      select id, images from products
      where images is not null and jsonb_array_length(images) > 0
      order by id asc
    `);

    summary.scannedProducts = products.length;

    for (const product of products) {
      const existing = await client.query(
        "select 1 from product_images where product_id = $1 limit 1",
        [product.id],
      );

      if (existing.rowCount > 0) {
        summary.skippedProducts += 1;
        continue;
      }

      const images = product.images;
      if (!Array.isArray(images)) {
        summary.badRows += 1;
        continue;
      }

      for (let i = 0; i < images.length; i++) {
        const url = images[i];
        if (typeof url !== "string" || url.length === 0) {
          summary.badRows += 1;
          continue;
        }

        await client.query(
          `insert into product_images (product_id, url, sort_order, created_at, updated_at)
           values ($1, $2, $3, now(), now())`,
          [product.id, url, i],
        );
        summary.insertedRows += 1;
      }
    }

    await client.query("commit");

    console.log("Backfill product_images complete:");
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
