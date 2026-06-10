import type { HTMLAttributes } from "react";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "muted";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  dot?: boolean;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-border/70 bg-surface-2/60 text-text-primary",
  success: "border-accent/40 bg-accent/10 text-accent",
  warning: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
  error: "border-red-500/40 bg-red-500/10 text-red-300",
  info: "border-secondary/40 bg-secondary/10 text-secondary",
  muted: "border-border/50 bg-ink-2/60 text-text-muted",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  success: "bg-accent shadow-[0_0_5px_rgba(25,230,162,0.6)]",
  warning: "bg-yellow-400",
  error: "bg-red-400",
  info: "bg-secondary shadow-[0_0_5px_rgba(0,184,255,0.6)]",
  muted: "bg-text-muted/50",
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-tight ${variantStyles[variant]} ${className ?? ""}`}
      {...props}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}
