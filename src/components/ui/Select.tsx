import type { SelectHTMLAttributes } from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
};

export default function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[11px] font-semibold uppercase tracking-widest text-text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-xl border bg-surface/50 px-3.5 py-2.5 pr-9 text-sm text-text-primary outline-none transition-all duration-150 focus:border-primary/40 focus:bg-surface focus:shadow-[0_0_0_3px_rgba(27,111,255,0.08)] ${
            error ? "border-red-500/50" : "border-border/70 hover:border-border"
          } ${className ?? ""}`}
          {...props}
        >
          {placeholder && (
            <option value="" style={{ backgroundColor: "var(--surface)" }}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              style={{ backgroundColor: "var(--surface)" }}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
}
