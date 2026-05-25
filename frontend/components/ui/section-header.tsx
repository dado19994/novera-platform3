interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  action?: string;
  actionTone?: "map" | "events" | "opportunities" | "audio";
}

export function SectionHeader({ eyebrow, title, action, actionTone = "map" }: SectionHeaderProps) {
  return (
    <header className="section-header mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-[0.68rem] uppercase tracking-[0.26em] text-(--muted-ivory)">{eyebrow}</p>}
        <h2 className="font-[family-name:var(--font-display)] text-xl leading-tight text-(--soft-ivory) sm:text-2xl">
          {title}
        </h2>
      </div>
      {action && (
        <button className={`portal-cta portal-cta-${actionTone} text-xs tracking-wide`}>
          <span>{action}</span>
          <span className="portal-arrow" aria-hidden="true">+</span>
        </button>
      )}
    </header>
  );
}
