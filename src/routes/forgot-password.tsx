import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/integrations/firebase/config";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
  head: () => ({ meta: [{ title: "Forgot Password — IK Smart Canteen" }] }),
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Reset link sent — check your inbox");
    } catch (err: any) {
      const msg = err.code === "auth/user-not-found"
        ? "No account found with this email"
        : err.message ?? "Failed to send reset email";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elegant">
        <Link to="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>
        <div className="mt-6"><Logo /></div>
        <h2 className="mt-6 font-display text-3xl font-bold">Forgot Password?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email — we'll send you a reset link.</p>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-sm">
            <Mail className="mb-2 h-5 w-5 text-emerald-400" />
            Reset link sent to <b>{email}</b>. Check your inbox (and spam folder).
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
              {busy ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
