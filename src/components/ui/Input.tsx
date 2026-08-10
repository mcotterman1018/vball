"use client";

import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[
        "w-full px-[14px] py-[12px] text-sm font-medium rounded-[10px] border-[1.5px] border-border bg-bg text-text outline-none transition-colors",
        "focus:border-navy",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
