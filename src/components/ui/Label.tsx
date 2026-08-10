import type { ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold text-text-ter uppercase font-label tracking-[0.07em] mb-1.5">
      {children}
    </div>
  );
}

export function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
