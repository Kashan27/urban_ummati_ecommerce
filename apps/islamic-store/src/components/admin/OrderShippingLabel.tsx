"use client";

import type { Order } from "@workspace/api-zod";

type Props = {
  order: Order | null;
};

export function OrderShippingLabel({ order }: Props) {
  if (!order) return null;

  return (
    <div className="print-only print-content">
      <div className="shipping-label-container mx-auto bg-white p-8 text-black font-sans border-2 border-black flex flex-col justify-between">
        {/* Sender */}
        <div className="text-left">
          <h3 className="text-[10px] font-bold uppercase mb-1">From:</h3>
          <p className="text-xs font-bold">URBAN UMMATI</p>
          <p className="text-[10px] leading-tight">
            123 Decor Lane<br />
            Toronto, ON M5V 2L7<br />
            Canada
          </p>
        </div>

        {/* Recipient */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <h3 className="text-xs font-bold uppercase mb-2">To:</h3>
          <div className="pl-4">
            <p className="text-xl font-bold uppercase mb-1">{order.customerName}</p>
            <p className="text-base leading-tight font-medium uppercase">
              {order.shippingAddress}<br />
              {order.city}, {order.province} {order.postalCode}<br />
              {order.country}
            </p>
          </div>
        </div>

        {/* Bottom Bar / Tracking Placeholder */}
        <div className="border-t-2 border-black pt-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold">ORDER #{order.id.toString().padStart(5, "0")}</p>
              <p className="text-[8px] text-gray-500 uppercase">Standard Shipping</p>
            </div>
            <div className="text-right">
              <div className="h-8 w-32 bg-black mb-1"></div>
              <p className="text-[8px] font-mono">TRK: {order.shipstationTrackingNumber || 'PENDING'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
