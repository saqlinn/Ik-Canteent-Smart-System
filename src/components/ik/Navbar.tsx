import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingCart, LogOut, User as UserIcon, ChefHat } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/menu", label: "Menu" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut, profile } = useAuth();
  const { count, open: openCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="shrink-0"><Logo /></Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && (
            <button onClick={openCart} className="relative rounded-full border border-border p-2.5 hover:border-primary/40" aria-label="cart">
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">{count}</span>
              )}
            </button>
          )}
          {!user ? (
            <>
              <Button asChild variant="outline" size="sm"><Link to="/login">Log In</Link></Button>
              <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
                <Link to="/menu">Pre-Order Now</Link>
              </Button>
            </>
          ) : (
            <>
              {isAdmin ? (
                <Button asChild variant="outline" size="sm"><Link to="/admin"><ChefHat className="mr-1 h-4 w-4" />Admin</Link></Button>
              ) : (
                <Button asChild variant="outline" size="sm"><Link to="/menu"><UserIcon className="mr-1 h-4 w-4" />{profile?.full_name?.split(" ")[0] ?? "Account"}</Link></Button>
              )}
              <Button onClick={handleLogout} size="sm" variant="ghost"><LogOut className="h-4 w-4" /></Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen((v) => !v)} aria-label="menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/50 bg-background/95 px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-base font-medium" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              {!user ? (
                <>
                  <Button asChild variant="outline" className="flex-1"><Link to="/login">Log In</Link></Button>
                  <Button asChild className="flex-1 bg-gradient-primary text-primary-foreground"><Link to="/menu">Pre-Order</Link></Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to={isAdmin ? "/admin" : "/menu"}>{isAdmin ? "Admin" : "Menu"}</Link>
                  </Button>
                  <Button onClick={handleLogout} className="flex-1 bg-gradient-primary text-primary-foreground">Log Out</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
