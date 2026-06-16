import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, AlertTriangle, TrendingDown, Minus, Trash2 } from "lucide-react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, getDocs, writeBatch,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inventory")({
  component: Inventory,
  head: () => ({ meta: [{ title: "Inventory — Admin" }] }),
});

function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const unsubInv = onSnapshot(
      query(collection(db, "inventory"), orderBy("item_name")),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubLogs = onSnapshot(
      query(collection(db, "inventory_logs"), orderBy("created_at", "desc")),
      async (snap) => {
        const logsData = snap.docs.slice(0, 20).map((d) => ({ id: d.id, ...d.data() }));
        // Enrich with item name/unit
        const invSnap = await getDocs(collection(db, "inventory"));
        const invMap: Record<string, any> = {};
        invSnap.docs.forEach((d) => { invMap[d.id] = d.data(); });
        setLogs(logsData.map((l: any) => ({ ...l, inventory: invMap[l.inventory_id] })));
      }
    );
    return () => { unsubInv(); unsubLogs(); };
  }, []);

  const addStock = async (id: string, amount: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await updateDoc(doc(db, "inventory", id), { total_stock: Number(item.total_stock) + amount, updated_at: new Date().toISOString() });
    await addDoc(collection(db, "inventory_logs"), { inventory_id: id, amount, kind: "stock_in", note: "Stock added", created_at: new Date().toISOString() });
    toast.success(`Added ${amount} ${item.unit}`);
  };

  const removeStock = async (id: string, amount: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newTotal = Math.max(0, Number(item.total_stock) - amount);
    await updateDoc(doc(db, "inventory", id), { total_stock: newTotal, updated_at: new Date().toISOString() });
    await addDoc(collection(db, "inventory_logs"), { inventory_id: id, amount, kind: "stock_out", note: "Stock removed", created_at: new Date().toISOString() });
    toast.success(`Removed ${amount} ${item.unit}`);
  };

  const logUsage = async (id: string, amount: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await updateDoc(doc(db, "inventory", id), { used: Number(item.used) + amount, updated_at: new Date().toISOString() });
    await addDoc(collection(db, "inventory_logs"), { inventory_id: id, amount, kind: "usage", note: "Daily usage", created_at: new Date().toISOString() });
    toast.success(`Logged ${amount} ${item.unit} used`);
  };

  const deleteItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from inventory? This cannot be undone.`)) return;
    // Delete logs first
    const logsSnap = await getDocs(query(collection(db, "inventory_logs"), where("inventory_id", "==", id)));
    const batch = writeBatch(db);
    logsSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, "inventory", id));
    await batch.commit();
    toast.success("Item deleted");
  };

  const addNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addDoc(collection(db, "inventory"), {
      item_name: fd.get("name") as string,
      unit: fd.get("unit") as string,
      total_stock: Number(fd.get("total_stock")),
      used: 0,
      low_threshold: Number(fd.get("low_threshold") || 5),
      updated_at: new Date().toISOString(),
    });
    toast.success("Item added");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Inventory (Groceries)</h1>
          <p className="text-sm text-muted-foreground">Track monthly stock & daily usage. Low-stock alerts auto-trigger.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button className="bg-gradient-primary text-primary-foreground w-full sm:w-auto"><Plus className="mr-1 h-4 w-4" /> New Grocery</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Grocery Item</DialogTitle></DialogHeader>
            <form onSubmit={addNew} className="space-y-3">
              <div><Label>Name</Label><Input name="name" required placeholder="e.g. Onions" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Unit</Label><Input name="unit" required placeholder="kg / litres" /></div>
                <div><Label>Initial Stock</Label><Input name="total_stock" type="number" step="0.1" required /></div>
              </div>
              <div><Label>Low-Stock Threshold</Label><Input name="low_threshold" type="number" step="0.1" defaultValue={5} /></div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">Add Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => {
          const remaining = Number(it.total_stock) - Number(it.used);
          const low = remaining <= Number(it.low_threshold);
          const pct = Math.max(0, Math.min(100, (remaining / (Number(it.total_stock) || 1)) * 100));
          return (
            <div key={it.id} className="rounded-2xl border border-border bg-card p-4 shadow-card md:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg font-bold">{it.item_name}</div>
                  <div className="text-xs text-muted-foreground">{it.unit}</div>
                </div>
                {low && <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-400"><AlertTriangle className="h-3 w-3" /> LOW</span>}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold">{remaining.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/ {Number(it.total_stock).toFixed(1)} {it.unit}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => { const v = prompt(`Add stock (${it.unit}):`); if (v && Number(v) > 0) addStock(it.id, Number(v)); }}><Plus className="mr-1 h-3 w-3" /> Add Stock</Button>
                <Button size="sm" variant="outline" onClick={() => { const v = prompt(`Remove stock (${it.unit}):`); if (v && Number(v) > 0) removeStock(it.id, Number(v)); }}><Minus className="mr-1 h-3 w-3" /> Remove</Button>
                <Button size="sm" variant="outline" onClick={() => { const v = prompt(`Log daily usage (${it.unit}):`); if (v && Number(v) > 0) logUsage(it.id, Number(v)); }}><TrendingDown className="mr-1 h-3 w-3" /> Use</Button>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => deleteItem(it.id, it.item_name)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-6 md:mt-8">
        <h2 className="font-display text-lg font-bold">Recent Activity</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Item</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th></tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-border/50">
                  <td className="px-4 py-3 text-xs">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{l.inventory?.item_name}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${l.kind === "stock_in" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{l.kind}</span></td>
                  <td className="px-4 py-3">{l.amount} {l.inventory?.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
