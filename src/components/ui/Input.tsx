import type { InputHTMLAttributes, ReactNode } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-semibold uppercase tracking-widest text-text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 text-text-muted/60">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-surface/50 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/45 outline-none transition-all duration-150 focus:border-primary/40 focus:bg-surface focus:shadow-[0_0_0_3px_rgba(27,111,255,0.08)] ${
            error ? "border-red-500/50 focus:border-red-500/70 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]" : "border-border/70 hover:border-border"
          } ${leftIcon ? "pl-9" : ""} ${rightIcon ? "pr-9" : ""} ${className ?? ""}`}
          {...props}
        />
        {rightIcon && (
          <span className="pointer-events-none absolute right-3 text-text-muted/60">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-400">
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-text-muted/70">{hint}</p>
      )}
    </div>
  );
}
