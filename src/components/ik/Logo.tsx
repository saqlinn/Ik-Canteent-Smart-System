export function Logo({ tagline = "SMART CANTEEN" }: { tagline?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary font-display text-base font-bold text-primary-foreground shadow-glow">
        IK
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
