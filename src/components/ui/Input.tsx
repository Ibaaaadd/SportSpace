import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export type InputProps = (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>) & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  as?: 'input' | 'textarea';
};

export default function Input({
  label,
  error,
  hint,
  icon,
  leftIcon,
  rightIcon,
  className,
  id,
  as = 'input',
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const finalLeftIcon = icon || leftIcon;

  const inputClassName = `w-full rounded-xl border bg-surface/50 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/45 outline-none transition-all duration-150 focus:border-primary/40 focus:bg-surface focus:shadow-[0_0_0_3px_rgba(27,111,255,0.08)] ${
    error ? "border-red-500/50 focus:border-red-500/70 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]" : "border-border/70 hover:border-border"
  } ${finalLeftIcon ? "pl-9" : ""} ${rightIcon ? "pr-9" : ""} ${className ?? ""}`;

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
      <div className="relative flex items-start">
        {finalLeftIcon && (
          <span className="pointer-events-none absolute left-3 top-2.5 text-text-muted/60">
            {finalLeftIcon}
          </span>
        )}
        {as === 'textarea' ? (
          <textarea
            id={inputId}
            className={inputClassName}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            className={inputClassName}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {rightIcon && (
          <span className="pointer-events-none absolute right-3 top-2.5 text-text-muted/60">
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
