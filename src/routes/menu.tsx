import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, ShoppingCart, Search, Plus, Star, Clock, Sparkles, Home, History as HistoryIcon, LogOut } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import dishBiryani from "@/assets/dish-biryani.jpg";
import dishDosa from "@/assets/dish-dosa.jpg";
import dishIdli from "@/assets/dish-idli.jpg";
import dishChai from "@/assets/dish-chai.jpg";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
  head: () => ({ meta: [{ title: "Menu — IK Smart Canteen" }] }),
});

type MenuItem = {
  id: string; name: string; description: string | null; price: number;
  category: string; image_url: string | null; available: boolean;
  best_seller: boolean; rating: number | null; eta_min: number | null;
};

const CATS = ["Breakfast", "Lunch", "Snacks", "Drinks"] as const;

const fallbackImg: Record<string, string> = {
  "Idli Sambar Combo": dishIdli, "Masala Dosa": dishDosa,
  "Chicken Biryani": dishBiryani, "Veg Meals": dishBiryani,
  "Masala Chai": dishChai, "Filter Coffee": dishChai,
  "Samosa": dishDosa, "Vada Pav": dishDosa,
};

function MenuPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("Breakfast");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { add, count, open: openCart } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("menu_items").select("*").eq("available", true).order("created_at");
      setItems((data ?? []) as MenuItem[]);
      setLoading(false);
    };
    load();
    const ch = supabase.channel("menu-public").on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = useMemo(
    () => items.filter((i) => i.category === cat && i.name.toLowerCase().includes(q.toLowerCase())),
    [items, cat, q]
  );

  const handleAdd = (it: MenuItem) => {
    if (!user) {
      toast.error("Please log in to add items");
      navigate({ to: "/login" });
      return;
    }
    add({ id: it.id, name: it.name, price: Number(it.price), image_url: it.image_url ?? fallbackImg[it.name] ?? null });
    toast.success(`${it.name} added to cart`);
  };

  const handleLogout = async () => { await signOut(); navigate({ to: "/" }); };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border/50 bg-surface/40 p-6 md:flex">
        <Link to="/"><Logo /></Link>

        {profile && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary font-bold text-primary-foreground">
              {profile.full_name?.[0] ?? "S"}
            </div>
            <div>
              <div className="font-semibold">{profile.full_name}</div>
              <div className="text-xs text-muted-foreground">{profile.register_no} • {profile.department}</div>
            </div>
          </div>
        )}

        <nav className="mt-8 space-y-1">
          {[
            { icon: Home, label: "Menu", to: "/menu" },
            { icon: Clock, label: "About", to: "/about" },
            { icon: HistoryIcon, label: "Services", to: "/services" },
            { icon: HistoryIcon, label: "Contact", to: "/contact" },
          ].map(({ icon: Icon, label, to }) => (
            <Link key={label} to={to as any}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-card hover:text-foreground"
              activeProps={{ className: "bg-primary/15 text-primary border border-primary/30" }}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary border border-primary/30">
              <HistoryIcon className="h-4 w-4" /> Admin Panel
            </Link>
          )}
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </aside>

      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-border/50 px-8 py-6">
          <div>
            <h1 className="font-display text-3xl font-bold">Order Food 🍽️</h1>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
            <Button onClick={openCart} variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">{count}</span>
              )}
            </Button>
          </div>
        </header>

        <div className="px-8 py-6">
          <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <span className="font-semibold text-primary">AI Suggestion: </span>
              <span className="text-foreground/90">Try Chicken Biryani + Masala Chai combo — student favourite! 🔥</span>
            </div>
          </div>

          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search food items..." value={q} onChange={(e) => setQ(e.target.value)}
              className="h-12 rounded-full border-border bg-card pl-12 text-sm" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  cat === c ? "bg-gradient-primary text-primary-foreground shadow-glow" : "border border-border bg-card text-foreground/80 hover:border-primary/40"
                }`}>{c}</button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading && <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">Loading menu...</div>}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">No items match your search.</div>
            )}
            {filtered.map((it) => {
              const img = it.image_url ?? fallbackImg[it.name] ?? dishBiryani;
              return (
                <article key={it.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <div className="relative">
                    <img src={img} alt={it.name} loading="lazy" width={800} height={800} className="h-56 w-full object-cover" />
                    {it.best_seller && (
                      <span className="absolute left-3 top-3 rounded-full bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Best Seller</span>
                    )}
                    <span className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-sm font-bold text-primary backdrop-blur">₹{it.price}</span>
                    <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
                      <Star className="h-3 w-3 fill-primary text-primary" /> {it.rating}
                      <span className="text-muted-foreground">•</span>
                      <Clock className="h-3 w-3" /> {it.eta_min} min
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold">{it.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{it.description}</p>
                    <Button onClick={() => handleAdd(it)} className="mt-4 w-full bg-primary/15 text-primary hover:bg-primary/25">
                      <Plus className="mr-1 h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
