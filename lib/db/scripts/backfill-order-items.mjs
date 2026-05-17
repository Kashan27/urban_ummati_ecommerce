// DEPRECATED: This script is historical only.
// The `orders.items` JSONB column has been dropped from the database.
// All order items are now stored in the normalized `order_items` table.
// This script cannot be run anymore as it references the removed column.

import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  await client.connect();

  const summary = {
    scannedOrders: 0,
    insertedRows: 0,
    skippedOrders: 0,
    badRows: 0,
  };

  await client.query("begin");

  try {
    const { rows: orders } = await client.query(`
      select id, items
      from orders
      order by id asc
    `);

    summary.scannedOrders = orders.length;

    for (const order of orders) {
      if (!Array.isArray(order.items) || order.items.length === 0) {
        summary.skippedOrders += 1;
        continue;
      }

      const existing = await client.query(
        "select 1 from order_items where order_id = $1 limit 1",
        [order.id],
      );

      if (existing.rowCount > 0) {
        summary.skippedOrders += 1;
        continue;
      }

      for (const item of order.items) {
        const productId = toNumber(item?.productId);
        const quantity = toNumber(item?.quantity);
        const unitPrice = toNumber(item?.price);
        const lineTotal = toNumber(item?.total);

        if (!productId || !quantity || unitPrice == null || lineTotal == null) {
          summary.badRows += 1;
          continue;
        }

        await client.query(
          `
            insert into order_items (
              order_id,
              product_id,
              product_name,
              product_image,
              color,
              unit_price,
              quantity,
              line_total,
              weight,
              length,
              width,
              height,
              updated_at
            ) values (
              $1, $2, $3, $4, $5,
              $6, $7, $8,
              $9, $10, $11, $12,
              now()
            )
          `,
          [
            order.id,
            productId,
            String(item?.productName || "Unknown Product"),
            item?.productImage ? String(item.productImage) : null,
            item?.color ? String(item.color) : null,
            String(unitPrice),
            quantity,
            String(lineTotal),
            item?.weight == null ? null : String(item.weight),
            item?.length == null ? null : String(item.length),
            item?.width == null ? null : String(item.width),
            item?.height == null ? null : String(item.height),
          ],
        );

        summary.insertedRows += 1;
      }
    }

    await client.query("commit");

    console.info("[order_items backfill] complete", summary);
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[order_items backfill] failed", err);
  process.exitCode = 1;
});
