// Shared types, constants, and helpers for the users module.

export type UserRole = "admin" | "operator" | "kasir" | "member";
export type UserStatus = "active" | "inactive";

export type UserItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
};

export type FormData = {
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  password: string;
  confirmPassword: string;
  changePassword: boolean;
};

export type FormErrors = Partial<Record<keyof FormData, string>>;

export const ROLE_OPTIONS = [
  { value: "admin",    label: "Admin" },
  { value: "operator", label: "Operator" },
  { value: "kasir",    label: "Kasir" },
  { value: "member",   label: "Member" },
];

export const ROLE_BADGE: Record<UserRole, { variant: "info" | "success" | "warning" | "muted"; label: string }> = {
  admin:    { variant: "info",    label: "Admin" },
  operator: { variant: "success", label: "Operator" },
  kasir:    { variant: "warning", label: "Kasir" },
  member:   { variant: "muted",   label: "Member" },
};

export const EMPTY_FORM: FormData = {
  name: "", email: "", phone: "", role: "operator", active: true,
  password: "", confirmPassword: "", changePassword: false,
};

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// Normalize API response (DB pakai uppercase enum) → frontend types (lowercase)
export function normalizeUser(u: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  lastActive: string;
}): UserItem {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    role: u.role.toLowerCase() as UserRole,
    status: u.status.toLowerCase() as UserStatus,
    lastActive: u.lastActive,
  };
}
