import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, ShoppingCart, Search, Plus, Star, Clock, Sparkles, Home, History as HistoryIcon, LogOut } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dishBiryani from "@/assets/dish-biryani.jpg";
import dishDosa from "@/assets/dish-dosa.jpg";
import dishIdli from "@/assets/dish-idli.jpg";
import dishChai from "@/assets/dish-chai.jpg";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
  head: () => ({ meta: [{ title: "Menu — IK Smart Canteen" }] }),
});

type Item = { id: string; name: string; price: number; desc: string; img: string; rating: number; eta: number; cat: string; bestSeller?: boolean };

const ITEMS: Item[] = [
  { id: "1", name: "Idli Sambar Combo", price: 40, desc: "Soft idlis with hot sambar & chutneys", img: dishIdli, rating: 4.9, eta: 8, cat: "Breakfast", bestSeller: true },
  { id: "2", name: "Masala Dosa", price: 50, desc: "Crispy golden dosa with potato masala", img: dishDosa, rating: 4.8, eta: 10, cat: "Breakfast" },
  { id: "3", name: "Chicken Biryani", price: 120, desc: "Aromatic basmati rice with tender chicken", img: dishBiryani, rating: 4.9, eta: 15, cat: "Lunch", bestSeller: true },
  { id: "4", name: "Veg Meals", price: 80, desc: "Rice, sambar, rasam, poriyal & curd", img: dishBiryani, rating: 4.7, eta: 12, cat: "Lunch" },
  { id: "5", name: "Masala Chai", price: 15, desc: "Hot, spiced & freshly brewed", img: dishChai, rating: 4.9, eta: 4, cat: "Drinks" },
  { id: "6", name: "Filter Coffee", price: 20, desc: "Authentic South Indian filter coffee", img: dishChai, rating: 4.8, eta: 5, cat: "Drinks" },
];

const CATS = ["Breakfast", "Lunch", "Snacks", "Drinks"] as const;

function MenuPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("Breakfast");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  const items = useMemo(
    () => ITEMS.filter((i) => i.cat === cat && i.name.toLowerCase().includes(q.toLowerCase())),
    [cat, q]
  );
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-border/50 px-8 py-6">
          <div>
            <h1 className="font-display text-3xl font-bold">Order Food 🍽️</h1>
            <p className="text-sm text-muted-foreground">Wednesday, 6 May</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">{cartCount}</span>
              )}
            </Button>
          </div>
        </header>

        <div className="px-8 py-6">
          <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <span className="font-semibold text-primary">AI Suggestion: </span>
              <span className="text-foreground/90">Try Chicken Biryani + Masala Chai combo — 92% of CS students ordered this today! 🔥</span>
            </div>
          </div>

          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search food items..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-12 rounded-full border-border bg-card pl-12 text-sm"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  cat === c
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "border border-border bg-card text-foreground/80 hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.length === 0 && (
              <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
                No items match your search.
              </div>
            )}
            {items.map((it) => (
              <article key={it.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="relative">
                  <img src={it.img} alt={it.name} loading="lazy" width={800} height={800} className="h-56 w-full object-cover" />
                  {it.bestSeller && (
                    <span className="absolute left-3 top-3 rounded-full bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Best Seller</span>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-sm font-bold text-primary backdrop-blur">₹{it.price}</span>
                  <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
                    <Star className="h-3 w-3 fill-primary text-primary" /> {it.rating}
                    <span className="text-muted-foreground">•</span>
                    <Clock className="h-3 w-3" /> {it.eta} min
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold">{it.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
                  <Button onClick={() => add(it.id)} className="mt-4 w-full bg-primary/15 text-primary hover:bg-primary/25">
                    <Plus className="mr-1 h-4 w-4" /> Add to Cart
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StudentSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border/50 bg-surface/40 p-6 md:flex">
      <Link to="/"><Logo /></Link>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary font-bold text-primary-foreground">P</div>
        <div>
          <div className="font-semibold">Priya Krishnan</div>
          <div className="text-xs text-muted-foreground">22CS001 • CS Dept</div>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {[
          { icon: Home, label: "Menu", active: true },
          { icon: Clock, label: "My Orders" },
          { icon: HistoryIcon, label: "History" },
        ].map(({ icon: Icon, label, active }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              active
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </a>
        ))}
      </nav>

      <Link to="/" className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
        <LogOut className="h-4 w-4" /> Log Out
      </Link>
    </aside>
  );
}
