import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  gst: number;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | undefined>(undefined);
const STORAGE = "ik_cart_v1";
const GST_RATE = 0.05;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    setItems((p) => p.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  };
  const clear = () => setItems([]);

  const { subtotal, gst, total, count } = useMemo(() => {
    const sub = items.reduce((a, i) => a + i.price * i.quantity, 0);
    const g = +(sub * GST_RATE).toFixed(2);
    return {
      subtotal: +sub.toFixed(2),
      gst: g,
      total: +(sub + g).toFixed(2),
      count: items.reduce((a, i) => a + i.quantity, 0),
    };
  }, [items]);

  return (
    <Ctx.Provider value={{
      items, isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add, remove, setQty, clear,
      subtotal, gst, total, count,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
