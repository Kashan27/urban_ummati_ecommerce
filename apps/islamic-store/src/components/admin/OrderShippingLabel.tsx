"use client";

import type { Order } from "@workspace/api-zod";

type Props = {
  order: Order | null;
  printSize?: "standard" | "4x6";
};

export function OrderShippingLabel({ order, printSize = "standard" }: Props) {
  if (!order) return null;

  const is4x6 = printSize === "4x6";

  return (
    <div className="print-only print-content">
      <div className={`shipping-label-container mx-auto bg-white ${is4x6 ? 'w-[4in] h-[6in] p-6' : 'p-8'} text-black font-sans border-2 border-black flex flex-col justify-between`}>
        {/* Sender */}
        <div className="text-left border-b-2 border-black pb-4">
          <h3 className="text-[10px] font-bold uppercase mb-0.5">From:</h3>
          <p className="text-xs font-bold">URBAN UMMATI</p>
          <p className="text-[10px] leading-tight">
            123 Decor Lane<br />
            Toronto, ON M5V 2L7<br />
            Canada
          </p>
        </div>

        {/* Recipient - Center this section and make it large */}
        <div className="flex-1 flex flex-col justify-center py-10">
          <h3 className="text-xs font-bold uppercase mb-3">To:</h3>
          <div className="pl-2">
            <p className="text-4xl font-black uppercase mb-2 leading-none tracking-tight">{order.customerName}</p>
            <p className="text-xl leading-tight font-bold uppercase">
              {order.shippingAddress}<br />
              {order.city}, {order.province} {order.postalCode}<br />
              {order.country}
            </p>
          </div>
        </div>

        {/* Bottom Bar / Tracking - Force to bottom */}
        <div className="border-t-4 border-black pt-6">
          <div className="flex justify-between items-end gap-4">
            <div className="flex-shrink-0">
              <p className="text-[11px] font-black uppercase">ORDER #{order.id.toString().padStart(5, "0")}</p>
              <p className="text-[9px] text-gray-800 uppercase font-black mt-2">Standard Shipping</p>
            </div>
            <div className="flex-grow flex flex-col items-end">
              {/* Barcode Mockup - Increased height */}
              <div className="flex gap-[1px] h-14 w-full max-w-[180px] bg-white items-end mb-2">
                {Array.from({ length: 45 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-black flex-1" 
                    style={{ height: `${40 + Math.random() * 60}%`, width: i % 4 === 0 ? '3px' : (i % 2 === 0 ? '2px' : '1px') }}
                  />
                ))}
              </div>
              <p className="text-[12px] font-mono font-black tracking-tight">TRK: {order.shipstationTrackingNumber || 'PENDING'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
