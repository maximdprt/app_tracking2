export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-text-soft mt-1 text-sm">{subtitle}</p> : null}
    </div>
  );
}
