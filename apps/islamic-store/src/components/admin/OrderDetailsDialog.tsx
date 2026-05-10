"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Order } from "@workspace/api-zod";

type Props = {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onPrintPackingSlip: (order: Order) => void;
  onPrintShippingLabel: (order: Order) => void;
};

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
  onPrintReceipt,
  onPrintPackingSlip,
  onPrintShippingLabel,
}: Props) {
  if (!order) return null;
  const currentOrder = order;
  const [syncPending, setSyncPending] = useState(false);
  const [syncError, setSyncError] = useState("");

  async function reloadOrder() {
    const response = await fetch(`/api/orders/${currentOrder.id}`, { method: "GET" });
    if (!response.ok) throw new Error("Failed to reload order");
    const updated = (await response.json()) as Order;
    onOrderUpdated(updated);
  }

  async function syncToShipStation() {
    setSyncError("");
    setSyncPending(true);
    try {
      const response = await fetch(`/api/orders/${currentOrder.id}/shipstation`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "ShipStation sync failed");
      }

      await reloadOrder();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "ShipStation sync failed");
    } finally {
      setSyncPending(false);
    }
  }

  async function refreshFromShipStation() {
    setSyncError("");
    setSyncPending(true);
    try {
      const response = await fetch(`/api/orders/${currentOrder.id}/shipstation`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "ShipStation refresh failed");
      }

      await reloadOrder();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "ShipStation refresh failed");
    } finally {
      setSyncPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl no-print">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="font-serif text-2xl">
              Order #{currentOrder.id.toString().padStart(5, "0")}
            </DialogTitle>
            <StatusBadge status={currentOrder.status} />
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

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</h4>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Status:</span> {order.paymentStatus ?? "n/a"}
                </div>
                {order.paymentProvider ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Provider:</span> {order.paymentProvider}
                  </div>
                ) : null}
                {order.paidAt ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Paid:</span>{" "}
                    {new Date(order.paidAt).toLocaleString("en-CA")}
                  </div>
                ) : null}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fulfillment</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentOrder.status === "received" && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onPrintPackingSlip(currentOrder)}
                      className="uppercase tracking-wider"
                    >
                      Pack Order
                    </Button>
                  )}
                  {currentOrder.status === "processed" && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onPrintShippingLabel(currentOrder)}
                      className="uppercase tracking-wider"
                    >
                      Ship Label
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onPrintReceipt(currentOrder)}
                    className="uppercase tracking-wider"
                  >
                    Receipt
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ShipStation</h4>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Order ID:</span>{" "}
                  {order.shipstationOrderId ?? "not synced"}
                </div>
                {order.shipstationTrackingNumber ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Tracking:</span>{" "}
                    {order.shipstationTrackingNumber}
                  </div>
                ) : null}
                {order.shippedAt ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Shipped:</span>{" "}
                    {new Date(order.shippedAt).toLocaleString("en-CA")}
                  </div>
                ) : null}
                <div className="flex gap-2 pt-1">
                  {!order.shipstationOrderId && order.paymentStatus === "paid" ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={syncPending}
                      onClick={syncToShipStation}
                      className="uppercase tracking-wider"
                    >
                      Sync
                    </Button>
                  ) : null}
                  {order.shipstationOrderId ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={syncPending}
                      onClick={refreshFromShipStation}
                      className="uppercase tracking-wider"
                    >
                      Refresh
                    </Button>
                  ) : null}
                </div>
                {syncError ? (
                  <div className="text-xs text-destructive">{syncError}</div>
                ) : null}
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
