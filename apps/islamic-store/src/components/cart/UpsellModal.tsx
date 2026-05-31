"use client";

import { useEffect, useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { Link } from "@/lib/router";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { useGetUpsellProducts, getGetUpsellProductsQueryKey } from "@workspace/api-client-react";

export function UpsellModal() {
  const { lastAddedProductId, setLastAddedProductId, addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [addedUpsells, setAddedUpsells] = useState<number[]>([]);

  // Only fetch upsells if we have a lastAddedProductId
  const { data: upsellData } = useGetUpsellProducts(
    { productId: lastAddedProductId || undefined },
    {
      query: {
        enabled: !!lastAddedProductId,
        queryKey: getGetUpsellProductsQueryKey({ productId: lastAddedProductId || undefined })
      }
    }
  );

  useEffect(() => {
    if (lastAddedProductId && upsellData && upsellData.products.length > 0) {
      setIsOpen(true);
    }
  }, [lastAddedProductId, upsellData]);

  const handleClose = () => {
    setIsOpen(false);
    // Add a small delay before clearing the ID so the modal animates out cleanly
    setTimeout(() => {
      setLastAddedProductId(null);
      setAddedUpsells([]);
    }, 300);
  };

  const handleAddUpsell = (product: any) => {
    const globalDiscount = parseFloat(upsellData?.settings?.upsell_discount_percent || "0");
    const productDiscount = product.upsellDiscount ?? globalDiscount;
    const price = productDiscount > 0 
      ? product.price * (1 - productDiscount / 100) 
      : product.price;

    addItem({
      productId: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      imageUrl: product.imageUrl,
      color: product.colors?.[0]
    }, { skipUpsell: true });
    
    setAddedUpsells(prev => [...prev, product.id]);
  };

  if (!isOpen || !upsellData || upsellData.products.length === 0) return null;

  const upsellProducts = upsellData.products.slice(0, 3); // Max 3 items
  const itemCount = upsellProducts.length;
  const globalDiscount = parseFloat(upsellData.settings?.upsell_discount_percent || "0");

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] transition-opacity"
        onClick={handleClose}
      />
      <div className={cn(
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] bg-background shadow-2xl z-[70] max-h-[90vh] rounded-sm animate-in fade-in zoom-in-95 duration-200 flex flex-col",
        itemCount === 1 ? "max-w-md" : itemCount === 2 ? "max-w-3xl" : "max-w-5xl"
      )}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-background z-10 shrink-0">
          <div>
            <h2 className="font-serif text-2xl tracking-wider text-primary">COMPLETE YOUR ORDER</h2>
            <p className="text-sm font-sans text-muted-foreground mt-1">Frequently bought together</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable area */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className={cn(
            "grid gap-6 justify-center",
            itemCount === 1 ? "grid-cols-1" : 
            itemCount === 2 ? "grid-cols-1 md:grid-cols-2" : 
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {upsellProducts.map((product) => {
              const isAdded = addedUpsells.includes(product.id);
              const productDiscount = product.upsellDiscount ?? globalDiscount;
              const discountedPrice = productDiscount > 0
                ? product.price * (1 - productDiscount / 100) 
                : product.price;

              return (
                <div key={product.id} className="border border-border p-4 flex flex-col bg-white h-full">
                  <div className="relative aspect-square mb-4 bg-muted overflow-hidden shrink-0">
                    <img 
                      src={product.imageUrl || '/product-1.png'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {productDiscount > 0 && (
                      <div className="absolute top-2 left-2 bg-destructive text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                        SAVE {productDiscount}%
                      </div>
                    )}
                  </div>

                  <Link 
                    href={`/products/${product.id}`}
                    onClick={handleClose}
                    className="font-serif text-lg mb-2 line-clamp-2 hover:text-primary transition-colors flex-1"
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-center gap-2 mb-4 font-sans shrink-0">
                    <span className="font-bold text-lg">${discountedPrice.toFixed(2)}</span>
                    {productDiscount > 0 && (
                      <span className="text-muted-foreground line-through text-sm">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddUpsell(product)}
                    disabled={isAdded}
                    className={cn(
                      "w-full py-3 font-sans uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 shrink-0",
                      isAdded 
                        ? 'bg-secondary text-secondary-foreground border border-secondary cursor-default' 
                        : 'bg-white border border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                    )}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-4 shrink-0 bg-background">
          <button
            onClick={handleClose}
            className="px-6 py-3 font-sans text-muted-foreground uppercase tracking-widest text-sm hover:text-foreground transition-colors"
          >
            Continue Shopping
          </button>
          <Link
            href="/cart"
            onClick={handleClose}
            className="bg-primary text-primary-foreground px-8 py-3 font-sans uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
          >
            View Cart
          </Link>
        </div>
      </div>
    </>
  );
}
