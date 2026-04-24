"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Order } from "@workspace/api-zod";

type Props = {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderDetailsDialog({ order, open, onOpenChange }: Props) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl no-print">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="font-serif text-2xl">
              Order #{order.id.toString().padStart(5, "0")}
            </DialogTitle>
            <StatusBadge status={order.status} />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-4">
          <div className="space-y-8 py-4">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h4>
                <div className="text-sm font-medium">{order.customerName}</div>
                <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipping Address</h4>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {order.shippingAddress}<br />
                  {order.city}, {order.province} {order.postalCode}<br />
                  {order.country}
                </div>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          Qty: {item.quantity} {item.color && `• Color: ${item.color}`}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium">${item.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (13%)</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-serif text-lg font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h4>
                <p className="text-sm text-muted-foreground italic">"{order.notes}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
