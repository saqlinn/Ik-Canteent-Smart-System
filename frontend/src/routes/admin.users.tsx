import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Users as UsersIcon, IndianRupee, ShoppingBag } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
  head: () => ({ meta: [{ title: "Registered Users — Admin" }] }),
});

type Row = {
  id: string; user_id: string; full_name: string; register_no: string | null;
  college: string | null; department: string | null; year: string | null;
  phone: string | null; created_at: string; orders_count: number; spent: number; last_order: string | null;
};

function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [profilesSnap, ordersSnap] = await Promise.all([
        getDocs(query(collection(db, "profiles"), orderBy("created_at", "desc"))),
        getDocs(collection(db, "orders")),
      ]);
      const stats: Record<string, { count: number; spent: number; last: string | null }> = {};
      ordersSnap.docs.forEach((d) => {
        const o = d.data() as any;
        const s = stats[o.user_id] ??= { count: 0, spent: 0, last: null };
        s.count += 1;
        s.spent += Number(o.total);
        if (!s.last || o.created_at > s.last) s.last = o.created_at;
      });
      setRows(profilesSnap.docs.map((d) => {
        const p = d.data() as any;
        return {
          id: d.id, ...p,
          orders_count: stats[p.user_id]?.count ?? 0,
          spent: stats[p.user_id]?.spent ?? 0,
          last_order: stats[p.user_id]?.last ?? null,
        };
      }));
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
        <h1 className="font-display text-2xl font-bold md:text-3xl">Registered Users</h1>
        <p className="text-sm text-muted-foreground">All students who signed up — with their order activity.</p>
      </header>

      <section className="grid gap-4 grid-cols-3 md:gap-5">
        <Stat icon={UsersIcon} label="Total Users" value={String(rows.length)} />
        <Stat icon={ShoppingBag} label="Total Orders" value={String(totalOrders)} />
        <Stat icon={IndianRupee} label="Lifetime Revenue" value={`₹${totalSpent.toFixed(0)}`} />
      </section>

      <div className="mt-5 relative md:mt-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, register no, department, phone..."
          className="h-11 rounded-full bg-card pl-12" />
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card md:mt-6">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Student</th><th className="px-4 py-3">Register No</th>
              <th className="px-4 py-3">Department</th><th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th><th className="px-4 py-3">Spent</th><th className="px-4 py-3">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-5 py-6 text-muted-foreground" colSpan={7}>Loading users...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td className="px-5 py-6 text-muted-foreground" colSpan={7}>No users found.</td></tr>}
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/50">
                <td className="px-4 py-3">
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
                <td className="px-4 py-3 text-muted-foreground">{u.register_no ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.department ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">{u.orders_count}</td>
                <td className="px-4 py-3 font-bold text-primary">₹{u.spent.toFixed(0)}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.last_order ? new Date(u.last_order).toLocaleDateString() : "—"}</td>
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
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card md:p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary md:h-10 md:w-10"><Icon className="h-4 w-4 md:h-5 md:w-5" /></div>
      <div className="mt-3 font-display text-xl font-bold md:mt-4 md:text-2xl">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground md:text-sm">{label}</div>
    </div>
  );
}
