"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
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
  addItem: (item: CartItem, options?: { skipUpsell?: boolean }) => void;
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

function normalizeColorValue(color: unknown): string | undefined {
  if (typeof color === "string") {
    return color;
  }

  if (typeof color === "object" && color !== null && "name" in color) {
    const name = (color as { name?: unknown }).name;
    if (typeof name === "string") {
      return name;
    }
  }

  return undefined;
}

function normalizeCartItem(item: CartItem): CartItem {
  return {
    ...item,
    color: normalizeColorValue(item.color),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const savedCart = localStorage.getItem("noor_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => normalizeCartItem(item as CartItem));
        }
      }
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

  const addItem = useCallback((newItem: CartItem, options?: { skipUpsell?: boolean }) => {
    const normalizedNewItem = normalizeCartItem(newItem);

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.productId === normalizedNewItem.productId && i.color === normalizedNewItem.color
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += normalizedNewItem.quantity;
        if (normalizedNewItem.promoToken && !updatedItems[existingItemIndex].promoToken) {
          updatedItems[existingItemIndex].promoToken = normalizedNewItem.promoToken;
          updatedItems[existingItemIndex].price = normalizedNewItem.price;
        }
        return updatedItems;
      } else {
        return [...prevItems, normalizedNewItem];
      }
    });

    if (!options?.skipUpsell) {
      setLastAddedProductId(normalizedNewItem.productId);
    }

    toast.success("Added to cart", {
      description: `${normalizedNewItem.quantity}x ${normalizedNewItem.name} ${normalizedNewItem.color ? `(${normalizedNewItem.color})` : ''}`
    });
  }, []);

  const removeItem = useCallback((productId: number, color?: string) => {
    setItems((prevItems) =>
      prevItems.filter((i) => !(i.productId === productId && i.color === normalizeColorValue(color)))
    );
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeItem(productId, color);
      return;
    }

    const normalizedColor = normalizeColorValue(color);

    setItems((prevItems) =>
      prevItems.map((i) =>
        i.productId === productId && i.color === normalizedColor ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

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
