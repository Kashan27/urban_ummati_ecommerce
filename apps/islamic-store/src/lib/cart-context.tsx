"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  imageUrl: string;
  promoToken?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, color?: string) => void;
  updateQuantity: (productId: number, quantity: number, color?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  lastAddedProductId: number | null;
  setLastAddedProductId: (id: number | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const savedCart = localStorage.getItem("noor_cart");
      if (savedCart) return JSON.parse(savedCart);
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem("noor_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.productId === newItem.productId && i.color === newItem.color
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        if (newItem.promoToken && !updatedItems[existingItemIndex].promoToken) {
          updatedItems[existingItemIndex].promoToken = newItem.promoToken;
          updatedItems[existingItemIndex].price = newItem.price;
        }
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });
    setLastAddedProductId(newItem.productId);
    toast.success("Added to cart", {
      description: `${newItem.quantity}x ${newItem.name} ${newItem.color ? `(${newItem.color})` : ''}`
    });
  };

  const removeItem = (productId: number, color?: string) => {
    setItems((prevItems) => 
      prevItems.filter((i) => !(i.productId === productId && i.color === color))
    );
  };

  const updateQuantity = (productId: number, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeItem(productId, color);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.productId === productId && i.color === color ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        lastAddedProductId,
        setLastAddedProductId
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
