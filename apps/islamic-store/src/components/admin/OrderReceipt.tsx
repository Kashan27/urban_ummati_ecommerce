"use client";

import type { Order } from "@workspace/api-zod";

type Props = {
  order: Order | null;
};

export function OrderReceipt({ order }: Props) {
  if (!order) return null;

  return (
    <div className="print-only print-content">
      <div className="mx-auto max-w-2xl bg-white p-12 text-black font-sans shadow-none">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between border-b-2 border-gray-100 pb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-primary">URBAN UMMATI</h1>
            <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest font-medium">Islamic Decor E-Commerce</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Receipt</h2>
            <p className="text-2xl font-bold font-serif">#{order.id.toString().padStart(5, "0")}</p>
            <p className="text-xs text-gray-400 mt-1 font-sans">{new Date(order.createdAt).toLocaleDateString("en-CA")}</p>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="mb-12 grid grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="mb-3 font-bold uppercase tracking-wider text-gray-400">Customer</h3>
            <p className="font-semibold text-lg">{order.customerName}</p>
            <p className="text-gray-600">{order.customerEmail}</p>
            <p className="text-gray-600">{order.customerPhone}</p>
          </div>
          <div>
            <h3 className="mb-3 font-bold uppercase tracking-wider text-gray-400">Shipping To</h3>
            <p className="leading-relaxed text-gray-600 font-medium">
              {order.shippingAddress}<br />
              {order.city}, {order.province} {order.postalCode}<br />
              {order.country}
            </p>
          </div>
        </div>

        {/* Table Header */}
        <div className="mb-6 grid grid-cols-12 border-b-2 border-black pb-2 text-xs font-bold uppercase tracking-widest">
          <div className="col-span-6">Item Description</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {/* Items */}
        <div className="mb-12 space-y-0 border-b border-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 items-center text-sm py-4 border-t border-gray-50">
              <div className="col-span-6">
                <p className="font-medium text-gray-900">{item.productName}</p>
                {item.color && <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Color: {item.color}</p>}
              </div>
              <div className="col-span-2 text-center text-gray-600 font-sans">${item.price.toFixed(2)}</div>
              <div className="col-span-2 text-center text-gray-600 font-sans">{item.quantity}</div>
              <div className="col-span-2 text-right font-bold font-sans">${item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals Section */}
        <div className="ml-auto w-1/2 space-y-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="font-medium">${order.shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (13%)</span>
            <span className="font-medium">${order.tax.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between font-bold text-gray-800 italic">
              <span>Discount</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-6 flex justify-between gap-4 border-t-2 border-black pt-5 text-xl font-bold uppercase tracking-wide">
            <span className="font-serif">TOTAL PAID</span>
            <span className="font-sans whitespace-nowrap">${order.total.toFixed(2)}</span>
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
