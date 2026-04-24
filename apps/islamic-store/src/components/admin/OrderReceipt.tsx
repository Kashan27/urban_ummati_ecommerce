"use client";

import type { Order } from "@workspace/api-zod";

type Props = {
  order: Order | null;
};

export function OrderReceipt({ order }: Props) {
  if (!order) return null;

  return (
    <div className="print-only print-content">
      <div className="mx-auto max-w-2xl bg-white p-8 text-black font-sans">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">URBAN UMMATI</h1>
            <p className="mt-1 text-sm text-gray-500">Islamic Decor E-Commerce</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-400">Receipt</h2>
            <p className="text-xl font-bold">#{order.id.toString().padStart(5, "0")}</p>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-CA")}</p>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="mb-10 grid grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="mb-3 font-bold uppercase tracking-wider text-gray-400">Customer</h3>
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-gray-600">{order.customerEmail}</p>
            <p className="text-gray-600">{order.customerPhone}</p>
          </div>
          <div>
            <h3 className="mb-3 font-bold uppercase tracking-wider text-gray-400">Shipping To</h3>
            <p className="leading-relaxed text-gray-600">
              {order.shippingAddress}<br />
              {order.city}, {order.province} {order.postalCode}<br />
              {order.country}
            </p>
          </div>
        </div>

        {/* Table Header */}
        <div className="mb-4 grid grid-cols-12 border-b-2 border-black pb-2 text-xs font-bold uppercase tracking-widest">
          <div className="col-span-6">Item Description</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {/* Items */}
        <div className="mb-8 space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 items-center text-sm">
              <div className="col-span-6">
                <p className="font-bold">{item.productName}</p>
                {item.color && <p className="text-xs text-gray-500 italic">Color: {item.color}</p>}
              </div>
              <div className="col-span-2 text-center">${item.price.toFixed(2)}</div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-right font-bold">${item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals Section */}
        <div className="ml-auto w-1/2 space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>${order.shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (13%)</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between font-bold text-gray-800 italic">
              <span>Discount</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-black pt-3 text-lg font-black uppercase tracking-tighter">
            <span>Total Paid</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 border-t pt-8 text-center text-xs text-gray-400 italic">
          <p>Thank you for shopping with Urban Ummati. We hope your new decor brings joy to your home.</p>
          <p className="mt-2 uppercase tracking-widest">urbanummati.com</p>
        </div>
      </div>
    </div>
  );
}
