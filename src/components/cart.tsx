"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  variantId: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string;
  qty: number;
  stock: number;
};

type Cart = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<Cart | null>(null);
const KEY = "wildcats-den-bag";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved bag only exists in the browser
      setItems(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch {}
  }, []);

  const save = (next: CartItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const setQty = (variantId: string, qty: number) =>
    save(
      items
        .map((i) => (i.variantId === variantId ? { ...i, qty: Math.min(qty, i.stock) } : i))
        .filter((i) => i.qty > 0),
    );

  const add = (item: CartItem) => {
    const existing = items.find((i) => i.variantId === item.variantId);
    if (existing) setQty(item.variantId, existing.qty + item.qty);
    else save([...items, { ...item, qty: Math.min(item.qty, item.stock) }]);
  };

  return (
    <CartContext
      value={{
        items,
        add,
        setQty,
        clear: () => save([]),
        count: items.reduce((n, i) => n + i.qty, 0),
        total: items.reduce((n, i) => n + i.qty * i.price, 0),
      }}
    >
      {children}
    </CartContext>
  );
}

export function useCart() {
  const cart = use(CartContext);
  if (!cart) throw new Error("useCart needs CartProvider");
  return cart;
}
