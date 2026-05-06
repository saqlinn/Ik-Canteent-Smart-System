import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, ChefHat } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroFood from "@/assets/hero-food.jpg";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create Account — IK Smart Canteen" }] }),
});

function SignupPage() {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex">
        <img src={heroFood} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="relative z-10">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="relative z-10 max-w-md">
          <span className="ik-chip mb-5"><ChefHat className="h-3 w-3" /> Campus Pre-Order System</span>
          <h1 className="font-display text-5xl font-bold leading-tight">
            It's time to order
            <br />
            <span className="italic-display">something delicious.</span>
          </h1>
          <p className="mt-5 text-muted-foreground">
            Join IK Smart Canteen and pre-order homestyle meals crafted fresh every day — skip the queue, savor the taste.
          </p>
          <div className="mt-10 flex gap-10">
            {[
              { v: "Fresh", l: "Daily Menu" },
              { v: "0", l: "Queue Time" },
              { v: "100%", l: "Homemade" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-xl font-bold">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
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

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="e.g. Priya Krishnan" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input placeholder="10-digit mobile number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Department</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>Select dept</option>
                  <option>Computer Science</option>
                  <option>Mechanical</option>
                  <option>Electrical</option>
                  <option>Civil</option>
                  <option>Electronics</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>Year</option>
                  <option>1st</option>
                  <option>2nd</option>
                  <option>3rd</option>
                  <option>4th</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Student Register Number</Label>
              <Input placeholder="e.g. 22CS001" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPwd ? "text" : "password"} placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button asChild className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
              <Link to="/menu">Create Account →</Link>
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">Sign In →</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
