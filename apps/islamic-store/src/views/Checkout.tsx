import { useEffect, useRef, useState } from "react";
import { useLocation, useSearch } from "@/lib/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/lib/cart-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Truck, Lock, ChevronLeft } from "lucide-react";
import { Link } from "@/lib/router";
import { calculateOrderTotals, OrderSettings } from "@/lib/order-utils";

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"
];

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  shippingAddress: z.string().min(5, "Please enter your full address"),
  city: z.string().min(2, "Please enter your city"),
  province: z.string().min(2, "Please select your province"),
  postalCode: z.string().min(6, "Please enter a valid postal code"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const canceled = searchParams.get("canceled") === "1";
  const canceledOrderId = searchParams.get("orderId");
  const canceledOrderToken = searchParams.get("token") ?? "";
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [settings, setSettings] = useState<OrderSettings | null>(null);
  const [cancelFinalizeStatus, setCancelFinalizeStatus] = useState<
    "idle" | "pending" | "done" | "error"
  >("idle");
  const cancelFinalizeKeyRef = useRef<string>("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error("Failed to fetch settings", err));
  }, []);

  // If the customer comes back from Stripe via cancel_url, cancel the pending order immediately and
  // restore inventory. (Stripe doesn't send an immediate "canceled" webhook.)
  useEffect(() => {
    if (!canceled) return;
    if (!canceledOrderId) return;
    if (!canceledOrderToken) return;

    const key = `${canceledOrderId}:${canceledOrderToken}`;
    if (cancelFinalizeKeyRef.current === key) return;
    cancelFinalizeKeyRef.current = key;

    setCancelFinalizeStatus("pending");
    fetch("/api/payments/stripe/cancel-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: canceledOrderId, token: canceledOrderToken }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("cancel_failed");
        setCancelFinalizeStatus("done");
      })
      .catch(() => {
        setCancelFinalizeStatus("error");
      });
  }, [canceled, canceledOrderId, canceledOrderToken]);

  const promoItem = items.find((i) => i.promoToken);
  const discount = promoItem ? promoItem.price : 0;

  const {
    shippingCost,
    tax,
    total,
    taxRate,
    shippingThreshold,
  } = calculateOrderTotals(subtotal, discount, settings || ({} as OrderSettings));

  const form = useForm<CheckoutFormValues>({
    // @hookform/resolvers@3.10.x types are Zod v4-based; our workspace uses Zod v3.
    // Runtime is compatible, but we need a cast to avoid TS type mismatch.
    resolver: zodResolver(checkoutSchema as any),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      city: "",
      province: "Ontario",
      postalCode: "",
    },
  });

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) return;

    const promoToken = items.find(i => i.promoToken)?.promoToken;

    setPaymentError("");
    setPaymentPending(true);
    try {
      const response = await fetch("/api/payments/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          country: "Canada",
          freeProductToken: promoToken,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            color: item.color,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Unable to start payment");
      }

      const data = (await response.json()) as { url?: string | null; redirectUrl?: string | null };

      if (data.redirectUrl) {
        clearCart();
        setLocation(data.redirectUrl);
        return;
      }

      if (!data.url) {
        throw new Error("Stripe checkout URL missing");
      }

      window.location.href = data.url;
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Payment failed");
      setPaymentPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Add some products before checking out.</p>
        <Link href="/products">
          <Button className="uppercase tracking-widest">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <Link href="/cart" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl mb-10 tracking-wide">Checkout</h1>
      {canceled && (
        <div className="mb-8 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span>
              Payment was canceled.{" "}
              {canceledOrderId
                ? cancelFinalizeStatus === "done"
                  ? `Order #${canceledOrderId} was canceled and stock was released.`
                  : cancelFinalizeStatus === "pending"
                    ? `Canceling order #${canceledOrderId}...`
                    : `Order #${canceledOrderId} is still pending.`
                : ""}
            </span>
            {canceledOrderId ? (
              <Button
                type="button"
                variant="outline"
                disabled={paymentPending}
                onClick={async () => {
                  const email = form.getValues("customerEmail");
                  if (!email) {
                    form.setError("customerEmail", {
                      type: "manual",
                      message: "Email is required to retry payment",
                    });
                    return;
                  }
                  setPaymentError("");
                  setPaymentPending(true);
                  try {
                    const response = await fetch("/api/payments/stripe/retry-session", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: canceledOrderId, customerEmail: email }),
                    });

                    const data = await response.json().catch(() => null);

                    if (!response.ok) {
                      if (data?.redirectUrl) {
                        clearCart();
                        setLocation(data.redirectUrl);
                        return;
                      }
                      throw new Error(data?.error || "Unable to retry payment");
                    }

                    if (data?.redirectUrl) {
                      clearCart();
                      setLocation(data.redirectUrl);
                      return;
                    }

                    if (!data?.url) throw new Error("Stripe checkout URL missing");
                    window.location.href = data.url;
                  } catch (err) {
                    setPaymentError(err instanceof Error ? err.message : "Payment retry failed");
                    setPaymentPending(false);
                  }
                }}
                className="uppercase tracking-wider"
              >
                Retry Payment
              </Button>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h2 className="font-serif text-xl mb-4 uppercase tracking-wider">Contact Information</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">Full Name</FormLabel>
                        <FormControl>
                          <Input data-testid="input-customer-name" placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">Email</FormLabel>
                        <FormControl>
                          <Input data-testid="input-customer-email" type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">Phone</FormLabel>
                        <FormControl>
                          <Input data-testid="input-customer-phone" placeholder="(555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="font-serif text-xl mb-4 uppercase tracking-wider">Shipping Address</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">Street Address</FormLabel>
                        <FormControl>
                          <Input data-testid="input-shipping-address" placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">City</FormLabel>
                        <FormControl>
                          <Input data-testid="input-city" placeholder="Toronto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider">Province</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              data-testid="select-province"
                              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              {PROVINCES.map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider">Postal Code</FormLabel>
                          <FormControl>
                            <Input data-testid="input-postal-code" placeholder="M5V 3A8" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Country</label>
                    <Input value="Canada" disabled className="bg-muted" />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                data-testid="button-place-order"
                disabled={paymentPending}
                className="w-full py-6 text-sm uppercase tracking-[0.2em] font-sans"
              >
                {paymentPending ? "Redirecting..." : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Pay Securely - ${total.toFixed(2)} CAD
                  </span>
                )}
              </Button>
              {paymentError ? (
                <p className="text-sm text-destructive">{paymentError}</p>
              ) : null}

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secure checkout powered by 256-bit SSL encryption
              </div>
            </form>
          </Form>
        </div>

        <div>
          <div className="bg-card border border-border rounded-sm p-6 sticky top-28">
            <h2 className="font-serif text-xl mb-6 uppercase tracking-wider">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}`} className="flex gap-4" data-testid={`order-item-${item.productId}`}>
                  <div className="w-16 h-16 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium truncate">{item.name}</p>
                    {item.color && <p className="text-xs text-muted-foreground capitalize">{item.color}</p>}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-sans">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="mb-4" />

            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Truck className="h-3 w-3" />
                  Shipping
                </span>
                <span className={shippingCost === 0 ? "text-primary font-medium" : ""}>
                  {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">HST ({(taxRate * 100).toFixed(0)}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-base pt-1">
                <span className="uppercase tracking-wider">Total</span>
                <span className="font-serif">${total.toFixed(2)} CAD</span>
              </div>
            </div>

            {shippingCost === 0 && (
              <div className="mt-4 p-3 bg-primary/10 rounded-sm flex items-center gap-2 text-xs text-primary">
                <Truck className="h-3 w-3" />
                You qualify for free shipping!
              </div>
            )}

            {subtotal < shippingThreshold && (
              <div className="mt-4 p-3 bg-muted rounded-sm text-xs text-muted-foreground">
                Add ${(shippingThreshold - subtotal).toFixed(2)} more for free shipping
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
