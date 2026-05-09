import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, GraduationCap, ChefHat } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroFood from "@/assets/hero-food.jpg";

type Search = { tab?: "student" | "admin" };

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    tab: s.tab === "admin" ? "admin" : "student",
  }),
  head: () => ({ meta: [{ title: "Sign In — IK Smart Canteen" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/login" });

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
          <p className="mt-1 text-sm text-muted-foreground">Choose your account type to continue</p>

          <Tabs defaultValue={tab ?? "student"} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student"><GraduationCap className="mr-1.5 h-4 w-4" /> Student</TabsTrigger>
              <TabsTrigger value="admin"><ChefHat className="mr-1.5 h-4 w-4" /> Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-5">
              <LoginForm
                kind="student"
                onSuccess={() => navigate({ to: "/menu" })}
                footer={
                  <p className="text-center text-sm text-muted-foreground">
                    New here?{" "}
                    <Link to="/signup" className="font-semibold text-primary hover:underline">Create student account →</Link>
                  </p>
                }
              />
            </TabsContent>

            <TabsContent value="admin" className="mt-5">
              <LoginForm
                kind="admin"
                onSuccess={() => navigate({ to: "/admin" })}
                footer={
                  <p className="text-center text-xs text-muted-foreground">
                    Admin access is restricted. Contact the kitchen owner for credentials.
                  </p>
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function LoginForm({
  kind, onSuccess, footer,
}: { kind: "student" | "admin"; onSuccess: () => void; footer: React.ReactNode }) {
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

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");

      if (kind === "admin" && !isAdmin) {
        await supabase.auth.signOut();
        throw new Error("This account is not an admin account");
      }
      if (kind === "student" && isAdmin) {
        await supabase.auth.signOut();
        throw new Error("Admin accounts must use the Admin tab");
      }

      toast.success("Welcome back!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message ?? "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
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
        {busy ? "Signing in..." : kind === "admin" ? "Sign In as Admin →" : "Sign In →"}
      </Button>

      {footer}
    </form>
  );
}
