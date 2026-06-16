import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChefHat, CheckCircle2, Package, Clock, Receipt } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { doc, collection, query, where, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/order/$id")({
  component: TrackOrder,
  head: () => ({ meta: [{ title: "Track Order — IK Smart Canteen" }] }),
});

const STAGES = [
  { key: "preparing", label: "Order Received", desc: "Kitchen is preparing your meal", icon: ChefHat },
  { key: "ready", label: "Ready for Pickup", desc: "Come to the counter to collect", icon: Package },
  { key: "completed", label: "Collected", desc: "Enjoy your meal!", icon: CheckCircle2 },
] as const;

function TrackOrder() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  useEffect(() => {
    if (!id) return;

    // Real-time order listener
    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    });

    // Order items (one-time fetch is fine — they don't change)
    getDoc(doc(db, "orders", id)).then(() => {
      const itemsQ = query(collection(db, "order_items"), where("order_id", "==", id));
      onSnapshot(itemsQ, (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    });

    return () => unsub();
  }, [id]);

  const status = order?.status ?? "preparing";
  const activeIdx = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> My Orders
          </Link>
          <Logo />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        {!order ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">Loading order...</div>
        ) : (
          <>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-elegant md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-primary">Order #{order.id.slice(0, 8)}</div>
                  <h1 className="mt-1 font-display text-xl font-bold md:text-2xl">
                    {status === "completed" ? "Order Collected ✅" : status === "ready" ? "Your Order is Ready! 🎉" : "We're Preparing Your Order"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {status === "ready"
                      ? "Please come to the IK counter and show this screen to collect."
                      : status === "completed"
                      ? "Thank you — see you next time!"
                      : "Updates will appear here automatically. No need to refresh."}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Clock className="h-3.5 w-3.5" /> Live
                </div>
              </div>

              <div className="mt-6 md:mt-8">
                <ol className="relative space-y-5 md:space-y-6">
                  {STAGES.map(({ key, label, desc, icon: Icon }, i) => {
                    const done = i <= activeIdx;
                    const current = i === activeIdx && status !== "completed";
                    return (
                      <li key={key} className="relative flex gap-4">
                        {i < STAGES.length - 1 && (
                          <span className={`absolute left-5 top-10 h-10 w-px ${done ? "bg-primary" : "bg-border"}`} />
                        )}
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 ${
                          done ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface text-muted-foreground"
                        } ${current ? "shadow-glow animate-pulse" : ""}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="pt-1">
                          <div className={`font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-border bg-card p-5 md:mt-6 md:p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Receipt className="h-4 w-4 text-primary" /> Order Summary</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between">
                    <span>{i.name} × {i.quantity}</span>
                    <span>₹{(Number(i.price) * i.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{Number(order.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>₹{Number(order.gst).toFixed(2)}</span></div>
                <div className="mt-1 flex justify-between border-t border-border pt-2 font-bold"><span>Total Paid</span><span className="text-primary">₹{Number(order.total).toFixed(2)}</span></div>
                <div className="pt-2 text-xs text-muted-foreground">Payment: {order.payment_method ?? "—"}{order.razorpay_payment_id ? ` • ${order.razorpay_payment_id.slice(0, 12)}...` : ""}</div>
              </div>
            </div>

            <div className="mt-5 flex gap-3 md:mt-6">
              <Button asChild variant="outline" className="flex-1"><Link to="/menu">Order More</Link></Button>
              <Button asChild className="flex-1 bg-gradient-primary text-primary-foreground"><Link to="/">Home</Link></Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
