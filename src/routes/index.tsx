import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Star, Users, Clock, Leaf, Soup, ChefHat } from "lucide-react";
import { Navbar } from "@/components/ik/Navbar";
import { Footer } from "@/components/ik/Footer";
import { Button } from "@/components/ui/button";
import heroFood from "@/assets/hero-food.jpg";
import aboutFood from "@/assets/about-food.jpg";
import dishBiryani from "@/assets/dish-biryani.jpg";
import dishDosa from "@/assets/dish-dosa.jpg";
import dishIdli from "@/assets/dish-idli.jpg";
import dishChai from "@/assets/dish-chai.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "IK Smart Canteen — Food You Like. Taste That Lasts." },
      { name: "description", content: "Pre-order your homestyle campus meals from Indu's Kitchen — crafted with passion, hygiene, and zero wastage." },
    ],
  }),
});

function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <AboutTeaser />
      <FeaturedDishes />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={heroFood} alt="Homestyle Indian meals" className="h-full w-full object-cover" width={1600} height={1024} />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center md:py-40">
        <span className="ik-chip mb-6">★ 17+ years of culinary excellence</span>

        <h1 className="font-display text-5xl font-bold leading-[1.05] text-foreground md:text-7xl">
          Food You <span className="italic-display">Like.</span>
          <br />
          Taste That <span className="italic-display">Lasts.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          Pre-order your homestyle campus meals from Indu's Kitchen — crafted
          with passion, hygiene, and zero wastage.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
            <Link to="/menu">
              Pre-Order Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Admin Login</Link>
          </Button>
        </div>

        <div className="mt-16 text-[10px] font-semibold tracking-[0.3em] text-muted-foreground">SCROLL</div>
        <div className="mt-2 h-10 w-px bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { icon: Star, value: "4.9", label: "Avg. Rating" },
    { icon: Users, value: "900+", label: "Events Served" },
    { icon: Clock, value: "17 Yrs", label: "Experience" },
  ];
  return (
    <section className="border-y border-border/50 bg-surface/40">
      <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-border/50 px-6 py-10">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 px-4 text-center">
            <Icon className="h-5 w-5 text-primary" />
            <div className="font-display text-2xl font-bold md:text-4xl">{value}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutTeaser() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
      <div>
        <span className="ik-chip mb-5">[ ABOUT IK ]</span>
        <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">
          We believe great food
          <br />
          <span className="italic-display">tells a story</span>
        </h2>
        <p className="mt-6 text-muted-foreground">
          At IK – Indu's Kitchen, food is not just cooked — it's crafted with
          passion, care, and authenticity. From homestyle meals to quick student
          combos, every dish reflects a promise of freshness, hygiene, and
          unforgettable taste.
        </p>
        <p className="mt-4 text-muted-foreground">
          Built on a community-driven kitchen model, IK brings together
          tradition and innovation — serving food that feels like home.
        </p>

        <div className="mt-8 flex gap-8">
          {[
            { icon: ChefHat, label: "Homemade Quality" },
            { icon: Leaf, label: "Zero Wastage" },
            { icon: Soup, label: "Hygienic Kitchen" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <Button asChild className="mt-10 bg-gradient-primary text-primary-foreground">
          <Link to="/about">Read Our Story <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-3xl border border-border shadow-elegant">
          <img src={aboutFood} alt="Fresh salad" loading="lazy" width={1200} height={1024} className="aspect-[4/3] w-full object-cover" />
        </div>
        <div className="absolute -bottom-6 left-6 rounded-2xl bg-gradient-primary px-6 py-4 text-primary-foreground shadow-glow">
          <div className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Campus Pre-Order</div>
          <div className="font-display text-xl font-bold">Open Now</div>
        </div>
      </div>
    </section>
  );
}

function FeaturedDishes() {
  const dishes = [
    { img: dishBiryani, name: "Chicken Biryani", price: "₹120", tag: "Best Seller" },
    { img: dishDosa, name: "Masala Dosa", price: "₹50", tag: "Breakfast" },
    { img: dishIdli, name: "Idli Sambar", price: "₹40", tag: "Combo" },
    { img: dishChai, name: "Masala Chai", price: "₹15", tag: "Drinks" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <span className="ik-chip mb-4">[ FEATURED ]</span>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Today's <span className="italic-display">Favourites</span>
          </h2>
        </div>
        <Button asChild variant="outline" className="hidden sm:inline-flex">
          <Link to="/menu">View Full Menu</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dishes.map((d) => (
          <Link
            key={d.name}
            to="/menu"
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-glow"
          >
            <div className="relative aspect-square overflow-hidden">
              <img src={d.img} alt={d.name} loading="lazy" width={800} height={800} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute left-3 top-3 rounded-full bg-gradient-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                {d.tag}
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-display text-lg font-bold">{d.name}</div>
                <div className="text-xs text-muted-foreground">Fresh today</div>
              </div>
              <div className="text-lg font-bold text-primary">{d.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
