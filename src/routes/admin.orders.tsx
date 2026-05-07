import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/ik/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: () => <AdminShell><OrdersPage /></AdminShell>,
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
});

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
    setOrders(data ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("admin-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const openOrder = async (o: any) => {
    setSelected(o);
    const [{ data: p }, { data: it }, { data: pst }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", o.user_id).maybeSingle(),
      supabase.from("order_items").select("*").eq("order_id", o.id),
      supabase.from("orders").select("id,total,status,created_at").eq("user_id", o.user_id).order("created_at", { ascending: false }).limit(10),
    ]);
    setProfile(p); setItems(it ?? []); setPast(pst ?? []);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else toast.success(`Order marked ${status}`);
    load();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">Click any order to see customer details</p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">No orders yet.</td></tr>}
            {orders.map((o) => (
              <tr key={o.id} onClick={() => openOrder(o)} className="cursor-pointer border-t border-border/50 hover:bg-background/50">
                <td className="px-5 py-4 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                <td className="px-5 py-4">{new Date(o.created_at).toLocaleString()}</td>
                <td className="px-5 py-4 font-bold text-primary">₹{Number(o.total).toFixed(2)}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    o.status === "ready" ? "bg-emerald-500/15 text-emerald-400" :
                    o.status === "completed" ? "bg-blue-500/15 text-blue-400" : "bg-primary/15 text-primary"
                  }`}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Order #{selected?.id?.slice(0, 8)}</SheetTitle>
          </SheetHeader>

          {selected && (
            <div className="mt-6 space-y-6">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Customer</h4>
                <div className="mt-3 space-y-1 text-sm">
                  <div><span className="text-muted-foreground">Name: </span>{profile?.full_name ?? "—"}</div>
                  <div><span className="text-muted-foreground">Register #: </span>{profile?.register_no ?? "—"}</div>
                  <div><span className="text-muted-foreground">College: </span>{profile?.college ?? "—"}</div>
                  <div><span className="text-muted-foreground">Department: </span>{profile?.department ?? "—"}</div>
                  <div><span className="text-muted-foreground">Year: </span>{profile?.year ?? "—"}</div>
                  <div><span className="text-muted-foreground">Phone: </span>{profile?.phone ?? "—"}</div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Items</h4>
                <ul className="mt-3 space-y-2 text-sm">
                  {items.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span>{i.name} × {i.quantity}</span>
                      <span>₹{(Number(i.price) * i.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{Number(selected.subtotal).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>₹{Number(selected.gst).toFixed(2)}</span></div>
                  <div className="mt-1 flex justify-between font-bold"><span>Total</span><span className="text-primary">₹{Number(selected.total).toFixed(2)}</span></div>
                  <div className="mt-2 text-xs text-muted-foreground">Payment: {selected.payment_method ?? "—"}</div>
                </div>
              </section>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, "preparing")}>Preparing</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, "ready")}>Ready</Button>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => updateStatus(selected.id, "completed")}>Complete</Button>
              </div>

              <section className="rounded-2xl border border-border bg-card p-5">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Past Orders</h4>
                <ul className="mt-3 space-y-2 text-sm">
                  {past.filter(p => p.id !== selected.id).slice(0, 5).map((p) => (
                    <li key={p.id} className="flex justify-between text-muted-foreground">
                      <span>#{p.id.slice(0, 6)} • {new Date(p.created_at).toLocaleDateString()}</span>
                      <span>₹{Number(p.total).toFixed(2)}</span>
                    </li>
                  ))}
                  {past.length <= 1 && <li className="text-xs text-muted-foreground">No past orders.</li>}
                </ul>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
