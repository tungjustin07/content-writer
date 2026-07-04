export const TOTAL_STEPS = 8;

export function StepShell({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs tracking-widest uppercase text-accent mb-3">
        Step {step} of {TOTAL_STEPS}
      </div>
      <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-2">{title}</h1>
      {subtitle && <p className="text-neutral-400 text-sm mb-6 max-w-xl">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      <div>{children}</div>
    </div>
  );
}
