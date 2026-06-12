"use client";

import type { Order } from "@workspace/api-zod";

type Props = {
  order: Order | null;
  printSize?: "standard" | "4x6";
};

export function OrderPackingSlip({ order, printSize = "standard" }: Props) {
  if (!order) return null;

  const is4x6 = printSize === "4x6";

  return (
    <div className="print-only print-content">
      <div className={`mx-auto ${is4x6 ? 'w-[4in] h-[6in] p-6' : 'max-w-2xl p-8'} bg-white text-black font-sans overflow-hidden`}>
        {/* Header */}
        <div className={`${is4x6 ? 'mb-4 pb-2' : 'mb-8 pb-6'} flex items-center justify-between border-b-2 border-black`}>
          <div>
            <h1 className={`${is4x6 ? 'text-2xl' : 'text-3xl'} font-black tracking-tighter text-black`}>URBAN UMMATI</h1>
            {is4x6 && <p className="text-[9px] font-bold uppercase tracking-widest">Islamic Decor</p>}
          </div>
          <div className="text-right">
            <h2 className={`${is4x6 ? 'text-[10px]' : 'text-lg'} font-bold uppercase tracking-wider text-gray-500`}>Packing Slip</h2>
            <p className={`${is4x6 ? 'text-lg' : 'text-xl'} font-black`}>#{order.id.toString().padStart(5, "0")}</p>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className={`${is4x6 ? 'mb-4' : 'mb-10 gap-12'} grid grid-cols-2 text-left`}>
          <div>
            <h3 className={`${is4x6 ? 'mb-1 text-[9px]' : 'mb-3 text-xs'} font-bold uppercase tracking-widest text-gray-400`}>Ship To:</h3>
            <p className={`${is4x6 ? 'text-xs font-bold' : 'font-bold text-foreground'}`}>{order.customerName}</p>
            <p className={`${is4x6 ? 'text-[10px] leading-tight font-medium' : 'text-gray-600'}`}>
              {order.shippingAddress}
              <br />
              {order.city}, {order.province} {order.postalCode}
              <br />
              {order.country}
            </p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className={`${is4x6 ? 'text-[9px]' : 'text-sm text-gray-600'} font-bold`}>
              {new Date(order.createdAt).toLocaleDateString("en-CA")}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className={`${is4x6 ? 'mb-4' : 'mb-12'}`}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-left">
                <th className={`py-1 ${is4x6 ? 'text-[10px]' : 'text-xs'} font-bold uppercase tracking-wider`}>Qty</th>
                <th className={`py-1 ${is4x6 ? 'text-[10px]' : 'text-xs'} font-bold uppercase tracking-wider`}>Description</th>
                <th className={`py-1 text-right ${is4x6 ? 'text-[10px]' : 'text-xs'} font-bold uppercase tracking-wider`}>OK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className={`py-2 font-black ${is4x6 ? 'text-base' : 'text-lg'}`}>{item.quantity}</td>
                  <td className="py-2 text-left">
                    <p className={`font-bold text-black ${is4x6 ? 'text-[11px] leading-tight' : ''}`}>{item.productName}</p>
                    {item.color ? <p className={`${is4x6 ? 'text-[8px] font-bold' : 'text-xs'} text-gray-500 uppercase`}>{item.color}</p> : null}
                    <p className={`${is4x6 ? 'text-[8px]' : 'text-xs'} text-gray-400 font-mono`}>
                      {item.sku || item.productId.toString().padStart(4, "0")}
                    </p>
                  </td>
                  <td className="py-2 text-right">
                    <div className={`inline-block ${is4x6 ? 'h-5 w-5 border-2' : 'h-6 w-6 border-2'} border-black rounded`}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {order.notes ? (
          <div className={`${is4x6 ? 'mb-2 p-2' : 'mb-8 p-4'} rounded bg-gray-50 border border-gray-200 text-left`}>
            <p className={`${is4x6 ? 'text-[9px] leading-tight font-bold' : 'text-sm'} text-black italic`}>"{order.notes}"</p>
          </div>
        ) : null}

        {/* Footer */}
        <div className={`${is4x6 ? 'mt-auto pt-2' : 'mt-20 pt-8'} border-t-2 border-black text-center`}>
          <p className={`${is4x6 ? 'text-[10px]' : 'text-sm'} font-black uppercase tracking-widest`}>Thank you!</p>
        </div>
      </div>
    </div>
  );
}
