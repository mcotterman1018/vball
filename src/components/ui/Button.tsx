"use client";

import type { ButtonHTMLAttributes } from "react";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryBtn({ className = "", disabled, ...rest }: BtnProps) {
  return (
    <button
      disabled={disabled}
      className={[
        "px-[28px] py-[13px] text-sm font-bold rounded-[10px] border-none tracking-[-0.01em] transition-opacity",
        disabled
          ? "bg-bg-deep text-text-ter cursor-default"
          : "bg-navy text-white cursor-pointer hover:opacity-90",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}

export function GhostBtn({ className = "", ...rest }: BtnProps) {
  return (
    <button
      className={[
        "px-[22px] py-[11px] text-[13px] font-semibold rounded-[10px] border-[1.5px] border-border bg-transparent text-text-sec cursor-pointer hover:bg-bg-alt transition-colors",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
