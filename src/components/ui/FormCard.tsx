"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "./Icon";

export function FormCard({
  title,
  sub,
  backHref,
  children,
}: {
  title: string;
  sub?: string;
  backHref: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-display">
      <div className="fadein w-full max-w-[400px] p-6">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-text-sec text-[13px] font-semibold mb-8"
        >
          <Icon n="arrowLeft" size={16} color="var(--color-text-sec)" /> Back
        </Link>
        <div className={`text-[28px] font-extrabold tracking-[-0.03em] ${sub ? "mb-1.5" : "mb-7"}`}>
          {title}
        </div>
        {sub && <div className="text-sm text-text-sec mb-7 leading-relaxed">{sub}</div>}
        {children}
      </div>
    </div>
  );
}
