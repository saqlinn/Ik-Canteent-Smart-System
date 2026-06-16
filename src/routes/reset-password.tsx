import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/integrations/firebase/config";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  head: () => ({ meta: [{ title: "Reset Password — IK Smart Canteen" }] }),
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [codeValid, setCodeValid] = useState(false);

  useEffect(() => {
    // Firebase puts the oobCode in the URL query params
    const params = new URLSearchParams(window.location.search);
    const code = params.get("oobCode");
    if (code) {
      setOobCode(code);
      verifyPasswordResetCode(auth, code)
        .then(() => setCodeValid(true))
        .catch(() => {
          toast.error("Reset link is invalid or expired. Please request a new one.");
        });
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    if (!oobCode) return toast.error("Invalid reset link");
    setBusy(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated — please sign in");
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to reset password");
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
        <h2 className="mt-6 font-display text-3xl font-bold">Set New Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {codeValid ? "Choose a new password for your account." : "Open this page from the email link to continue."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy || !codeValid} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
            {busy ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
