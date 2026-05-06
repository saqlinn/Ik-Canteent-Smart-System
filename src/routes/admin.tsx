import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Package, BarChart3, LogOut, IndianRupee, Clock, CheckCircle2, Users, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — IK Smart Canteen" }] }),
});

const revenueData = [
  { day: "Mon", v: 3200 }, { day: "Tue", v: 4100 }, { day: "Wed", v: 3800 },
  { day: "Thu", v: 5200 }, { day: "Fri", v: 6100 }, { day: "Sat", v: 2400 }, { day: "Sun", v: 1500 },
];
const pieData = [
  { name: "Lunch", value: 42, fill: "oklch(0.72 0.18 48)" },
  { name: "Breakfast", value: 28, fill: "oklch(0.85 0.12 80)" },
  { name: "Drinks", value: 18, fill: "oklch(0.65 0.16 145)" },
  { name: "Snacks", value: 12, fill: "oklch(0.62 0.18 240)" },
];

function AdminPage() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Live overview of today's kitchen</p>
          </div>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={IndianRupee} label="Today's Revenue" value="₹510" trend="+12%" />
          <StatCard icon={Clock} label="Active Orders" value="3" trend="Live" />
          <StatCard icon={CheckCircle2} label="Completed" value="2" trend="Today" />
          <StatCard icon={Users} label="Total Students" value="148" trend="+5 new" />
        </section>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <span className="font-semibold text-primary">AI Insight: </span>
            Chicken Biryani will sell out in ~15 minutes based on current order rate. Consider preparing extra batch.
          </div>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-bold">Weekly Revenue</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid stroke="oklch(0.32 0.025 120 / 30%)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="oklch(0.72 0.02 90)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.72 0.02 90)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ background: "oklch(0.22 0.025 128)", border: "1px solid oklch(0.32 0.025 120 / 60%)", borderRadius: 12 }} />
                  <Bar dataKey="v" fill="url(#g)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.16 60)" />
                      <stop offset="100%" stopColor="oklch(0.62 0.18 40)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold">Orders by Category</h3>
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {pieData.map((e) => <Cell key={e.name} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(0.22 0.025 128)", border: "1px solid oklch(0.32 0.025 120 / 60%)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-2 text-sm">
              {pieData.map((p) => (
                <li key={p.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.fill }} />
                    {p.name}
                  </span>
                  <span className="font-semibold text-muted-foreground">{p.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-bold">Live Orders</h3>
            <div className="mt-4 space-y-3">
              {[
                { id: "#IK-1042", name: "Priya K. (22CS001)", item: "Chicken Biryani x1", status: "Preparing" },
                { id: "#IK-1041", name: "Arjun R. (22ME014)", item: "Masala Dosa x2, Chai x1", status: "Ready" },
                { id: "#IK-1040", name: "Sana M. (22EC008)", item: "Idli Combo x1", status: "Preparing" },
              ].map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4">
                  <div>
                    <div className="font-semibold">{o.id} • {o.name}</div>
                    <div className="text-sm text-muted-foreground">{o.item}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${o.status === "Ready" ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/15 text-primary"}`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Low Stock Alert</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-foreground/80">
                <li>• Chicken Biryani: 8 left</li>
                <li>• Filter Coffee: 12 left</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">Top Sellers (Week)</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between"><span>Chicken Biryani</span><span className="font-semibold">98</span></li>
                <li className="flex justify-between"><span>Masala Dosa</span><span className="font-semibold">76</span></li>
                <li className="flex justify-between"><span>Masala Chai</span><span className="font-semibold">152</span></li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold text-emerald-400">↗ {trend}</span>
      </div>
      <div className="mt-5 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function AdminSidebar() {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: ClipboardList, label: "Orders" },
    { icon: UtensilsCrossed, label: "Menu" },
    { icon: Package, label: "Inventory" },
    { icon: BarChart3, label: "Analytics" },
  ];
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border/50 bg-surface/40 p-6 md:flex">
      <Link to="/"><Logo tagline="ADMIN PANEL" /></Link>
      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-400">I</div>
        <div>
          <div className="font-semibold">Indumathi R.</div>
          <div className="text-xs text-muted-foreground">Kitchen Admin</div>
        </div>
      </div>
      <nav className="mt-8 space-y-1">
        {items.map(({ icon: Icon, label, active }) => (
          <a key={label} href="#" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
            active ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-card hover:text-foreground"
          }`}>
            <Icon className="h-4 w-4" /> {label}
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <div className="flex items-center gap-2 font-semibold text-amber-400">
          <AlertTriangle className="h-4 w-4" /> Low Stock Alert
        </div>
        <div className="mt-1 text-xs text-foreground/80">• Chicken Biryani: 8 left</div>
      </div>
      <Link to="/" className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
        <LogOut className="h-4 w-4" /> Log Out
      </Link>
    </aside>
  );
}
