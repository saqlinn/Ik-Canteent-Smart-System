import logoSrc from "@/assets/ik-logo.jpeg";

export function Logo({ tagline = "SMART CANTEEN" }: { tagline?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-glow">
        <img src={logoSrc} alt="Indu's Kitchen logo" className="h-full w-full object-contain" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg font-bold text-foreground">
          Indu's Kitchen
        </div>
        <div className="text-[10px] font-semibold tracking-[0.2em] text-primary">
          {tagline}
        </div>
      </div>
    </div>
  );
}
