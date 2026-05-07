import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { AdminShell } from "@/components/ik/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/menu")({
  component: () => <AdminShell><MenuAdmin /></AdminShell>,
  head: () => ({ meta: [{ title: "Menu Management — Admin" }] }),
});

const cats = ["Breakfast", "Lunch", "Snacks", "Drinks"];

function MenuAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("menu_items").select("*").order("category").order("name");
    setItems(data ?? []);
  };
  useEffect(() => {
    load();
    const ch = supabase.channel("menu-admin").on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      price: Number(fd.get("price")),
      category: fd.get("category") as string,
      stock: Number(fd.get("stock") || 50),
      available: true,
    };
    const { error } = editing
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Item updated" : "Item added"); setOpen(false); setEditing(null); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Deleted");
  };

  const toggle = async (it: any) => {
    await supabase.from("menu_items").update({ available: !it.available }).eq("id", it.id);
    toast.success(it.available ? "Marked unavailable" : "Available");
  };

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Menu Management</h1>
          <p className="text-sm text-muted-foreground">Add, edit, delete & toggle availability — students see changes instantly.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Item" : "Add New Item"}</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Name</Label><Input name="name" required defaultValue={editing?.name} /></div>
              <div><Label>Description</Label><Input name="description" defaultValue={editing?.description} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price (₹)</Label><Input name="price" type="number" step="0.01" required defaultValue={editing?.price} /></div>
                <div><Label>Stock</Label><Input name="stock" type="number" defaultValue={editing?.stock ?? 50} /></div>
              </div>
              <div>
                <Label>Category</Label>
                <select name="category" defaultValue={editing?.category ?? "Breakfast"} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {cats.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">{editing ? "Save Changes" : "Add Item"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Name</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th><th className="px-5 py-3">Available</th><th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-border/50">
                <td className="px-5 py-3 font-semibold">{it.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{it.category}</td>
                <td className="px-5 py-3 text-primary font-bold">₹{it.price}</td>
                <td className="px-5 py-3">{it.stock}</td>
                <td className="px-5 py-3"><Switch checked={it.available} onCheckedChange={() => toggle(it)} /></td>
                <td className="px-5 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(it); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
