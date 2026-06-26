import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChefHat, Package, CheckCircle2, ChevronRight, X } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ActiveOrder = {
  id: string;
  status: string;
  total: number;
  created_at: string;
};

const STAGE_META: Record<string, { label: string; pct: number; icon: any; tone: string }> = {
  preparing: { label: "Preparing your order", pct: 33, icon: ChefHat, tone: "text-primary" },
  ready: { label: "Ready for pickup!", pct: 100, icon: Package, tone: "text-emerald-400" },
  completed: { label: "Order collected", pct: 100, icon: CheckCircle2, tone: "text-blue-400" },
};

const DISMISS_KEY = "ik_dismissed_orders_v1";
function getDismissed(): string[] {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]"); } catch { return []; }
}
function setDismissed(ids: string[]) {
  localStorage.setItem(DISMISS_KEY, JSON.stringify(ids));
}

export function ActiveOrderBar() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [dismissed, setDismissedState] = useState<string[]>(() =>
    typeof window !== "undefined" ? getDismissed() : []
  );
  const lastStatus = useRef<Record<string, string>>({});

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideOnRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/order/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/checkout");

  useEffect(() => {
    if (!user) { setOrders([]); return; }

    const q = query(
      collection(db, "orders"),
      where("user_id", "==", user.uid),
      where("status", "in", ["preparing", "ready"])
    );

    const unsub = onSnapshot(q, (snap) => {
      const newOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActiveOrder));

      // Toast on status change
      newOrders.forEach((o) => {
        const prev = lastStatus.current[o.id];
        if (prev && prev !== o.status) {
          if (o.status === "ready") {
            toast.success("🎉 Your order is ready!", {
              description: "Head to the IK counter to collect it.",
              duration: 8000,
            });
            setDismissedState((d) => {
              const next = d.filter((x) => x !== o.id);
              setDismissed(next);
              return next;
            });
          } else if (o.status === "preparing") {
            toast("👨‍🍳 Kitchen has started preparing your order");
          }
        }
        lastStatus.current[o.id] = o.status;
      });

      setOrders(newOrders);
    });

    return () => unsub();
  }, [user]);

  if (!user || hideOnRoute) return null;
  const visible = orders.filter((o) => !dismissed.includes(o.id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissedState(next);
    setDismissed(next);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-md space-y-2">
        {visible.slice(0, 2).map((o) => {
          const meta = STAGE_META[o.status] ?? STAGE_META.preparing;
          const Icon = meta.icon;
          return (
            <Link
              key={o.id}
              to="/order/$id"
              params={{ id: o.id }}
              className="group block overflow-hidden rounded-2xl border border-primary/30 bg-card/95 shadow-elegant backdrop-blur-xl transition-all hover:border-primary hover:shadow-glow"
            >
              <div className="flex items-center gap-3 p-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 ${meta.tone} ${o.status === "preparing" ? "animate-pulse" : ""}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold">{meta.label}</div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(o.id); }}
                      className="rounded-full p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-background hover:text-foreground"
                      aria-label="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Order #{o.id.slice(0, 8)} • ₹{Number(o.total).toFixed(0)}</span>
                    <span className="flex items-center gap-0.5 font-medium text-primary">Track <ChevronRight className="h-3 w-3" /></span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-primary/15">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-all duration-700"
                      style={{ width: `${meta.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
