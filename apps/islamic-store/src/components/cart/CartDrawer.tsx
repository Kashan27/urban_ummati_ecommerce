import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Link, useLocation } from "@/lib/router";
import { useCart } from "@/lib/cart-context";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const [, setLocation] = useLocation();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-serif text-2xl tracking-wider">YOUR CART</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <ShoppingBag size={40} strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl">Your cart is empty</h3>
                <p className="text-muted-foreground font-sans text-sm">Looks like you haven't added any items to your cart yet.</p>
              </div>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  setLocation('/products');
                }}
                className="bg-primary text-primary-foreground px-8 py-3 font-sans uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}`} className="flex gap-4 pb-6 border-b border-border">
                  <div className="w-24 h-24 bg-muted shrink-0 overflow-hidden">
                    <img 
                      src={item.imageUrl || '/product-1.png'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link 
                          href={`/products/${item.productId}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif text-base line-clamp-2 hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button 
                          onClick={() => removeItem(item.productId, item.color)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {item.color && (
                        <p className="text-xs text-muted-foreground mt-1 font-sans">
                          Color: {item.color}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border border-border">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-sans text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-sans font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex justify-between items-center mb-4">
              <span className="font-sans text-muted-foreground uppercase tracking-wider text-sm">Subtotal</span>
              <span className="font-serif text-2xl">${subtotal.toFixed(2)}</span>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mb-6 font-sans">
              Shipping & taxes calculated at checkout
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  setLocation('/cart');
                }}
                className="w-full bg-white border border-primary text-primary px-6 py-4 font-sans uppercase tracking-widest text-sm hover:bg-muted transition-colors flex items-center justify-center"
              >
                View Cart
              </button>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  setLocation('/checkout');
                }}
                className="w-full bg-primary text-primary-foreground px-6 py-4 font-sans uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group"
              >
                Checkout
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
        
      </div>
    </>
  );
}
