import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/ik/Navbar";
import { Footer } from "@/components/ik/Footer";
import founder from "@/assets/founder.jpg";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Indu's Kitchen" },
      { name: "description", content: "Meet Indumathi Rajamani — 17+ years of culinary excellence behind IK Smart Canteen." },
    ],
  }),
});

function AboutPage() {
  return (
    <div>
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <span className="ik-chip mb-5">[ ABOUT IK ]</span>
        <h1 className="font-display text-5xl font-bold md:text-6xl">
          We believe great food <span className="italic-display">tells a story</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          At IK – Indu's Kitchen, food is not just cooked — it's crafted with
          passion, care, and authenticity. From homestyle meals to quick student
          combos, every dish reflects a promise of freshness, hygiene, and
          unforgettable taste.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-elegant">
          <img src={founder} alt="Indumathi Rajamani" loading="lazy" width={1024} height={1200} className="w-full object-cover" />
          <div className="absolute bottom-5 right-5 rounded-full bg-card/90 px-4 py-2 text-sm font-semibold shadow-elegant backdrop-blur">
            ★ 4.9 Rating
          </div>
        </div>
        <div>
          <h2 className="font-display text-4xl font-bold md:text-5xl">Indumathi Rajamani</h2>
          <p className="mt-2 font-medium text-primary">Food Entrepreneur • 17+ Years Experience</p>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              From a background in Psychology and Fashion Design, she carved her
              own path into the culinary world, inspired by her early exposure
              to home science and her mother's cooking traditions.
            </p>
            <p>
              Her international exposure in Sydney further refined her skills,
              blending global flavors with traditional authenticity. During the
              COVID-19 lockdown, she extended support through food service to
              those in need.
            </p>
            <p>Today, IK stands as a symbol of trust, quality, and heartfelt cooking.</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { v: "17+", l: "Years Experience" },
              { v: "900+", l: "Event Capacity" },
              { v: "Sydney", l: "Intl. Exposure" },
              { v: "IK", l: "Trusted Brand" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-card p-5">
                <div className="font-display text-2xl font-bold text-primary">{s.v}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
