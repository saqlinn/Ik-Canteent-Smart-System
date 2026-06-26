import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/ik/Navbar";
import { Footer } from "@/components/ik/Footer";
import { Utensils, Package, CalendarCheck, TrendingUp, Coffee, Leaf } from "lucide-react";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — Indu's Kitchen" },
      { name: "description", content: "Student café, bulk catering, event catering, monthly subscriptions, and healthy drinks by IK." },
    ],
  }),
});

const services = [
  { icon: Utensils, title: "Student Café", desc: "Daily fresh meals curated for college life." },
  { icon: Package, title: "Bulk Catering", desc: "Large-scale events with 900+ guest capacity." },
  { icon: CalendarCheck, title: "Monthly Subscription", desc: "Hassle-free wholesome meals every day." },
  { icon: TrendingUp, title: "Event Catering", desc: "From intimate gatherings to grand celebrations." },
  { icon: Coffee, title: "Healthy Drinks", desc: "Fermented & probiotic beverages for wellness." },
  { icon: Leaf, title: "Zero Wastage", desc: "Eco-conscious kitchen — every ingredient counts." },
];

function ServicesPage() {
  return (
    <div>
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <span className="ik-chip mb-5">[ OUR SERVICES ]</span>
          <h1 className="font-display text-5xl font-bold md:text-6xl">
            More Than Just a <span className="italic-display">Canteen</span>
          </h1>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
