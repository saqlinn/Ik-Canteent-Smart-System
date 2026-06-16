import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Package, BarChart3, LogOut, Users, Menu, X, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate({ to: "/login" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading admin...</div>;
  }

  const items = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
    { icon: ClipboardList, label: "Orders", to: "/admin/orders" },
    { icon: UtensilsCrossed, label: "Menu", to: "/admin/menu" },
    { icon: Package, label: "Inventory", to: "/admin/inventory" },
    { icon: Users, label: "Users", to: "/admin/users" },
    { icon: BarChart3, label: "Analytics", to: "/admin/analytics" },
  ] as const;

  const SidebarContent = () => (
    <>
      <Link to="/" onClick={() => setMobileOpen(false)}><Logo tagline="ADMIN PANEL" /></Link>
      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-400">I</div>
        <div>
          <div className="font-semibold">Indumathi R.</div>
          <div className="text-xs text-muted-foreground">Kitchen Admin</div>
        </div>
      </div>
      <nav className="mt-8 space-y-1">
        {items.map(({ icon: Icon, label, to }) => {
          const active = path === to;
          return (
            <Link key={label} to={to as any} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              active ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
      </nav>
      <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
        className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
        <LogOut className="h-4 w-4" /> Log Out
      </button>
    </>
  );

  const handleBack = () => {
    if (path === "/admin") {
      navigate({ to: "/" });
    } else {
      navigate({ to: "/admin" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9 rounded-full bg-surface/50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link to="/"><Logo tagline="ADMIN" /></Link>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border/50 bg-background p-6">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border/50 bg-surface/40 p-6 md:flex">
        <SidebarContent />
      </aside>

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

