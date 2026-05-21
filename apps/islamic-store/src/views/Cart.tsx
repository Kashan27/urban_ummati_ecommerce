import { Link, useLocation, useSearch } from "@/lib/router";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useGetFreeProductLink, getGetFreeProductLinkQueryKey } from "@workspace/api-client-react";

export function Cart() {
  const { items, addItem, removeItem, updateQuantity, subtotal } = useCart();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const promoToken = searchParams.get("promoToken") || searchParams.get("freeProductToken") || "";

  const { data: promoLink, isError: promoError } = useGetFreeProductLink(promoToken, {
    query: {
      enabled: Boolean(promoToken),
      queryKey: getGetFreeProductLinkQueryKey(promoToken),
    },
  });

  useEffect(() => {
    if (!promoToken) return;
    if (!promoLink?.product) return;
    
    // Validate promo link using advanced rules
    if (promoLink.status !== "active") return;
    if (promoLink.expiresAt && new Date(promoLink.expiresAt) < new Date()) return;
    if (promoLink.currentUsage >= promoLink.usageLimit) return;

    const alreadyApplied = items.some((i) => i.promoToken === promoToken);
    if (alreadyApplied) return;

    addItem({
      productId: promoLink.product.id,
      name: promoLink.product.name,
      price: 0,
      quantity: 1,
      color: promoLink.product.colors?.[0]?.name || undefined,
      imageUrl: promoLink.product.imageUrl,
      promoToken,
    });
  }, [addItem, items, promoLink, promoToken]);

  const shipping = subtotal > 75 ? 0 : 15;
  const tax = subtotal * 0.13;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <main className="flex-1 w-full pt-16 pb-32 flex flex-col items-center text-center px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-6">Shopping Cart</h1>
        <div className="w-16 h-0.5 bg-secondary mx-auto mb-10"></div>
        <p className="font-sans text-muted-foreground mb-8">Your cart is currently empty.</p>
        <Link 
          href="/products"
          className="bg-primary text-primary-foreground px-8 py-4 font-sans uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <h1 className="font-serif text-3xl md:text-4xl mb-8">Shopping Cart</h1>
        {promoToken && promoError && (
          <div className="mb-8 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            This free product link is invalid or has expired.
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items */}
          <div className="w-full lg:w-2/3">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border font-sans uppercase tracking-widest text-xs font-bold text-muted-foreground">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="space-y-6 md:space-y-0">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}`} className="py-6 border-b border-border flex flex-col md:grid md:grid-cols-12 md:items-center gap-4">
                  
                  {/* Mobile Layout */}
                  <div className="flex md:hidden gap-4 w-full">
                    <div className="w-24 h-24 bg-muted shrink-0">
                      <img src={item.imageUrl || '/product-1.png'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <Link href={`/products/${item.productId}`} className="font-serif text-lg hover:text-primary transition-colors pr-4">
                            {item.name}
                          </Link>
                          <button onClick={() => removeItem(item.productId, item.color)} className="text-muted-foreground hover:text-destructive">
                            <X size={20} />
                          </button>
                        </div>
                        {item.color && <p className="text-sm text-muted-foreground font-sans mt-1">Color: {item.color}</p>}
                        <p className="font-sans font-bold mt-2">${item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-border bg-white w-24">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color)} className="p-2 flex-1 text-center hover:bg-muted"><Minus size={14} className="mx-auto" /></button>
                          <span className="font-sans text-sm w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color)} className="p-2 flex-1 text-center hover:bg-muted"><Plus size={14} className="mx-auto" /></button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex col-span-6 gap-6 items-center">
                    <div className="w-24 h-24 bg-muted shrink-0">
                      <img src={item.imageUrl || '/product-1.png'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Link href={`/products/${item.productId}`} className="font-serif text-lg hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                      {item.color && <p className="text-sm text-muted-foreground font-sans mt-1">Color: {item.color}</p>}
                      <button 
                        onClick={() => removeItem(item.productId, item.color)} 
                        className="text-xs text-muted-foreground uppercase tracking-wider font-sans mt-3 hover:text-destructive flex items-center gap-1"
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="hidden md:block col-span-2 text-center font-sans font-bold">
                    ${item.price.toFixed(2)}
                  </div>

                  <div className="hidden md:flex col-span-2 justify-center">
                    <div className="flex items-center border border-border bg-white w-24 h-10">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color)} className="h-full flex-1 hover:bg-muted"><Minus size={14} className="mx-auto" /></button>
                      <span className="font-sans text-sm w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color)} className="h-full flex-1 hover:bg-muted"><Plus size={14} className="mx-auto" /></button>
                    </div>
                  </div>

                  <div className="hidden md:block col-span-2 text-right font-sans font-bold text-lg">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
              <Link href="/products" className="font-sans text-sm uppercase tracking-widest text-primary hover:text-secondary transition-colors flex items-center gap-2">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white border border-border p-6 md:p-8 sticky top-24">
              <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
              
              <div className="space-y-4 font-sans text-sm mb-6 border-b border-border pb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-secondary font-bold">Free</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    Add ${(75 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Tax (13%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-8">
                <span className="font-sans uppercase tracking-widest text-sm font-bold">Total</span>
                <div className="text-right">
                  <span className="font-serif text-3xl block">${total.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground font-sans">CAD</span>
                </div>
              </div>
              
              <button 
                onClick={() => setLocation('/checkout')}
                className="w-full bg-primary text-primary-foreground py-4 font-sans uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-4 group"
              >
                Proceed to Checkout
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-sans pt-4 border-t border-border">
                <ShieldCheck size={16} /> Secure Encrypted Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
