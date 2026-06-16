import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Upload, ImageIcon, Clock } from "lucide-react";
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDocs, query, where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/integrations/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/menu")({
  component: MenuAdmin,
  head: () => ({ meta: [{ title: "Menu Management — Admin" }] }),
});

const cats = ["Breakfast", "Lunch", "Snacks", "Drinks"];

function MenuAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [closings, setClosings] = useState<Record<string, { id?: string; open: string; close: string }>>({});

  useEffect(() => {
    const unsubMenu = onSnapshot(
      query(collection(db, "menu_items")),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => a.name.localeCompare(b.name)))
    );
    const unsubCat = onSnapshot(collection(db, "category_settings"), (snap) => {
      const map: Record<string, { id?: string; open: string; close: string }> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        map[data.category] = { id: d.id, open: (data.opening_time ?? "").slice(0, 5), close: (data.closing_time ?? "").slice(0, 5) };
      });
      setClosings(map);
    });
    return () => { unsubMenu(); unsubCat(); };
  }, []);

  const saveTimes = async (category: string, field: "open" | "close", time: string) => {
    setClosings((c) => ({ ...c, [category]: { ...(c[category] ?? { open: "", close: "" }), [field]: time } }));
    const current = closings[category] ?? { open: "", close: "" };
    const next = { ...current, [field]: time };
    try {
      if (current.id) {
        await updateDoc(doc(db, "category_settings", current.id), {
          opening_time: next.open || null,
          closing_time: next.close || null,
          updated_at: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, "category_settings"), {
          category,
          opening_time: next.open || null,
          closing_time: next.close || null,
          updated_at: new Date().toISOString(),
        });
      }
      toast.success(`${category} ${field === "open" ? "opening" : "closing"} time saved`);
    } catch (e: any) { toast.error(e.message); }
  };

  const onPick = (f: File | null) => {
    setImageFile(f);
    setImagePreview(f ? URL.createObjectURL(f) : null);
  };

  const openDialog = (it: any | null) => {
    setEditing(it);
    setImageFile(null);
    setImagePreview(it?.image_url ?? null);
    setOpen(true);
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setUploading(true);
    try {
      let image_url: string | undefined = editing?.image_url;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const storageRef = ref(storage, `menu-images/${crypto.randomUUID()}.${ext}`);
        const snap = await uploadBytes(storageRef, imageFile);
        image_url = await getDownloadURL(snap.ref);
      }
      const payload: any = {
        name: fd.get("name") as string,
        description: fd.get("description") as string,
        price: Number(fd.get("price")),
        category: fd.get("category") as string,
        stock: Number(fd.get("stock") || 50),
        available: editing?.available ?? true,
        best_seller: editing?.best_seller ?? false,
        rating: editing?.rating ?? 4.5,
        eta_min: editing?.eta_min ?? 15,
        updated_at: new Date().toISOString(),
      };
      if (image_url !== undefined) payload.image_url = image_url;

      if (editing) {
        await updateDoc(doc(db, "menu_items", editing.id), payload);
        toast.success("Item updated");
      } else {
        payload.created_at = new Date().toISOString();
        await addDoc(collection(db, "menu_items"), payload);
        toast.success("Item added");
      }
      setOpen(false); setEditing(null); setImageFile(null); setImagePreview(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await deleteDoc(doc(db, "menu_items", id));
    toast.success("Deleted");
  };

  const toggle = async (it: any) => {
    await updateDoc(doc(db, "menu_items", it.id), { available: !it.available });
    toast.success(it.available ? "Marked unavailable" : "Available");
  };

  return (
    <>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Menu Management</h1>
          <p className="text-sm text-muted-foreground">Add, edit, delete & toggle availability — students see changes instantly.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setImageFile(null); setImagePreview(null); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog(null)} className="bg-gradient-primary text-primary-foreground w-full sm:w-auto"><Plus className="mr-1 h-4 w-4" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Item" : "Add New Item"}</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div>
                <Label>Meal Image</Label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface/40">
                    {imagePreview ? <img src={imagePreview} alt="preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {imageFile ? "Change image" : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
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
              <Button type="submit" disabled={uploading} className="w-full bg-gradient-primary text-primary-foreground">
                {uploading ? "Saving..." : editing ? "Save Changes" : "Add Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Category Times */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="mb-3">
          <h2 className="font-display text-lg font-bold">Category Opening & Closing Times</h2>
          <p className="text-xs text-muted-foreground">Items hide from students outside these hours automatically.</p>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {cats.map((c) => {
            const t = closings[c] ?? { open: "", close: "" };
            return (
              <div key={c} className="rounded-xl border border-border bg-background/40 p-3 md:p-4">
                <div className="text-sm font-semibold">{c}</div>
                <div className="mt-2 space-y-2 md:mt-3">
                  <div><Label className="text-xs text-muted-foreground">Opens</Label><Input type="time" value={t.open} onChange={(e) => saveTimes(c, "open", e.target.value)} className="mt-1" /></div>
                  <div><Label className="text-xs text-muted-foreground">Closes</Label><Input type="time" value={t.close} onChange={(e) => saveTimes(c, "close", e.target.value)} className="mt-1" /></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu items table - scrollable on mobile */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th><th className="px-4 py-3">Available</th><th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-border/50">
                <td className="px-4 py-3">
                  {it.image_url ? <img src={it.image_url} alt={it.name} className="h-12 w-12 rounded-md object-cover" /> :
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface/60 text-muted-foreground"><ImageIcon className="h-4 w-4" /></div>}
                </td>
                <td className="px-4 py-3 font-semibold">{it.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{it.category}</td>
                <td className="px-4 py-3 text-primary font-bold">₹{it.price}</td>
                <td className="px-4 py-3">{it.stock}</td>
                <td className="px-4 py-3"><Switch checked={it.available} onCheckedChange={() => toggle(it)} /></td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => openDialog(it)}><Pencil className="h-4 w-4" /></Button>
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
