import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Smartphone, Building2 } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Checkout — IK Smart Canteen" }] }),
});

const upiApps = [
  { id: "gpay", name: "Google Pay", color: "from-blue-500 to-green-500" },
  { id: "phonepe", name: "PhonePe", color: "from-purple-600 to-purple-400" },
  { id: "paytm", name: "Paytm", color: "from-sky-500 to-blue-600" },
];
const banks = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Canara Bank"];

function Checkout() {
  const { items, subtotal, gst, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"upi" | "netbanking">("upi");
  const [chosen, setChosen] = useState<string>("gpay");
  const [upiId, setUpiId] = useState("");
  const [stage, setStage] = useState<"form" | "processing">("form");

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (items.length === 0 && stage === "form") {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
          <Button asChild className="mt-6 bg-gradient-primary text-primary-foreground"><Link to="/menu">Browse Menu</Link></Button>
        </div>
      </div>
    );
  }

  const upiValid = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim());
  const canPay = method === "upi" ? upiValid : !!chosen;

  const pay = async () => {
    if (!user) return;
    if (method === "upi" && !upiValid) { toast.error("Enter a valid UPI ID (e.g. name@okicici)"); return; }
    setStage("processing");
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const label = method === "upi" ? `UPI - ${upiApps.find(u => u.id === chosen)?.name}` : `Net Banking - ${chosen}`;
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id, subtotal, gst, total, status: "preparing",
        payment_method: label, upi_id: method === "upi" ? upiId.trim() : null,
      }).select().single();
      if (error) throw error;

      const lines = items.map((i) => ({
        order_id: order.id, menu_item_id: i.id, name: i.name, price: i.price, quantity: i.quantity,
      }));
      const { error: e2 } = await supabase.from("order_items").insert(lines);
      if (e2) throw e2;

      clear();
      navigate({ to: "/order/$id", params: { id: order.id } });
    } catch (e: any) {
      toast.error(e.message ?? "Payment failed");
      setStage("form");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/menu" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Menu
          </Link>
          <Logo />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {stage === "processing" && (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-6 font-display text-2xl font-bold">Processing Payment...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your order.</p>
          </div>
        )}


        {stage === "form" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <h1 className="font-display text-3xl font-bold">Choose Payment Method</h1>
              <p className="mt-1 text-sm text-muted-foreground">Secure & instant — pay your way.</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {([
                  { id: "upi", label: "UPI", icon: Smartphone },
                  { id: "netbanking", label: "Net Banking", icon: Building2 },
                ] as const).map(({ id, label, icon: I }) => (
                  <button key={id} onClick={() => setMethod(id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      method === id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
                    }`}>
                    <I className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{label}</span>
                  </button>
                ))}
              </div>

              {method === "upi" && (
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {upiApps.map((u) => (
                    <button key={u.id} onClick={() => setChosen(u.id)}
                      className={`rounded-2xl border p-5 text-center transition ${
                        chosen === u.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
                      }`}>
                      <div className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${u.color} text-xl font-black text-white`}>
                        {u.name[0]}
                      </div>
                      <div className="text-sm font-semibold">{u.name}</div>
                    </button>
                  ))}
                </div>
              )}

              {method === "upi" && (
                <div className="mt-6 space-y-2">
                  <Label htmlFor="upi">Your UPI ID</Label>
                  <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okicici" autoComplete="off"
                    className="h-12 rounded-xl bg-card" />
                  <p className="text-xs text-muted-foreground">e.g. <code>9876543210@ybl</code> or <code>name@okhdfcbank</code>. We use this to validate your transaction.</p>
                </div>
              )}
                <div className="mt-6 space-y-3">
                  <label className="text-sm font-medium">Select Your Bank</label>
                  <select value={chosen} onChange={(e) => setChosen(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm">
                    <option value="">Choose a bank...</option>
                    {banks.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
            </div>

            <aside className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-lg font-bold">Order Summary</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between">
                    <span>{i.name} × {i.quantity}</span>
                    <span>₹{(i.price * i.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span></div>
              </div>
              <Button onClick={pay} disabled={!canPay} className="mt-5 w-full bg-gradient-primary text-primary-foreground shadow-glow">
                Pay ₹{total.toFixed(2)}
              </Button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
