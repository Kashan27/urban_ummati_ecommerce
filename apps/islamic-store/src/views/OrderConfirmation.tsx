"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams, useRouter, Link } from "@/lib/router";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { CheckCircle, Package, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { useSearch } from "@/lib/router";
import { useQueryClient } from "@tanstack/react-query";

export function OrderConfirmation() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = parseInt(params.id || "0");
  const { clearCart, setIsCartOpen, setLastAddedProductId } = useCart();
  const searchString = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const sessionId = searchParams.get("session_id") || "";
  const queryClient = useQueryClient();
  const confirmKeyRef = useRef<string>("");
  const initialSetupRef = useRef(false);

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) }
  });

  // Run initial UI reset only once on mount
  useEffect(() => {
    if (initialSetupRef.current) return;
    initialSetupRef.current = true;
    
    setIsCartOpen(false);
    setLastAddedProductId(null);
  }, [setIsCartOpen, setLastAddedProductId]);

  // Payment confirmation effect
  useEffect(() => {
    if (!orderId || !sessionId) return;
    if (!order) return;
    if (order.paymentStatus === "paid") return;

    const key = `${orderId}:${sessionId}`;
    if (confirmKeyRef.current === key) return;
    confirmKeyRef.current = key;

    fetch("/api/payments/stripe/confirm-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, sessionId }),
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
        if (data?.ok) {
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
        }
      })
      .catch(() => {});
  }, [orderId, order, sessionId, queryClient]);

  // Clear cart only once when order is confirmed paid
  const cartClearedRef = useRef(false);
  useEffect(() => {
    if (!order || cartClearedRef.current) return;
    
    const isPaid =
      order.paymentStatus === "paid" || order.total === 0 || order.isFreeOrder === true;
      
    if (isPaid) {
      clearCart();
      cartClearedRef.current = true;
    }
  }, [order, clearCart]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full mx-auto" />
          <div className="h-8 bg-muted rounded w-64 mx-auto" />
          <div className="h-4 bg-muted rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Order Not Found</h1>
        <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl mb-2 text-foreground">Thank You, {order.customerName.split(" ")[0]}!</h1>
        <p className="text-muted-foreground text-lg">Your order has been confirmed.</p>
        <p className="text-sm text-muted-foreground mt-2">
          A confirmation email will be sent to <span className="font-medium text-foreground">{order.customerEmail}</span>
        </p>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden mb-8 shadow-sm">
        <div className="p-6 border-b border-border bg-primary/5">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-bold">Order Number</p>
              <p className="font-serif text-xl" data-testid="text-order-id">#{order.id.toString().padStart(5, "0")}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-bold">Date</p>
              <p className="font-sans text-sm">{new Date(order.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-bold">Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground uppercase tracking-wider">
                <Package className="h-3 w-3" />
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-serif text-lg mb-4 uppercase tracking-wide border-b pb-2">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => {
              const isFreeItem = order.isFreeOrder && item.price === order.discount && item.quantity === 1;
              return (
                <div key={item.id} className="flex gap-4" data-testid={`confirmation-item-${item.productId}`}>
                  <div className="w-16 h-16 bg-muted rounded-sm overflow-hidden flex-shrink-0 border">
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-bold">{item.productName}</p>
                    {item.color && <p className="text-xs text-muted-foreground capitalize">Color: {item.color}</p>}
                    <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-sans font-bold">
                    {isFreeItem ? (
                      <span className="text-primary">$0.00</span>
                    ) : (
                      `$${item.total.toFixed(2)}`
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {order.isFreeOrder ? (
                  `$${(order.subtotal - order.discount).toFixed(2)}`
                ) : (
                  `$${order.subtotal.toFixed(2)}`
                )}
              </span>
            </div>
            {order.isFreeOrder && (
              <div className="flex justify-between text-primary font-bold italic">
                <span>Free Product Applied</span>
                <span>(Included)</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{order.shippingCost === 0 ? "FREE" : `$${order.shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">HST (13%)</span>
              <span className="font-medium">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span className="uppercase tracking-widest font-serif">Total Paid</span>
              <span className="text-primary" data-testid="text-order-total">${order.total.toFixed(2)} CAD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm p-6 mb-8 shadow-sm">
        <h2 className="font-serif text-lg mb-4 uppercase tracking-wide border-b pb-2">Shipping Address</h2>
        <p className="font-sans text-sm leading-relaxed text-muted-foreground font-medium">
          {order.customerName}<br />
          {order.shippingAddress}<br />
          {order.city}, {order.province} {order.postalCode}<br />
          {order.country}
        </p>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm flex items-start gap-3 mb-12">
        <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold">Your order is being processed</p>
          <p className="text-xs text-muted-foreground mt-1">
            You'll receive shipping updates via email. Most orders ship within 2-3 business days.
          </p>
          {(order as any).trackingToken && (
            <div className="mt-4">
              <Link
                href={`/tracking/${(order as any).trackingToken}`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90"
              >
                Track Your Order <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="text-center flex justify-center gap-6 pb-12 border-t pt-8">
        <Button 
          variant="default" 
          size="lg"
          className="uppercase tracking-widest px-12 h-14 font-bold shadow-lg hover:-translate-y-0.5 transition-transform"
          onClick={() => {
            console.log("Navigating to products...");
            router.push("/products");
          }}
        >
          Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
