import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, CreditCard, Smartphone, Building2, Shield } from "lucide-react";
import { Logo } from "@/components/ik/Logo";
import { Button } from "@/components/ui/button";
import { collection, addDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Checkout — IK Smart Canteen" }] }),
});

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const { items, subtotal, gst, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<"form" | "processing">("form");

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (items.length === 0 && stage === "form") {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
          <Button asChild className="mt-6 bg-gradient-primary text-primary-foreground"><Link to="/menu">Browse Menu</Link></Button>
        </div>
      </div>
    );
  }

  const saveOrderToFirestore = async (paymentMethod: string, razorpayPaymentId?: string, razorpayOrderId?: string) => {
    if (!user) return null;
    const now = new Date().toISOString();

    // Create order document
    const orderRef = await addDoc(collection(db, "orders"), {
      user_id: user.uid,
      subtotal,
      gst,
      total,
      status: "preparing",
      payment_method: paymentMethod,
      razorpay_order_id: razorpayOrderId ?? null,
      razorpay_payment_id: razorpayPaymentId ?? null,
      upi_id: null,
      created_at: now,
    });

    // Create order_items in a batch
    const batch = writeBatch(db);
    items.forEach((item) => {
      const itemRef = doc(collection(db, "order_items"));
      batch.set(itemRef, {
        order_id: orderRef.id,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      });
    });
    await batch.commit();

    return orderRef.id;
  };

  const pay = async () => {
    if (!user) return;
    setStage("processing");

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your internet connection.");

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const options = {
        key: razorpayKey,
        amount: Math.round(total * 100), // paise
        currency: "INR",
        name: "Indu's Kitchen",
        description: `Order for ${items.length} item(s)`,
        image: "/favicon.ico",
        handler: async (response: any) => {
          try {
            const orderId = await saveOrderToFirestore(
              "Razorpay",
              response.razorpay_payment_id,
              response.razorpay_order_id
            );
            clear();
            toast.success("Payment successful! Order placed.");
            navigate({ to: "/order/$id", params: { id: orderId! } });
          } catch {
            toast.error("Order saving failed. Please contact support.");
            setStage("form");
          }
        },
        prefill: {
          email: user.email ?? "",
          contact: "",
        },
        theme: { color: "#d97706" },
        modal: {
          ondismiss: () => {
            setStage("form");
            toast("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setStage("form");
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message ?? "Payment failed");
      setStage("form");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/menu" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Menu
          </Link>
          <Logo />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
        {stage === "processing" && (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-6 font-display text-2xl font-bold">Processing Payment...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your order.</p>
          </div>
        )}

        {stage === "form" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">Checkout</h1>
              <p className="mt-1 text-sm text-muted-foreground">Secure payment powered by Razorpay.</p>

              <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 text-sm font-medium">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Pay via Razorpay</div>
                    <div className="text-xs text-muted-foreground">UPI · Cards · NetBanking · Wallets</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { icon: Smartphone, label: "UPI / QR" },
                    { icon: CreditCard, label: "Cards" },
                    { icon: Building2, label: "Net Banking" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-background/40 p-3 text-center">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-400">
                  <Shield className="h-4 w-4 shrink-0" />
                  256-bit SSL encrypted · PCI-DSS compliant · Razorpay Secured
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-card p-5 shadow-card md:p-6">
              <h3 className="font-display text-lg font-bold">Order Summary</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span className="truncate">{i.name} × {i.quantity}</span>
                    <span className="shrink-0">₹{(i.price * i.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <Button onClick={pay} className="mt-5 w-full bg-gradient-primary text-primary-foreground shadow-glow">
                Pay ₹{total.toFixed(2)} →
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">By paying you agree to our terms of service.</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
