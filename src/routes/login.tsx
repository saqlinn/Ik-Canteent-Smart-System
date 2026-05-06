import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroFood from "@/assets/hero-food.jpg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign In — IK Smart Canteen" }] }),
});

function LoginPage() {
  const [role, setRole] = useState<"student" | "admin">("student");
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex">
        <img src={heroFood} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="relative z-10">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-5xl font-bold leading-tight">
            Welcome back to
            <br />
            <span className="italic-display">Indu's Kitchen.</span>
          </h1>
          <p className="mt-5 text-muted-foreground">
            Pre-order your meals, track your orders, and never wait in a queue again.
          </p>
          <div className="mt-10 flex gap-8">
            {[
              { v: "Fresh", l: "Every Day" },
              { v: "Fast", l: "Pre-Order" },
              { v: "Home", l: "Style Meals" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl font-bold">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
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

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/40 p-1">
            {(["student", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition ${
                  role === r ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
                }`}
              >
                {r === "student" ? "🎓 Student" : "⚙️ Admin"}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label>{role === "student" ? "Register Number" : "Admin Email"}</Label>
              <Input placeholder={role === "student" ? "e.g. 22CS001" : "admin@indus-kitchen.in"} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPwd ? "text" : "password"} placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button asChild className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
              <Link to={role === "student" ? "/menu" : "/admin"}>
                Sign In as {role === "student" ? "Student" : "Admin"} →
              </Link>
            </Button>

            {role === "student" && (
              <p className="text-center text-sm text-muted-foreground">
                New student?{" "}
                <Link to="/signup" className="font-semibold text-primary hover:underline">
                  Create an account →
                </Link>
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
