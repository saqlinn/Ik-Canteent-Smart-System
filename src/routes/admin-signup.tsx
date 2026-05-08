import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, ChefHat } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroFood from "@/assets/hero-food.jpg";

export const Route = createFileRoute("/admin-signup")({
  component: AdminSignup,
  head: () => ({ meta: [{ title: "Create Admin Account — IK Smart Canteen" }] }),
});

function AdminSignup() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ full_name: "", email: "", phone: "", password: "" });
  const u = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: f.email,
        password: f.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            full_name: f.full_name,
            phone: f.phone,
            role: "admin",
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        const sid = crypto.randomUUID();
        localStorage.setItem("ik_session_id", sid);
        setTimeout(() => {
          supabase.from("profiles").update({ active_session_id: sid }).eq("user_id", data.user!.id);
        }, 600);
      }
      toast.success("Admin account created!");
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message ?? "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex">
        <img src={heroFood} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="relative z-10"><Link to="/"><Logo /></Link></div>
        <div className="relative z-10 max-w-md">
          <span className="ik-chip mb-5"><ChefHat className="h-3 w-3" /> Kitchen Operations</span>
          <h1 className="font-display text-5xl font-bold leading-tight">
            Run the kitchen<br /><span className="italic-display">like a pro.</span>
          </h1>
          <p className="mt-5 text-muted-foreground">Manage menu, inventory, orders & analytics — all from one panel.</p>
        </div>
        <div />
      </aside>

      <main className="flex flex-col p-6 md:p-10">
        <Link to="/login" search={{ tab: "admin" }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        <div className="mx-auto mt-12 w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <h2 className="font-display text-3xl font-bold">Create Admin Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">For kitchen staff & administrators only</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2"><Label>Full Name</Label><Input required value={f.full_name} onChange={u("full_name")} placeholder="Indumathi R." /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" required value={f.email} onChange={u("email")} placeholder="admin@induskitchen.com" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input required value={f.phone} onChange={u("phone")} placeholder="10-digit mobile" /></div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPwd ? "text" : "password"} required minLength={6} value={f.password} onChange={u("password")} placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
              {busy ? "Creating..." : "Create Admin Account →"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an admin account?{" "}
              <Link to="/login" search={{ tab: "admin" }} className="font-semibold text-primary hover:underline">Sign In →</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
