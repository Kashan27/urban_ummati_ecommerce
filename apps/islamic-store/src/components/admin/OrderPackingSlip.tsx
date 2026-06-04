"use client";

import type { Order } from "@workspace/api-zod";

type Props = {
  order: Order | null;
};

export function OrderPackingSlip({ order }: Props) {
  if (!order) return null;

  return (
    <div className="print-only print-content">
      <div className="mx-auto max-w-2xl bg-white p-8 text-black font-sans">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">URBAN UMMATI</h1>
            <p className="mt-1 text-sm text-gray-500">Islamic Decor E-Commerce</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-400">Packing Slip</h2>
            <p className="text-xl font-bold text-foreground">#{order.id.toString().padStart(5, "0")}</p>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-CA")}</p>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="mb-10 grid grid-cols-2 gap-12 text-left">
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Ship To:</h3>
            <p className="font-bold text-foreground">{order.customerName}</p>
            <p className="text-gray-600">
              {order.shippingAddress}
              <br />
              {order.city}, {order.province} {order.postalCode}
              <br />
              {order.country}
            </p>
            <p className="mt-2 text-sm text-gray-500">{order.customerEmail}</p>
            <p className="text-sm text-gray-500">{order.customerPhone}</p>
          </div>
          <div className="text-right">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Order Info:</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-foreground">Order Date:</span> {new Date(order.createdAt).toLocaleDateString("en-CA")}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-foreground">Shipping Method:</span> Standard Shipping
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100 text-left">
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Qty</th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Item Description</th>
                <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Packed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 font-bold text-lg text-foreground">{item.quantity}</td>
                  <td className="py-4 text-left">
                    <p className="font-medium text-foreground">{item.productName}</p>
                    {item.color ? <p className="text-xs text-gray-500">Color: {item.color}</p> : null}
                    <p className="text-xs text-gray-400 font-mono">
                      SKU: {item.sku || item.productId.toString().padStart(4, "0")}
                    </p>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-block h-6 w-6 border-2 border-gray-200 rounded"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {order.notes ? (
          <div className="mb-8 rounded-lg bg-gray-50 p-4 border border-gray-100 text-left">
            <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Customer Notes:</h4>
            <p className="text-sm text-gray-600 italic">"{order.notes}"</p>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-20 border-t pt-8 text-center text-gray-400">
          <p className="text-sm font-medium uppercase tracking-widest mb-1">Thank you for your business!</p>
          <p className="text-xs italic">Urban Ummati - Quality Islamic Decor</p>
        </div>
      </div>
    </div>
  );
}
