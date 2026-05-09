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

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create Account — IK Smart Canteen" }] }),
});

function SignupPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    full_name: "", email: "", phone: "", department: "Computer Science",
    year: "1st", register_no: "", college: "", password: "",
  });
  const u = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Pre-check unique register number
      const { data: existing } = await supabase.from("profiles").select("id").eq("register_no", f.register_no).maybeSingle();
      if (existing) throw new Error("Register number already registered");

      const { data, error } = await supabase.auth.signUp({
        email: f.email,
        password: f.password,
        options: {
          emailRedirectTo: `${window.location.origin}/menu`,
          data: {
            full_name: f.full_name, register_no: f.register_no, college: f.college,
            department: f.department, year: f.year, phone: f.phone,
          },
        },
      });
      if (error) throw error;
      toast.success("Account created — welcome!");
      navigate({ to: "/menu" });
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
          <span className="ik-chip mb-5"><ChefHat className="h-3 w-3" /> Campus Pre-Order System</span>
          <h1 className="font-display text-5xl font-bold leading-tight">
            It's time to order<br /><span className="italic-display">something delicious.</span>
          </h1>
        </div>
        <div />
      </aside>

      <main className="flex flex-col p-6 md:p-10">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mx-auto mt-8 w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <h2 className="font-display text-3xl font-bold">Create Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Register as a student to start pre-ordering</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Full Name</Label><Input required value={f.full_name} onChange={u("full_name")} placeholder="Priya Krishnan" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input required value={f.phone} onChange={u("phone")} placeholder="10-digit mobile" /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" required value={f.email} onChange={u("email")} placeholder="you@college.edu" /></div>
            <div className="space-y-2"><Label>College</Label><Input required value={f.college} onChange={u("college")} placeholder="e.g. Anna University" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Department</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={f.department} onChange={u("department")}>
                  <option>Computer Science</option><option>Mechanical</option><option>Electrical</option><option>Civil</option><option>Electronics</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={f.year} onChange={u("year")}>
                  <option>1st</option><option>2nd</option><option>3rd</option><option>4th</option>
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>Student Register Number</Label><Input required value={f.register_no} onChange={u("register_no")} placeholder="e.g. 22CS001" /></div>
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
              {busy ? "Creating..." : "Create Account →"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already registered? <Link to="/login" className="font-semibold text-primary hover:underline">Sign In →</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
