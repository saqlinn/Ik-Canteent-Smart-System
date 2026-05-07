import { Link, useNavigate } from "@tanstack/react-router";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function SideCart() {
  const { items, isOpen, close, setQty, remove, subtotal, gst, total, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please log in to checkout");
      close();
      navigate({ to: "/login" });
      return;
    }
    close();
    navigate({ to: "/checkout" });
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-elegant transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Your Cart</h2>
              <p className="text-xs text-muted-foreground">{count} {count === 1 ? "item" : "items"}</p>
            </div>
          </div>
          <button onClick={close} aria-label="Close" className="rounded-full p-2 text-muted-foreground hover:bg-card hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button onClick={close} variant="outline" className="mt-6">Continue Ordering</Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.name} className="h-20 w-20 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-2xl">🍽️</div>
                  )}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold">{it.name}</div>
                      <button onClick={() => remove(it.id)} aria-label="remove" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-primary font-bold">₹{it.price}</div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-border bg-background/50">
                        <button onClick={() => setQty(it.id, it.quantity - 1)} className="grid h-8 w-8 place-items-center text-foreground hover:text-primary" aria-label="decrease">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{it.quantity}</span>
                        <button onClick={() => setQty(it.id, it.quantity + 1)} className="grid h-8 w-8 place-items-center text-foreground hover:text-primary" aria-label="increase">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold">₹{(it.price * it.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border bg-surface/50 px-6 py-5">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span></div>
            </div>
            <Button onClick={handleCheckout} className="mt-4 w-full bg-gradient-primary text-primary-foreground shadow-glow">
              Proceed to Payment →
            </Button>
            <Button onClick={close} variant="outline" className="mt-2 w-full">Continue Ordering</Button>
          </footer>
        )}
      </aside>
    </>
  );
}
