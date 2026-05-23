interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  action?: string;
}

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <header className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-[0.68rem] uppercase tracking-[0.26em] text-(--muted-ivory)">{eyebrow}</p>}
        <h2 className="font-[family-name:var(--font-display)] text-xl leading-tight text-(--soft-ivory) sm:text-2xl">
          {title}
        </h2>
      </div>
      {action && (
        <button className="text-xs tracking-wide text-(--muted-ivory) transition-colors hover:text-(--soft-ivory)">
          {action}
        </button>
      )}
    </header>
  );
}
