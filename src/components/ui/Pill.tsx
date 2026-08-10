export function Pill({
  label,
  color,
  bg,
}: {
  label: string;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.04em]"
      style={{ background: bg || "var(--color-bg-alt)", color: color || "var(--color-text-ter)" }}
    >
      {label}
    </span>
  );
}
