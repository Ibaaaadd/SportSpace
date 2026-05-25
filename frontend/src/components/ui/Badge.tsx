import type { HTMLAttributes } from "react";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "muted";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  dot?: boolean;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-border bg-surface-2 text-text-primary",
  success: "border-accent/50 bg-accent/10 text-accent",
  warning: "border-yellow-400/50 bg-yellow-400/10 text-yellow-300",
  error: "border-red-500/50 bg-red-500/10 text-red-300",
  info: "border-secondary/50 bg-secondary/10 text-secondary",
  muted: "border-border bg-ink-2 text-text-muted",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  success: "bg-accent",
  warning: "bg-yellow-400",
  error: "bg-red-400",
  info: "bg-secondary",
  muted: "bg-text-muted/60",
};

export default function Badge({
  variant = "default",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className ?? ""}`}
      {...props}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}
