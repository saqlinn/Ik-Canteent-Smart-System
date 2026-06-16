import { Link } from "@tanstack/react-router";
import { Linkedin, Mail, Phone } from "lucide-react";
import { Logo } from "./Logo";

const devs = [
  {
    name: "Saqlin Mustaq",
    linkedin: "https://www.linkedin.com/in/saqlin-mustaq-94021129a/",
    email: "saqlinmustaq17@gmail.com",
    phone: "+91 6385238788",
  },
  {
    name: "Nishat Fathima",
    linkedin: "https://www.linkedin.com/in/nishat-fathima-491559322/",
    email: "nish.fathima0705@gmail.com",
    phone: "+91 9884839346",
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-surface/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Crafted with passion, served with love. Pre-order homestyle campus
            meals — fresh every day, zero wastage.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Explore</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About IK</Link></li>
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/menu" className="hover:text-primary">Menu</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li>
              <Link to="/wild-fermentation" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
                🫙 Wild Fermentation
                <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-black">NEW</span>
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Reach Us</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>+91 90946 96650</li>
            <li>Indumathirajamani@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-5 text-xs font-semibold uppercase tracking-widest text-primary">Developers</div>
          <div className="grid gap-4 md:grid-cols-2">
            {devs.map((d) => (
              <div key={d.name} className="rounded-2xl border border-border bg-card p-5">
                <div className="font-display text-lg font-bold">{d.name}</div>
                <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <a href={d.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                  <a href={`mailto:${d.email}`} className="flex items-center gap-2 hover:text-primary">
                    <Mail className="h-4 w-4" /> {d.email}
                  </a>
                  <a href={`tel:${d.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-primary">
                    <Phone className="h-4 w-4" /> {d.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Indu's Kitchen — Food You Like. Taste That Lasts.
      </div>
    </footer>
  );
}
