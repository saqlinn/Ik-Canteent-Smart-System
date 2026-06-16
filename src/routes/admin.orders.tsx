import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, getDocs, where, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
});

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("created_at", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const openOrder = async (o: any) => {
    setSelected(o);
    setProfile(null); setItems([]); setPast([]);

    const [profileSnap, itemsSnap, pastSnap] = await Promise.all([
      getDoc(doc(db, "profiles", o.user_id)),
      getDocs(query(collection(db, "order_items"), where("order_id", "==", o.id))),
      getDocs(query(collection(db, "orders"), where("user_id", "==", o.user_id))),
    ]);

    setProfile(profileSnap.exists() ? { id: profileSnap.id, ...profileSnap.data() } : null);
    setItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    
    const pastDocs = pastSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort in-memory by created_at (descending) and limit to top 10
    pastDocs.sort((a: any, b: any) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
    setPast(pastDocs.slice(0, 10));
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      toast.success(`Order marked ${status}`);
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Orders</h1>
        <p className="text-sm text-muted-foreground">Click any order to see customer details</p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">No orders yet.</td></tr>}
            {orders.map((o) => (
              <tr key={o.id} onClick={() => openOrder(o)} className="cursor-pointer border-t border-border/50 hover:bg-background/50">
                <td className="px-4 py-4 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                <td className="px-4 py-4 text-xs">{o.created_at ? new Date(o.created_at).toLocaleString() : "—"}</td>
                <td className="px-4 py-4 font-bold text-primary">₹{Number(o.total).toFixed(2)}</td>
                <td className="px-4 py-4">
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
          <SheetHeader><SheetTitle>Order #{selected?.id?.slice(0, 8)}</SheetTitle></SheetHeader>

          {selected && (
            <div className="mt-6 space-y-5">
              <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
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

              <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
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
                  {selected.razorpay_payment_id && <div className="text-xs text-muted-foreground">Razorpay ID: {selected.razorpay_payment_id}</div>}
                </div>
              </section>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, "preparing")}>Preparing</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, "ready")}>Ready</Button>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => updateStatus(selected.id, "completed")}>Complete</Button>
              </div>

              <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
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
