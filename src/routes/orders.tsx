import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChefHat, Package, CheckCircle2, Receipt, ChevronRight } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/orders")({
  component: MyOrders,
  head: () => ({ meta: [{ title: "My Orders — IK Smart Canteen" }] }),
});

const META: Record<string, { label: string; icon: any; tone: string }> = {
  preparing: { label: "Preparing", icon: ChefHat, tone: "bg-primary/15 text-primary border-primary/30" },
  ready: { label: "Ready for Pickup", icon: Package, tone: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  completed: { label: "Collected", icon: CheckCircle2, tone: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
};

function MyOrders() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"),
      where("user_id", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort in-memory by created_at (descending)
      fetched.sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
      setOrders(fetched);
    }, (err) => {
      console.error("Error fetching orders:", err);
    });
    return () => unsub();
  }, [user]);

  const active = orders.filter((o) => o.status === "preparing" || o.status === "ready");
  const past = orders.filter((o) => o.status === "completed");

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/menu" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Menu
          </Link>
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <h1 className="font-display text-2xl font-bold md:text-3xl">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track active orders live and revisit your history anytime.</p>
        <Section title="Active" empty="No active orders right now." orders={active} />
        <Section title="History" empty="No past orders yet." orders={past} />
      </main>
    </div>
  );
}

function Section({ title, empty, orders }: { title: string; empty: string; orders: any[] }) {
  return (
    <section className="mt-6 md:mt-8">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {orders.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground md:p-8">{empty}</div>
      ) : (
        <ul className="mt-3 space-y-3">
          {orders.map((o) => {
            const meta = META[o.status] ?? META.preparing;
            const Icon = meta.icon;
            return (
              <li key={o.id}>
                <Link to="/order/$id" params={{ id: o.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card transition hover:border-primary/40 md:gap-4 md:p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary md:h-12 md:w-12">
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm">Order #{o.id.slice(0, 8)}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.tone}`}>{meta.label}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Receipt className="h-3 w-3" /> {o.created_at ? new Date(o.created_at).toLocaleString() : "—"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-primary">₹{Number(o.total).toFixed(2)}</div>
                    <div className="mt-1 inline-flex items-center text-[11px] font-medium text-primary">Track <ChevronRight className="h-3 w-3" /></div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
