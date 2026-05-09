import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { IndianRupee, Clock, CheckCircle2, Users, Sparkles, AlertTriangle, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/ik/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: () => <AdminShell><AdminDashboard /></AdminShell>,
  head: () => ({ meta: [{ title: "Admin Dashboard — IK Smart Canteen" }] }),
});

function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, active: 0, completed: 0, students: 0 });
  const [weekly, setWeekly] = useState<{ day: string; v: number }[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number; fill: string }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const today = new Date(); today.setHours(0,0,0,0);
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 6);

      const [ordersRes, profilesRes, itemsRes, invRes] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at,user_id").gte("created_at", weekAgo.toISOString()).order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("order_items").select("name,quantity").gte("created_at", weekAgo.toISOString()),
        supabase.from("inventory").select("*"),
      ]);

      const orders = ordersRes.data ?? [];
      const todayISO = today.toISOString();
      const todays = orders.filter((o) => o.created_at >= todayISO);
      const revenue = todays.reduce((a, o) => a + Number(o.total), 0);
      const active = todays.filter((o) => o.status === "preparing").length;
      const completed = todays.filter((o) => o.status === "completed" || o.status === "ready").length;

      setStats({ revenue, active, completed, students: profilesRes.count ?? 0 });

      // weekly chart
      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        days[d.toLocaleDateString("en", { weekday: "short" })] = 0;
      }
      orders.forEach((o) => {
        const k = new Date(o.created_at).toLocaleDateString("en", { weekday: "short" });
        if (k in days) days[k] += Number(o.total);
      });
      setWeekly(Object.entries(days).map(([day, v]) => ({ day, v })));

      // category pie via order_items joined to menu
      const { data: cats } = await supabase.from("order_items").select("quantity, menu_items(category), orders!inner(created_at)").gte("orders.created_at", weekAgo.toISOString());
      const counts: Record<string, number> = {};
      (cats ?? []).forEach((r: any) => {
        const c = r.menu_items?.category ?? "Other";
        counts[c] = (counts[c] ?? 0) + r.quantity;
      });
      const palette = ["oklch(0.72 0.18 48)", "oklch(0.85 0.12 80)", "oklch(0.65 0.16 145)", "oklch(0.62 0.18 240)"];
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      setPieData(Object.entries(counts).map(([name, v], i) => ({ name, value: Math.round((v/total)*100), fill: palette[i % palette.length] })));

      setRecent(orders.slice(0, 5));
      setLowStock((invRes.data ?? []).filter((i: any) => (i.total_stock - i.used) <= i.low_threshold));
    };
    load();
    const ch = supabase.channel("admin-dash").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live overview of today's kitchen</p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} label="Today's Revenue" value={`₹${stats.revenue.toFixed(0)}`} trend="Live" />
        <StatCard icon={Clock} label="Active Orders" value={String(stats.active)} trend="Live" />
        <StatCard icon={CheckCircle2} label="Completed Today" value={String(stats.completed)} trend="Today" />
        <StatCard icon={Users} label="Total Students" value={String(stats.students)} trend="Registered" />
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="text-sm"><span className="font-semibold text-primary">AI Insight: </span>Weekly trends auto-update from real orders. Watch low-stock items closely.</div>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-bold">Weekly Revenue</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid stroke="oklch(0.32 0.025 120 / 30%)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.72 0.02 90)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.02 90)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ background: "oklch(0.22 0.025 128)", border: "1px solid oklch(0.32 0.025 120 / 60%)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="url(#g)" radius={[8,8,0,0]} />
                <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="oklch(0.78 0.16 60)" /><stop offset="100%" stopColor="oklch(0.62 0.18 40)" /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold">Orders by Category</h3>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData.length ? pieData : [{ name: "No data", value: 1, fill: "oklch(0.32 0.025 120)" }]} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {(pieData.length ? pieData : [{ name: "No data", value: 1, fill: "oklch(0.32 0.025 120)" }]).map((e) => <Cell key={e.name} fill={e.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2 text-sm">
            {pieData.map((p) => (
              <li key={p.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.fill }} />{p.name}</span>
                <span className="font-semibold text-muted-foreground">{p.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-bold">Recent Orders</h3>
          <div className="mt-4 space-y-3">
            {recent.length === 0 && <div className="text-sm text-muted-foreground">No orders yet.</div>}
            {recent.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4">
                <div>
                  <div className="font-semibold">#{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">₹{Number(o.total).toFixed(2)}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    o.status === "ready" ? "bg-emerald-500/15 text-emerald-400" :
                    o.status === "completed" ? "bg-blue-500/15 text-blue-400" : "bg-primary/15 text-primary"
                  }`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="flex items-center gap-2 text-amber-400"><AlertTriangle className="h-4 w-4" /><span className="font-semibold">Low Stock</span></div>
            <ul className="mt-3 space-y-1 text-sm text-foreground/80">
              {lowStock.length === 0 ? <li className="text-muted-foreground">All stock healthy ✓</li> :
                lowStock.map((i: any) => (
                  <li key={i.id}>• {i.item_name}: {(i.total_stock - i.used).toFixed(1)} {i.unit} left</li>
                ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-primary"><TrendingUp className="h-4 w-4" /><span className="font-semibold">Quick Actions</span></div>
            <p className="mt-2 text-xs text-muted-foreground">Manage menu, inventory and review orders from the sidebar.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Icon className="h-5 w-5" /></div>
        <span className="text-xs font-semibold text-emerald-400">↗ {trend}</span>
      </div>
      <div className="mt-5 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
