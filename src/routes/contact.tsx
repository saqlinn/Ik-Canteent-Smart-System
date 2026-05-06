import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/ik/Navbar";
import { Footer } from "@/components/ik/Footer";
import { Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Indu's Kitchen" },
      { name: "description", content: "Reach out to Indu's Kitchen for catering, collaborations, or campus orders." },
    ],
  }),
});

function ContactPage() {
  return (
    <div>
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <span className="ik-chip mb-5">[ CONTACT ]</span>
        <h1 className="font-display text-5xl font-bold md:text-6xl">
          Let's <span className="italic-display">cook</span> something together
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Have a question or want to collaborate? We'd love to hear from you.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <a href="tel:+919094696650" className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-glow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Call</div>
              <div className="font-display text-lg font-bold">+91 90946 96650</div>
            </div>
          </a>
          <a href="mailto:Indumathirajamani@gmail.com" className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-glow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Email</div>
              <div className="font-display text-base font-bold break-all">Indumathirajamani@gmail.com</div>
            </div>
          </a>
        </div>

        <blockquote className="mt-16 border-l-2 border-primary pl-4 text-left italic text-muted-foreground">
          "Crafted with passion, served with love."
        </blockquote>
      </section>
      <Footer />
    </div>
  );
}
