import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, AlertTriangle, TrendingDown, Minus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

  const load = async () => {
    const [{ data: inv }, { data: lg }] = await Promise.all([
      supabase.from("inventory").select("*").order("item_name"),
      supabase.from("inventory_logs").select("*, inventory(item_name, unit)").order("created_at", { ascending: false }).limit(20),
    ]);
    setItems(inv ?? []); setLogs(lg ?? []);
  };
  useEffect(() => { load(); }, []);

  const addStock = async (id: string, amount: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const { error } = await supabase.from("inventory").update({ total_stock: Number(item.total_stock) + amount }).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("inventory_logs").insert({ inventory_id: id, amount, kind: "stock_in", note: "Stock added" });
    toast.success(`Added ${amount} ${item.unit}`); load();
  };

  const removeStock = async (id: string, amount: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newTotal = Math.max(0, Number(item.total_stock) - amount);
    const { error } = await supabase.from("inventory").update({ total_stock: newTotal }).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("inventory_logs").insert({ inventory_id: id, amount, kind: "stock_out", note: "Stock removed" });
    toast.success(`Removed ${amount} ${item.unit}`); load();
  };

  const deleteItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from inventory? This cannot be undone.`)) return;
    await supabase.from("inventory_logs").delete().eq("inventory_id", id);
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Item deleted"); load();
  };

  const logUsage = async (id: string, amount: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const { error } = await supabase.from("inventory").update({ used: Number(item.used) + amount }).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("inventory_logs").insert({ inventory_id: id, amount, kind: "usage", note: "Daily usage" });
    toast.success(`Logged ${amount} ${item.unit} used`); load();
  };


  const addNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("inventory").insert({
      item_name: fd.get("name") as string,
      unit: fd.get("unit") as string,
      total_stock: Number(fd.get("total_stock")),
      low_threshold: Number(fd.get("low_threshold") || 5),
    });
    if (error) toast.error(error.message); else { toast.success("Item added"); load(); }
  };

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Inventory (Groceries)</h1>
          <p className="text-sm text-muted-foreground">Track monthly stock & daily usage. Low-stock alerts auto-trigger.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button className="bg-gradient-primary text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> New Grocery</Button></DialogTrigger>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => {
          const remaining = Number(it.total_stock) - Number(it.used);
          const low = remaining <= Number(it.low_threshold);
          const pct = Math.max(0, Math.min(100, (remaining / Number(it.total_stock)) * 100));
          return (
            <div key={it.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
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
                <Button size="sm" variant="outline" onClick={() => {
                  const v = prompt(`Add stock (${it.unit}):`); if (v && Number(v) > 0) addStock(it.id, Number(v));
                }}><Plus className="mr-1 h-3 w-3" /> Add Stock</Button>
                <Button size="sm" variant="outline" onClick={() => {
                  const v = prompt(`Remove stock (${it.unit}):`); if (v && Number(v) > 0) removeStock(it.id, Number(v));
                }}><Minus className="mr-1 h-3 w-3" /> Remove Stock</Button>
                <Button size="sm" variant="outline" onClick={() => {
                  const v = prompt(`Log daily usage (${it.unit}):`); if (v && Number(v) > 0) logUsage(it.id, Number(v));
                }}><TrendingDown className="mr-1 h-3 w-3" /> Use</Button>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => deleteItem(it.id, it.item_name)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold">Recent Activity</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-5 py-3">When</th><th className="px-5 py-3">Item</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Amount</th></tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-border/50">
                  <td className="px-5 py-3">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3">{l.inventory?.item_name}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${l.kind === "stock_in" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{l.kind}</span></td>
                  <td className="px-5 py-3">{l.amount} {l.inventory?.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
