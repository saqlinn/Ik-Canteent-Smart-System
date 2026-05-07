import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroFood from "@/assets/hero-food.jpg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign In — IK Smart Canteen" }] }),
});

const SESSION_KEY = "ik_session_id";

function LoginPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Login failed");

      // Single session: generate new id, write to profile, store locally
      const sid = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, sid);
      await supabase.from("profiles").update({ active_session_id: sid }).eq("user_id", data.user.id);

      // Determine role and route
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
      toast.success("Welcome back!");
      navigate({ to: isAdmin ? "/admin" : "/menu" });
    } catch (err: any) {
      toast.error(err.message ?? "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex">
        <img src={heroFood} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="relative z-10"><Link to="/"><Logo /></Link></div>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-5xl font-bold leading-tight">
            Welcome back to<br /><span className="italic-display">Indu's Kitchen.</span>
          </h1>
          <p className="mt-5 text-muted-foreground">Pre-order your meals, track your orders, and never wait in a queue again.</p>
        </div>
        <blockquote className="relative z-10 border-l-2 border-primary pl-4 italic text-muted-foreground">
          "Crafted with passion, served with love."
        </blockquote>
      </aside>

      <main className="flex flex-col p-6 md:p-10">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mx-auto mt-12 w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <h2 className="font-display text-3xl font-bold">Sign In</h2>
          <p className="mt-1 text-sm text-muted-foreground">Access your IK Canteen account</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPwd ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
              {busy ? "Signing in..." : "Sign In →"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account →</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
