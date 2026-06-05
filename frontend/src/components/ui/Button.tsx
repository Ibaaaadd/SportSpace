import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[-0.01em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:pointer-events-none disabled:opacity-40 cursor-pointer";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-r from-primary to-secondary text-white shadow-[0_2px_16px_rgba(27,111,255,0.28)] hover:shadow-[0_2px_24px_rgba(27,111,255,0.42)] hover:brightness-110 active:brightness-95",
  secondary:
    "bg-surface-2 text-text-primary border border-border/80 hover:border-secondary/50 hover:bg-surface hover:text-text-primary",
  outline:
    "border border-border/80 text-text-primary hover:border-primary/50 hover:bg-primary/6 hover:text-primary",
  ghost:
    "text-text-muted hover:bg-surface-2/60 hover:text-text-primary",
  danger:
    "border border-red-500/40 text-red-300 hover:border-red-400/70 hover:bg-red-500/10 hover:text-red-200",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
