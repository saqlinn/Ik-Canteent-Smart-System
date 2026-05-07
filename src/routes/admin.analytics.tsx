import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/ik/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  component: () => <AdminShell><Analytics /></AdminShell>,
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
});

function Analytics() {
  const [weekly, setWeekly] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [bestsellers, setBest] = useState<any[]>([]);
  const [totals, setTotals] = useState({ week: 0, month: 0, count: 0 });

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0,0,0,0);

      const [{ data: ord }, { data: it }] = await Promise.all([
        supabase.from("orders").select("total,created_at").gte("created_at", monthStart.toISOString()),
        supabase.from("order_items").select("name,quantity,price,created_at").gte("created_at", monthStart.toISOString()),
      ]);

      const orders = ord ?? [];
      const items = it ?? [];

      const wk: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); wk[d.toLocaleDateString("en", { weekday: "short" })] = 0; }
      orders.filter((o) => o.created_at >= weekStart.toISOString()).forEach((o) => {
        const k = new Date(o.created_at).toLocaleDateString("en", { weekday: "short" });
        if (k in wk) wk[k] += Number(o.total);
      });
      setWeekly(Object.entries(wk).map(([day, v]) => ({ day, v })));

      const mo: Record<string, number> = {};
      orders.forEach((o) => {
        const k = new Date(o.created_at).getDate().toString();
        mo[k] = (mo[k] ?? 0) + Number(o.total);
      });
      setMonthly(Object.entries(mo).sort((a,b) => +a[0] - +b[0]).map(([d, v]) => ({ d: `Day ${d}`, v })));

      const counts: Record<string, number> = {};
      items.forEach((i) => { counts[i.name] = (counts[i.name] ?? 0) + i.quantity; });
      const best = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
      setBest(best);

      const weekTotal = orders.filter((o) => o.created_at >= weekStart.toISOString()).reduce((a, o) => a + Number(o.total), 0);
      const monthTotal = orders.reduce((a, o) => a + Number(o.total), 0);
      setTotals({ week: weekTotal, month: monthTotal, count: orders.length });
    };
    load();
    const ch = supabase.channel("analytics").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Real revenue & best-seller insights, live from your kitchen.</p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <Stat label="This Week" value={`₹${totals.week.toFixed(0)}`} />
        <Stat label="This Month" value={`₹${totals.month.toFixed(0)}`} />
        <Stat label="Total Orders (Month)" value={String(totals.count)} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Weekly Revenue">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid stroke="oklch(0.32 0.025 120 / 30%)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.72 0.02 90)" fontSize={12} />
              <YAxis stroke="oklch(0.72 0.02 90)" fontSize={12} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ background: "oklch(0.22 0.025 128)", border: "1px solid oklch(0.32 0.025 120 / 60%)", borderRadius: 12 }} />
              <Bar dataKey="v" fill="oklch(0.72 0.18 48)" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid stroke="oklch(0.32 0.025 120 / 30%)" strokeDasharray="3 3" />
              <XAxis dataKey="d" stroke="oklch(0.72 0.02 90)" fontSize={11} />
              <YAxis stroke="oklch(0.72 0.02 90)" fontSize={12} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ background: "oklch(0.22 0.025 128)", border: "1px solid oklch(0.32 0.025 120 / 60%)", borderRadius: 12 }} />
              <Line dataKey="v" stroke="oklch(0.72 0.18 48)" strokeWidth={3} dot={{ fill: "oklch(0.72 0.18 48)" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-bold">Best Sellers (This Month)</h3>
        <ul className="mt-4 space-y-2">
          {bestsellers.length === 0 && <li className="text-sm text-muted-foreground">No sales yet this month.</li>}
          {bestsellers.map((b, i) => (
            <li key={b.name} className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">{i + 1}</span>
                <span className="font-semibold">{b.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{b.count} sold</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <div className="mt-4 h-72">{children}</div>
    </div>
  );
}
