import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Users as UsersIcon, IndianRupee, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
  head: () => ({ meta: [{ title: "Registered Users — Admin" }] }),
});

type Row = {
  id: string;
  user_id: string;
  full_name: string;
  register_no: string | null;
  college: string | null;
  department: string | null;
  year: string | null;
  phone: string | null;
  created_at: string;
  orders_count: number;
  spent: number;
  last_order: string | null;
};

function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: orders }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id,total,created_at"),
      ]);
      const stats: Record<string, { count: number; spent: number; last: string | null }> = {};
      (orders ?? []).forEach((o: any) => {
        const s = stats[o.user_id] ??= { count: 0, spent: 0, last: null };
        s.count += 1;
        s.spent += Number(o.total);
        if (!s.last || o.created_at > s.last) s.last = o.created_at;
      });
      setRows((profiles ?? []).map((p: any) => ({
        ...p,
        orders_count: stats[p.user_id]?.count ?? 0,
        spent: stats[p.user_id]?.spent ?? 0,
        last_order: stats[p.user_id]?.last ?? null,
      })));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.full_name, r.register_no, r.college, r.department, r.phone].some((v) => (v ?? "").toLowerCase().includes(s))
    );
  }, [rows, q]);

  const totalSpent = rows.reduce((a, r) => a + r.spent, 0);
  const totalOrders = rows.reduce((a, r) => a + r.orders_count, 0);

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Registered Users</h1>
        <p className="text-sm text-muted-foreground">All students who signed up — with their order activity.</p>
      </header>

      <section className="grid gap-5 sm:grid-cols-3">
        <Stat icon={UsersIcon} label="Total Users" value={String(rows.length)} />
        <Stat icon={ShoppingBag} label="Total Orders" value={String(totalOrders)} />
        <Stat icon={IndianRupee} label="Lifetime Revenue" value={`₹${totalSpent.toFixed(0)}`} />
      </section>

      <div className="mt-6 relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, register no, department, phone..."
          className="h-11 rounded-full bg-card pl-12" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Register No</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Orders</th>
              <th className="px-5 py-3">Spent</th>
              <th className="px-5 py-3">Last Order</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-5 py-6 text-muted-foreground" colSpan={8}>Loading users...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td className="px-5 py-6 text-muted-foreground" colSpan={8}>No users found.</td></tr>}
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                      {u.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="font-semibold">{u.full_name}</div>
                      <div className="text-xs text-muted-foreground">{u.college ?? "—"}{u.year ? ` • ${u.year}` : ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{u.register_no ?? "—"}</td>
                <td className="px-5 py-3 text-muted-foreground">{u.department ?? "—"}</td>
                <td className="px-5 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                <td className="px-5 py-3 font-semibold">{u.orders_count}</td>
                <td className="px-5 py-3 font-bold text-primary">₹{u.spent.toFixed(0)}</td>
                <td className="px-5 py-3 text-muted-foreground">{u.last_order ? new Date(u.last_order).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Icon className="h-5 w-5" /></div>
      <div className="mt-4 font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
