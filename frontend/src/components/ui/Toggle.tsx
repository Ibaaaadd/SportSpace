"use client";

import type { ButtonHTMLAttributes } from "react";

export type ToggleProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
};

export default function Toggle({
  checked,
  onCheckedChange,
  label,
  className,
  ...props
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "Toggle"}
      onClick={() => onCheckedChange(!checked)}
      className={`relative flex h-9 w-16 items-center rounded-full border border-border bg-ink-2 p-1 transition hover:border-secondary ${
        className ?? ""
      }`}
      {...props}
    >
      <span
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-surface shadow-[0_6px_18px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out ${
          checked ? "translate-x-7" : "translate-x-0"
        }`}
      />
      <span className="sr-only">{label ?? "Toggle"}</span>
    </button>
  );
}
