import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/ik/Navbar";
import { Footer } from "@/components/ik/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Zap,
  Heart,
  Droplets,
  Sun,
  FlaskConical,
  CheckCircle2,
  Star,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Sparkles,
  Microscope,
  Flower,
  Globe,
  Users,
  Award,
  UtensilsCrossed,
  Beaker,
} from "lucide-react";

export const Route = createFileRoute("/wild-fermentation")({
  component: WildFermentationPage,
  head: () => ({
    meta: [
      { title: "Wild Fermentation Drinks — Indus Kitchen | Natural Probiotic Beverages" },
      {
        name: "description",
        content:
          "Discover Wild Fermentation at Indus Kitchen — ancient wisdom, naturally crafted probiotic beverages for modern wellness. Gut health, immunity, and natural energy.",
      },
      { name: "keywords", content: "wild fermentation, probiotic drinks, gut health, natural beverages, fermented drinks, Indus Kitchen, wellness drinks" },
    ],
  }),
});

/* ─────────────────────────────── helpers ─────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─────────────────────────────── page ─────────────────────────────── */
function WildFermentationPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <WhatIsSection />
      <ProcessSection />
      <BenefitsSection />
      <WhyIKSection />
      <GallerySection />
      <CustomersSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactCTA />
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 1 — HERO
═══════════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative isolate min-h-[100svh] flex items-center overflow-hidden">
      {/* background gradient — earthy green/amber */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,oklch(0.28_0.09_140/50%)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.28_0.08_60/40%)_0%,transparent_55%),oklch(0.14_0.03_140)]" />

      {/* floating blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="wf-blob wf-blob-1" />
        <div className="wf-blob wf-blob-2" />
        <div className="wf-blob wf-blob-3" />
        {/* decorative bubbles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="wf-bubble"
            style={{
              left: `${8 + i * 8}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + (i % 4)}s`,
              width: `${8 + (i % 5) * 6}px`,
              height: `${8 + (i % 5) * 6}px`,
              bottom: `${5 + (i % 6) * 8}%`,
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-6 py-32 md:py-40 grid md:grid-cols-2 gap-16 items-center w-full">
        <div>
          <span className="ik-chip mb-6">✦ Ancient Wisdom · Modern Wellness</span>
          <h1 className="font-display text-5xl font-bold leading-[1.08] md:text-6xl xl:text-7xl">
            Discover the{" "}
            <span className="italic-display">Power</span>
            <br /> of Wild{" "}
            <span className="italic-display">Fermentation</span>
          </h1>
          <p className="mt-6 max-w-lg text-base text-muted-foreground md:text-lg">
            Ancient wisdom, naturally crafted beverages, modern wellness. Pure probiotic drinks brewed the way nature intended — no additives, no shortcuts.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#what-is">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Button asChild size="lg" variant="outline" className="border-primary/40">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>

          <div className="mt-12 flex gap-8">
            {[
              { label: "100% Natural", sub: "No preservatives" },
              { label: "Probiotic Rich", sub: "Gut-friendly" },
              { label: "17+ Yrs", sub: "Culinary trust" },
            ].map(({ label, sub }) => (
              <div key={label} className="text-center">
                <div className="font-display text-xl font-bold text-primary">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* hero visual */}
        <div className="relative flex justify-center">
          <div className="relative h-[420px] w-[320px] md:h-[520px] md:w-[400px]">
            {/* main jar illustration */}
            <div className="wf-jar-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-72 w-52 md:h-80 md:w-60 flex-col items-center justify-center rounded-[40px] border border-primary/30 bg-card/60 backdrop-blur-xl shadow-elegant">
              <div className="text-7xl md:text-8xl select-none" aria-hidden>🫙</div>
              <div className="mt-4 text-center">
                <div className="font-display text-lg font-bold text-primary">Wild Brew</div>
                <div className="text-xs text-muted-foreground">Naturally fermented</div>
              </div>
              {/* bubbles inside jar */}
              <div className="absolute bottom-8 left-8 h-3 w-3 rounded-full bg-primary/30 animate-ping" />
              <div className="absolute bottom-14 right-10 h-2 w-2 rounded-full bg-primary/20 animate-ping delay-300" />
            </div>

            {/* floating accent cards */}
            <div className="absolute -left-6 top-16 rounded-2xl border border-primary/30 bg-card/80 px-4 py-3 backdrop-blur-lg shadow-card wf-float-slow">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🦠</div>
                <div>
                  <div className="text-xs font-bold">Live Cultures</div>
                  <div className="text-[10px] text-muted-foreground">Beneficial bacteria</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-6 top-32 rounded-2xl border border-primary/30 bg-card/80 px-4 py-3 backdrop-blur-lg shadow-card wf-float-med">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🌿</div>
                <div>
                  <div className="text-xs font-bold">Zero Additives</div>
                  <div className="text-[10px] text-muted-foreground">Pure & natural</div>
                </div>
              </div>
            </div>
            <div className="absolute -left-4 bottom-20 rounded-2xl border border-primary/30 bg-card/80 px-4 py-3 backdrop-blur-lg shadow-card wf-float-fast">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold">Gut Health</div>
                  <div className="text-[10px] text-muted-foreground">Probiotic rich</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="text-[10px] font-semibold tracking-[0.3em] text-muted-foreground">SCROLL</div>
        <div className="h-10 w-px bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 2 — WHAT IS WILD FERMENTATION?
═══════════════════════════════════════════════════════════ */
function WhatIsSection() {
  const { ref, inView } = useInView();
  const benefits = [
    { icon: <Leaf className="h-5 w-5" />, label: "Naturally Probiotic", desc: "Live beneficial cultures in every sip" },
    { icon: <Heart className="h-5 w-5" />, label: "Supports Gut Health", desc: "Nourishes your microbiome naturally" },
    { icon: <FlaskConical className="h-5 w-5" />, label: "Improves Digestion", desc: "Enzymes aid in nutrient breakdown" },
    { icon: <Sparkles className="h-5 w-5" />, label: "Rich in Nutrients", desc: "Vitamins and minerals unlocked by fermentation" },
    { icon: <ShieldCheck className="h-5 w-5" />, label: "Enhances Immunity", desc: "Microbiome diversity strengthens defenses" },
    { icon: <Droplets className="h-5 w-5" />, label: "Natural Detoxification", desc: "Cleanse your system the natural way" },
    { icon: <Sun className="h-5 w-5" />, label: "Healthy Alternative", desc: "Refreshing replacement for sugary drinks" },
  ];

  return (
    <section id="what-is" className="relative py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.28_0.09_140/20%)_0%,transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-6">
        <div ref={ref} className={`grid gap-16 md:grid-cols-2 items-center transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {/* left — text */}
          <div>
            <span className="ik-chip mb-5">[ WHAT IS IT? ]</span>
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Nature's Most{" "}
              <span className="italic-display">Ancient Craft</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Wild fermentation is a natural process where naturally occurring microorganisms — such as beneficial bacteria and wild yeast — transform simple ingredients into nutrient-rich, probiotic-packed beverages{" "}
              <strong className="text-foreground">without any artificial additives, preservatives, or commercial starters.</strong>
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              At Indus Kitchen, we harness this ancient wisdom with modern hygiene standards to deliver beverages that taste extraordinary and nourish from within.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {benefits.slice(0, 6).map(({ icon, label }) => (
                <div
                  key={label}
                  className="group flex items-center gap-2.5 rounded-xl border border-border bg-card/50 px-3 py-2.5 text-xs font-medium transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="text-primary">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* right — visual */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-emerald-950/40 to-amber-950/20 p-8 shadow-elegant">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { emoji: "🫙", title: "Fermentation Jar", sub: "Wild cultures active" },
                  { emoji: "🌿", title: "Natural Herbs", sub: "Handpicked ingredients" },
                  { emoji: "🦠", title: "Live Bacteria", sub: "Probiotic cultures" },
                  { emoji: "🍵", title: "Ready to Serve", sub: "Fresh & nourishing" },
                ].map(({ emoji, title, sub }) => (
                  <div key={title} className="group flex flex-col items-center rounded-2xl border border-primary/20 bg-card/60 p-5 text-center transition hover:border-primary/50 hover:bg-primary/5 cursor-default">
                    <div className="text-4xl">{emoji}</div>
                    <div className="mt-3 text-sm font-bold">{title}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-center text-sm text-muted-foreground italic">
                  "Fermentation is the art of letting nature do the work — and nature does it best."
                </p>
              </div>
            </div>
            {/* decorative pill */}
            <div className="absolute -right-4 -top-4 rounded-2xl bg-gradient-primary px-5 py-3 text-primary-foreground shadow-glow">
              <div className="text-[10px] font-semibold uppercase tracking-widest opacity-80">100% Natural</div>
              <div className="font-display text-lg font-bold">No Additives</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3 — PROCESS TIMELINE
═══════════════════════════════════════════════════════════ */
function ProcessSection() {
  const { ref, inView } = useInView();
  const steps = [
    { icon: <Leaf className="h-6 w-6" />, title: "Ingredient Selection", desc: "Carefully sourcing fresh, organic, locally-grown ingredients for optimal fermentation potential.", emoji: "🌾" },
    { icon: <FlaskConical className="h-6 w-6" />, title: "Natural Fermentation", desc: "Wild cultures — present naturally on ingredients — begin their transformative work in our hygienically maintained environment.", emoji: "🫙" },
    { icon: <Microscope className="h-6 w-6" />, title: "Microbial Development", desc: "Billions of beneficial bacteria and wild yeasts multiply, creating a complex ecosystem of flavors and nutrients.", emoji: "🦠" },
    { icon: <Flower className="h-6 w-6" />, title: "Flavor Enhancement", desc: "Natural sugars convert into organic acids, creating complex, nuanced flavor profiles unique to each batch.", emoji: "✨" },
    { icon: <ShieldCheck className="h-6 w-6" />, title: "Quality Check", desc: "Each batch is tasted, tested, and verified to meet our standards for flavor, acidity, and probiotic activity.", emoji: "✅" },
    { icon: <UtensilsCrossed className="h-6 w-6" />, title: "Fresh Serving", desc: "Bottled fresh and served at peak probiotic activity for maximum health benefits and taste.", emoji: "🍵" },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-surface/30" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="ik-chip mb-5">[ THE PROCESS ]</span>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            How Wild Fermentation{" "}
            <span className="italic-display">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A carefully observed natural process from raw ingredient to probiotic powerhouse.
          </p>
        </div>

        <div ref={ref} className={`relative transition-all duration-700 ${inView ? "opacity-100" : "opacity-0"}`}>
          {/* vertical connector on desktop */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={`group flex flex-col md:flex-row gap-6 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* text card */}
                <div className="w-full md:w-5/12">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary shrink-0">
                        {step.icon}
                      </span>
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">Step {i + 1}</div>
                        <div className="font-display text-lg font-bold">{step.title}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>

                {/* center circle */}
                <div className="hidden md:flex w-2/12 justify-center">
                  <div className="relative z-10 grid h-16 w-16 place-items-center rounded-full border-2 border-primary bg-card text-3xl shadow-glow">
                    {step.emoji}
                  </div>
                </div>

                {/* spacer */}
                <div className="w-full md:w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4 — BENEFITS CARDS
═══════════════════════════════════════════════════════════ */
function BenefitsSection() {
  const { ref, inView } = useInView();
  const cards = [
    { icon: <Heart className="h-6 w-6" />, title: "Gut Health", desc: "Colonise your gut with diverse beneficial bacteria that protect and strengthen the intestinal lining.", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/25" },
    { icon: <FlaskConical className="h-6 w-6" />, title: "Better Digestion", desc: "Fermentation pre-digests nutrients, making them easier for your body to absorb.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25" },
    { icon: <Zap className="h-6 w-6" />, title: "Natural Energy", desc: "B-vitamins and bioavailable minerals deliver sustained energy without sugar crashes.", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/25" },
    { icon: <ShieldCheck className="h-6 w-6" />, title: "Improved Immunity", desc: "70% of your immune system lives in the gut. A healthy gut microbiome means stronger immunity.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
    { icon: <Microscope className="h-6 w-6" />, title: "Rich Probiotics", desc: "Billions of live cultures per serving — far more potent than most commercial supplements.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/25" },
    { icon: <Droplets className="h-6 w-6" />, title: "Reduced Sugar", desc: "Wild fermentation consumes sugars, leaving a naturally low-sugar, low-calorie beverage.", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/25" },
    { icon: <Sparkles className="h-6 w-6" />, title: "Nutrient Absorption", desc: "Fermentation breaks down anti-nutrients, making minerals and vitamins more bioavailable.", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/25" },
    { icon: <Sun className="h-6 w-6" />, title: "Overall Wellness", desc: "From clearer skin to better mood — a healthy gut influences your whole body and mind.", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/25" },
  ];

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="ik-chip mb-5">[ BENEFITS ]</span>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Why Wild Fermented Drinks?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Science-backed benefits delivered through ancient, time-tested fermentation.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {cards.map((c, i) => (
            <div
              key={c.title}
              className={`group rounded-2xl border ${c.bg} p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-glow cursor-default`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-background/40 ${c.color}`}>
                {c.icon}
              </div>
              <div className="font-display text-lg font-bold">{c.title}</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5 — WHY INDUS KITCHEN?
═══════════════════════════════════════════════════════════ */
function WhyIKSection() {
  const { ref, inView } = useInView();

  // ── IK VERTICALS (from uploaded slide) ──
  const verticals = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Monthly Subscription",
      desc: "Community Kitchen by Homemaker — Serving Senior Citizens, Industrial Employees, Institutions, Individuals & Food-App subscribers with fresh homestyle meals.",
      tag: "Community",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Social Events",
      desc: "From intimate weddings to large corporate functions, occasional events, parties & gatherings — we bring authentic homestyle catering to every occasion.",
      tag: "Events",
    },
    {
      icon: <UtensilsCrossed className="h-6 w-6" />,
      title: "Bulk Catering",
      desc: "Festival Packs, Event Refreshments, and Bulk Supply for organisations, corporates, and large community gatherings across Chennai.",
      tag: "Bulk",
    },
    {
      icon: <Beaker className="h-6 w-6" />,
      title: "Wild Fermentation",
      desc: "Naturally crafted probiotic drinks and fermentation workshops — bringing ancient wellness traditions to modern lifestyles.",
      tag: "Wellness",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "17+ Years of Trust",
      desc: "Serving Production Houses, B2B clients, senior citizens & individuals. 5-star rated across Google Reviews — 100% satisfaction in every serving.",
      tag: "Legacy",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Workshops & Training",
      desc: "Hands-on wild fermentation workshops — learn to brew your own probiotic beverages at home under expert guidance from Indus Kitchen.",
      tag: "Education",
    },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-surface/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.28_0.09_140/25%)_0%,transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 relative">
        <div className="mb-16 text-center">
          <span className="ik-chip mb-5">[ WHY IK ]</span>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Why Choose Wild Fermentation{" "}
            <br className="hidden md:block" />
            <span className="italic-display">at Indus Kitchen?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            We're not just a kitchen — we're a wellness movement rooted in 17 years of culinary expertise and community service.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {verticals.map((v, i) => (
            <div
              key={v.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-glow"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {/* gradient corner */}
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-3xl bg-gradient-primary opacity-5 transition group-hover:opacity-15" />
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  {v.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-display text-lg font-bold">{v.title}</div>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {v.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/contact">Get in Touch <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6 — GALLERY
═══════════════════════════════════════════════════════════ */
function GallerySection() {
  const { ref, inView } = useInView();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const images = [
    { emoji: "🫙", label: "Fermentation Jars", span: "lg:col-span-2 lg:row-span-2" },
    { emoji: "🌿", label: "Natural Ingredients", span: "" },
    { emoji: "🍵", label: "Finished Beverage", span: "" },
    { emoji: "⚗️", label: "Preparation Process", span: "" },
    { emoji: "🌾", label: "Organic Grains", span: "" },
    { emoji: "🎋", label: "Fresh Herbs", span: "lg:col-span-2" },
    { emoji: "😊", label: "Customer Experience", span: "" },
  ];

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="ik-chip mb-5">[ GALLERY ]</span>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            The Art of{" "}
            <span className="italic-display">Fermentation</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A visual journey through our wild fermentation process — from raw ingredient to probiotic perfection.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-2 gap-4 lg:grid-cols-4 auto-rows-[180px] lg:auto-rows-[200px] transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {images.map((img, i) => (
            <div
              key={img.label}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-glow ${img.span}`}
              onClick={() => setLightbox(i)}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950/60 to-amber-950/40 transition-all group-hover:from-emerald-950/40 group-hover:to-amber-950/20">
                <div className="text-5xl transition-transform duration-300 group-hover:scale-110">{img.emoji}</div>
                <div className="mt-3 text-center text-sm font-semibold text-white/90">{img.label}</div>
                <div className="mt-1 rounded-full bg-primary/20 px-3 py-1 text-[10px] font-medium text-primary opacity-0 transition-all group-hover:opacity-100">
                  Click to view
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* lightbox */}
        {lightbox !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <div className="rounded-3xl border border-primary/30 bg-card p-16 shadow-elegant">
                <div className="text-9xl text-center">{images[lightbox].emoji}</div>
              </div>
              <div className="text-center text-lg font-bold">{images[lightbox].label}</div>
              <button onClick={() => setLightbox(null)} className="rounded-full border border-border px-6 py-2 text-sm hover:border-primary/40">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 7 — CUSTOMERS LOGO SLIDER
═══════════════════════════════════════════════════════════ */
function CustomersSection() {
  // Clients from uploaded slide images
  const logos = [
    { name: "IBM", display: "IBM", style: "text-blue-400 font-black text-xl" },
    { name: "Zolo", display: "Zolo", style: "text-blue-300 font-bold text-xl" },
    { name: "DHL", display: "DHL", style: "text-yellow-400 font-black text-xl" },
    { name: "TEDx MSAJCE", display: "TEDx MSAJCE", style: "text-red-400 font-bold text-sm" },
    { name: "Rotary International", display: "Rotary Int'l", style: "text-amber-400 font-bold text-sm" },
    { name: "BNI", display: "BNI", style: "text-red-500 font-black text-2xl" },
    { name: "ISKCON", display: "ISKCON", style: "text-orange-400 font-bold text-sm" },
    { name: "Le Royal Meridien", display: "Le Royal Méridien", style: "text-yellow-600 font-semibold text-xs italic" },
    { name: "Sagility", display: "Sagility™", style: "text-blue-400 font-bold text-base" },
    { name: "Hindustan International School", display: "Hindustan Int'l School", style: "text-foreground font-bold text-xs" },
    { name: "Pathway India", display: "Pathway India", style: "text-green-400 font-bold text-sm" },
    { name: "Red Giant Movies", display: "Red Giant Movies", style: "text-red-400 font-bold text-sm" },
    { name: "Sumitomo Corporation", display: "Sumitomo Corp.", style: "text-foreground font-bold text-sm" },
    { name: "Startup20 G20", display: "Startup20 G20", style: "text-blue-300 font-bold text-xs" },
    { name: "JS Global School", display: "JS Global School", style: "text-blue-400 font-bold text-xs" },
    { name: "ECCT", display: "ECCT", style: "text-blue-400 font-bold text-xl" },
    { name: "Satkaarya Trust", display: "Satkaarya Trust", style: "text-red-400 font-bold text-sm" },
    { name: "Babaji Vidhyashram", display: "Babaji Vidhyashram", style: "text-green-400 font-semibold text-sm" },
    { name: "Stone Bench Creations", display: "Stone Bench", style: "text-yellow-600 font-bold text-sm" },
    { name: "Ice Culture", display: "Ice Culture", style: "text-foreground font-semibold text-sm" },
  ];

  // duplicate for seamless loop
  const doubled = [...logos, ...logos];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-surface/50" />
      <div className="mb-12 text-center px-6">
        <span className="ik-chip mb-5">[ TRUSTED BY ]</span>
        <h2 className="font-display text-4xl font-bold md:text-5xl">
          Trusted by Our{" "}
          <span className="italic-display">Customers</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Proudly serving leading organisations, schools, hospitals, corporates and event brands across India.
        </p>
      </div>

      {/* slider */}
      <div className="relative">
        {/* gradient edges */}
        <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />

        <div className="wf-slider-track group">
          <div className="wf-slider-inner group-hover:[animation-play-state:paused]">
            {doubled.map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="wf-logo-card"
                title={logo.name}
              >
                <span className={logo.style}>{logo.display}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-sm text-muted-foreground">⭐⭐⭐⭐⭐ 5-Star Rating — 100% satisfaction in Google Reviews</div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 8 — TESTIMONIALS
═══════════════════════════════════════════════════════════ */
function TestimonialsSection() {
  const { ref, inView } = useInView();
  const [idx, setIdx] = useState(0);

  // Extracted from WhatsApp screenshots shared by user
  const testimonials = [
    {
      name: "Srivasvasu Karee",
      company: "Loyal Customer",
      avatar: "S",
      review: "Hi Indu, You just had the Morning Tea with samosas and enjoyed all the Tiffin items. The laddoos and savories were delicious and the packaging was so neat and attractive. Everything done meticulously. Many more orders from our company will follow!",
      rating: 5,
    },
    {
      name: "Prathima Rao",
      company: "Yatri Group",
      avatar: "P",
      review: "Thanks for everything Indu. Echoing Radha's sentiments. The mixture was very gud and the snacks were excellent. Everyone loved them. Excellent packaging too. Thank you so much Indu!",
      rating: 5,
    },
    {
      name: "Swamy Yatra Group",
      company: "Group Customer",
      avatar: "S",
      review: "The snacks were excellent. Everyone loved the mixture cake — murukku and cheedai so far. Excellent packaging too. Thank you so much Indu. We distributed mixture cake to so many.",
      rating: 5,
    },
    {
      name: "Viji Amma Friend",
      company: "WhatsApp Customer",
      avatar: "V",
      review: "Indhu, your cake was really good less spicy tasty. We liked the Mini hipsy taste. Mixture was very gud. Only thing butter murukku was hard and a bit more salty. Otherwise we enjoyed the sweets and savoury overall!",
      rating: 5,
    },
    {
      name: "Sandeep (Barounian)",
      company: "KVB Group",
      avatar: "S",
      review: "Eagerly I was waiting for feedback! I liked all the products, am really glad. You're doing a great job — Crime master Goga ne toh case rant solve kar diya. Awesome in taste and quality. You must order — not sure Bangalore or other cities have anything like this!",
      rating: 5,
    },
    {
      name: "Kuty Mamma",
      company: "Loyal Customer",
      avatar: "K",
      review: "Pradeep pl convey my appreciations to your niece. The laddoos and savories were delicious and the packaging was so neat and attractive. Everything done meticulously and care. My heartfelt and Diwali Greetings to all of you at home. Convey our Diwali Good Wishes to members.",
      rating: 5,
    },
    {
      name: "Geeth",
      company: "Regular Customer",
      avatar: "G",
      review: "iRBC 'Khamsa' — I loved it! 5.0 ⭐⭐⭐⭐⭐ The snack combination was perfect. Loved the flavors. Keep it up Indu!",
      rating: 5,
    },
    {
      name: "Kaira Kolamba",
      company: "Event Customer",
      avatar: "K",
      review: "Tip: ❤️❤️❤️❤️ Beans: ❤️❤️❤️❤️❤️ Curd: ❤️❤️❤️❤️ iRBC 'Khamse' — Absolutely worth every rupee. The food speaks for itself!",
      rating: 5,
    },
  ];

  const prev = () => setIdx((p) => (p - 1 + testimonials.length) % testimonials.length);
  const next = () => setIdx((p) => (p + 1) % testimonials.length);

  // show 3 at a time (or 1 on mobile)
  const visible = [
    testimonials[idx % testimonials.length],
    testimonials[(idx + 1) % testimonials.length],
    testimonials[(idx + 2) % testimonials.length],
  ];

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="ik-chip mb-5">[ TESTIMONIALS ]</span>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            What Our{" "}
            <span className="italic-display">Customers Say</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Real words from real customers — 5-star rated across Google Reviews and direct feedback.
          </p>
        </div>

        <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="grid gap-6 md:grid-cols-3">
            {visible.map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:border-primary/40 hover:shadow-glow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.review}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary font-bold text-primary-foreground shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* nav */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition hover:border-primary/40 hover:bg-primary/10"
            >
              ←
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-2 bg-border"}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition hover:border-primary/40 hover:bg-primary/10"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 9 — FAQ
═══════════════════════════════════════════════════════════ */
function FAQSection() {
  const { ref, inView } = useInView();
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is wild fermentation?",
      a: "Wild fermentation is the process of using naturally occurring microorganisms — bacteria and yeast present in the environment and on ingredients — to ferment food and beverages without adding commercial starter cultures. The result is a diverse, complex probiotic beverage unique to the local environment.",
    },
    {
      q: "Is wild fermentation safe?",
      a: "Yes, absolutely. Indus Kitchen follows strict hygiene and quality control protocols. The acidic environment created during fermentation naturally inhibits harmful bacteria. Each batch is monitored for taste, smell, and acidity to ensure safety before serving.",
    },
    {
      q: "What are probiotics and why do I need them?",
      a: "Probiotics are live beneficial bacteria and yeasts that live in your gut microbiome. They aid digestion, boost immunity, produce vitamins, and protect against harmful bacteria. Wild fermented drinks can deliver billions of diverse probiotic cultures per serving.",
    },
    {
      q: "How long does the fermentation process take?",
      a: "Depending on the type of drink, fermentation can take anywhere from 1–7 days. The process is temperature and environment dependent — we allow nature to dictate the pace to ensure the richest probiotic profile.",
    },
    {
      q: "Are preservatives or artificial additives used?",
      a: "Absolutely not. Wild fermentation at Indus Kitchen uses zero artificial preservatives, synthetic flavors, or commercial additives. The drinks are preserved naturally through fermentation-produced organic acids.",
    },
    {
      q: "Who can consume these drinks?",
      a: "Wild fermented drinks are suitable for most adults. They are especially beneficial for those with digestive issues, low immunity, or those seeking healthy sugar-free alternatives. If you are pregnant, immunocompromised, or have specific medical conditions, please consult your doctor first.",
    },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-surface/30" />
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <span className="ik-chip mb-5">[ FAQ ]</span>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Frequently Asked{" "}
            <span className="italic-display">Questions</span>
          </h2>
        </div>

        <div
          ref={ref}
          className={`space-y-3 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-2xl border transition-all ${open === i ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
            >
              <button
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold pr-4">{faq.q}</span>
                {open === i ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
              </button>
              {open === i && (
                <div className="border-t border-border/50 px-5 pb-5 pt-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 10 — CONTACT CTA
═══════════════════════════════════════════════════════════ */
function ContactCTA() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.32_0.12_60/30%)_0%,transparent_70%)]" />
      <div className="absolute inset-0">
        <div className="wf-cta-bg" />
      </div>
      {/* floating circles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-primary/10"
          style={{
            width: `${120 + i * 80}px`,
            height: `${120 + i * 80}px`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            animation: `wfPulse ${3 + i}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <span className="ik-chip mb-6">[ START YOUR JOURNEY ]</span>
        <h2 className="font-display text-4xl font-bold md:text-6xl">
          Experience Naturally{" "}
          <span className="italic-display">Fermented Wellness</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground md:text-lg">
          Ready to explore the world of wild fermentation? Reach out to Indus Kitchen and discover our probiotic beverages, workshops, and wellness programs.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 min-w-[200px]">
            <Link to="/contact">
              <Mail className="mr-2 h-5 w-5" />
              Contact Indus Kitchen
            </Link>
          </Button>
          <a href="tel:+919094696650">
            <Button size="lg" variant="outline" className="border-primary/40 min-w-[200px]">
              <Phone className="mr-2 h-5 w-5" />
              Request Information
            </Button>
          </a>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { icon: <CheckCircle2 className="h-5 w-5" />, label: "No Preservatives" },
            { icon: <Leaf className="h-5 w-5" />, label: "100% Organic" },
            { icon: <Award className="h-5 w-5" />, label: "5-Star Rated" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">{icon}</div>
              <div className="text-xs font-medium text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WildFermentationPage;
