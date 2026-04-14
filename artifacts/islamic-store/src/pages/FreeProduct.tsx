import { useParams } from "@/lib/router";
import { useGetFreeProductLink, getGetFreeProductLinkQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Gift, ShoppingBag, CheckCircle, XCircle } from "lucide-react";
import { Link } from "@/lib/router";
import { useState, useEffect } from "react";

export function FreeProduct() {
  const params = useParams<{ token: string }>();
  const token = params.token || "";
  const { addItem, setIsCartOpen } = useCart();
  const [added, setAdded] = useState(false);

  const { data: linkData, isLoading, isError } = useGetFreeProductLink(token, {
    query: { enabled: !!token, queryKey: getGetFreeProductLinkQueryKey(token) }
  });

  function handleAddToCart() {
    if (!linkData?.product) return;
    const product = linkData.product;
    addItem({
      productId: product.id,
      name: product.name,
      price: 0,
      quantity: 1,
      color: (product.colors as string[])[0] || undefined,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setIsCartOpen(true);
  }

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

  if (isError || !linkData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-destructive/10">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <h1 className="font-serif text-3xl mb-4">Invalid Link</h1>
        <p className="text-muted-foreground mb-8">
          This free product link is not valid or has expired. Please contact us for assistance.
        </p>
        <Link href="/products">
          <Button className="uppercase tracking-widest">Browse Products</Button>
        </Link>
      </div>
    );
  }

  if (linkData.usedByEmail) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-muted">
            <XCircle className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h1 className="font-serif text-3xl mb-4">Link Already Used</h1>
        <p className="text-muted-foreground mb-8">
          This free product offer has already been claimed.
        </p>
        <Link href="/products">
          <Button className="uppercase tracking-widest">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const product = linkData.product;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Gift className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl mb-3">Your Free Gift is Waiting</h1>
        <p className="text-muted-foreground text-lg">
          A special product has been selected for you, completely free.
        </p>
      </div>

      {product && (
        <div className="bg-card border border-border rounded-sm overflow-hidden max-w-2xl mx-auto">
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-72 object-cover"
            />
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-1.5 text-xs uppercase tracking-widest font-medium">
              FREE
            </div>
          </div>

          <div className="p-8">
            <div className="mb-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{product.category}</span>
            </div>
            <h2 className="font-serif text-2xl mb-3">{product.name}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <div>
                <span className="line-through text-muted-foreground text-lg">${product.price.toFixed(2)}</span>
                <span className="ml-3 text-primary font-medium text-lg">FREE</span>
              </div>
            </div>

            {!added ? (
              <Button
                data-testid="button-claim-free-product"
                className="w-full py-6 uppercase tracking-[0.2em] text-sm"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Claim Your Free Product
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-sm text-primary">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Added to cart!</span>
                </div>
                <Link href="/checkout">
                  <Button className="w-full py-5 uppercase tracking-[0.2em] text-sm" data-testid="button-proceed-checkout">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-8">
        This is a one-time use offer. Shipping costs may apply.
      </p>
    </div>
  );
}
