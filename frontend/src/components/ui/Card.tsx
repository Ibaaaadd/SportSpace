import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface/80 shadow-[0_0_24px_rgba(0,0,0,0.25)] ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={`px-6 pb-0 pt-6 ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardSectionProps) {
  return (
    <h3 className={`text-lg font-semibold ${className ?? ""}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: CardSectionProps) {
  return (
    <p className={`mt-2 text-sm text-text-muted ${className ?? ""}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={`px-6 py-5 ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: CardSectionProps) {
  return (
    <div
      className={`flex items-center justify-between border-t border-border px-6 py-4 ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
}
