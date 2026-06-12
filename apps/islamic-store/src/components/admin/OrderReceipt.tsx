"use client";

import type { Order } from "@workspace/api-zod";

type Props = {
  order: Order | null;
  printSize?: "standard" | "4x6";
};

export function OrderReceipt({ order, printSize = "standard" }: Props) {
  if (!order) return null;

  const is4x6 = printSize === "4x6";

  return (
    <div className="print-only print-content">
      <div className={`mx-auto ${is4x6 ? 'w-[4in] h-[6in] p-4 overflow-hidden' : 'max-w-2xl p-12'} bg-white text-black font-sans shadow-none`}>
        {/* Header */}
        <div className={`${is4x6 ? 'mb-4 pb-2' : 'mb-12 pb-8'} flex items-center justify-between border-b-2 border-gray-100`}>
          <div>
            <h1 className={`${is4x6 ? 'text-xl' : 'font-serif text-4xl'} font-bold tracking-tight text-primary`}>URBAN UMMATI</h1>
            {!is4x6 && <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest font-medium">Islamic Decor E-Commerce</p>}
          </div>
          <div className="text-right">
            <h2 className={`${is4x6 ? 'text-[8px]' : 'text-sm'} font-bold uppercase tracking-[0.2em] text-gray-400 mb-1`}>Receipt</h2>
            <p className={`${is4x6 ? 'text-sm' : 'text-2xl'} font-bold font-serif`}>#{order.id.toString().padStart(5, "0")}</p>
            <p className={`${is4x6 ? 'text-[8px]' : 'text-xs'} text-gray-400 mt-1 font-sans`}>{new Date(order.createdAt).toLocaleDateString("en-CA")}</p>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className={`${is4x6 ? 'mb-4 gap-4' : 'mb-12 gap-8'} grid grid-cols-2 text-sm`}>
          <div>
            <h3 className={`${is4x6 ? 'mb-1 text-[8px]' : 'mb-3'} font-bold uppercase tracking-wider text-gray-400`}>Customer</h3>
            <p className={`${is4x6 ? 'text-[10px]' : 'font-semibold text-lg'}`}>{order.customerName}</p>
            <p className={`${is4x6 ? 'text-[8px]' : 'text-gray-600'}`}>{order.customerEmail}</p>
          </div>
          <div>
            <h3 className={`${is4x6 ? 'mb-1 text-[8px]' : 'mb-3'} font-bold uppercase tracking-wider text-gray-400`}>Shipping To</h3>
            <p className={`${is4x6 ? 'text-[9px] leading-tight' : 'leading-relaxed text-gray-600 font-medium'}`}>
              {order.shippingAddress}<br />
              {order.city}, {order.province} {order.postalCode}<br />
              {order.country}
            </p>
          </div>
        </div>

        {/* Table Header */}
        <div className={`${is4x6 ? 'mb-2 pb-1' : 'mb-6 pb-2'} grid grid-cols-12 border-b-2 border-black text-xs font-bold uppercase tracking-widest`}>
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-4 text-right">Total</div>
        </div>

        {/* Items */}
        <div className={`${is4x6 ? 'mb-4' : 'mb-12'} space-y-0 border-b border-gray-100`}>
          {order.items.map((item) => (
            <div key={item.id} className={`grid grid-cols-12 items-center ${is4x6 ? 'py-1 text-[10px]' : 'py-4 text-sm'} border-t border-gray-50`}>
              <div className="col-span-6">
                <p className="font-medium text-gray-900 leading-tight">{item.productName}</p>
                {item.color && <p className="text-[7px] text-gray-500 uppercase tracking-wider">Color: {item.color}</p>}
              </div>
              <div className="col-span-2 text-center text-gray-600 font-sans">{item.quantity}</div>
              <div className="col-span-4 text-right font-bold font-sans">${item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals Section */}
        <div className={`${is4x6 ? 'w-full' : 'ml-auto w-1/2'} space-y-1 text-sm`}>
          <div className={`flex justify-between text-gray-600 ${is4x6 ? 'text-[9px]' : ''}`}>
            <span>Subtotal</span>
            <span className="font-medium">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className={`flex justify-between text-gray-600 ${is4x6 ? 'text-[9px]' : ''}`}>
            <span>Shipping</span>
            <span className="font-medium">${order.shippingCost.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className={`flex justify-between font-bold text-gray-800 italic ${is4x6 ? 'text-[9px]' : ''}`}>
              <span>Discount</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className={`${is4x6 ? 'mt-2 pt-2 text-base' : 'mt-6 pt-5 text-xl'} flex justify-between gap-4 border-t-2 border-black font-bold uppercase tracking-wide`}>
            <span className={is4x6 ? '' : 'font-serif'}>TOTAL</span>
            <span className="font-sans whitespace-nowrap">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        {!is4x6 && (
          <div className="mt-20 border-t pt-8 text-center text-xs text-gray-400 italic">
            <p>Thank you for shopping with Urban Ummati. We hope your new decor brings joy to your home.</p>
            <p className="mt-2 uppercase tracking-widest">urbanummati.store</p>
          </div>
        )}
      </div>
    </div>
  );
}
