import Image from "next/image";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

export type AvatarProps = {
  src?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
  online?: boolean;
};

const sizeStyles: Record<AvatarSize, { wrapper: string; text: string; dot: string }> = {
  xs: { wrapper: "h-6 w-6", text: "text-[9px]", dot: "h-1.5 w-1.5 -right-0.5 -bottom-0.5" },
  sm: { wrapper: "h-8 w-8", text: "text-xs", dot: "h-2 w-2 -right-0.5 -bottom-0.5" },
  md: { wrapper: "h-10 w-10", text: "text-sm", dot: "h-2.5 w-2.5 right-0 bottom-0" },
  lg: { wrapper: "h-12 w-12", text: "text-base", dot: "h-3 w-3 right-0 bottom-0" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Avatar({ src, name, size = "md", className, online }: AvatarProps) {
  const styles = sizeStyles[size];
  const initials = name ? getInitials(name) : "?";

  return (
    <div className={`relative shrink-0 ${styles.wrapper} ${className ?? ""}`}>
      {src ? (
        <Image
          src={src}
          alt={name ?? "Avatar"}
          fill
          className="rounded-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary font-semibold text-white ${styles.text}`}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute ${styles.dot} rounded-full border-2 border-ink ${
            online ? "bg-accent" : "bg-text-muted"
          }`}
        />
      )}
    </div>
  );
}
