// Shared types, constants, and helpers for the users module.

export type UserStatus = "active" | "inactive";

export type RoleOption = { value: string; label: string };

export type UserItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  roleName: string;
  status: UserStatus;
  lastActive: string;
};

export type FormData = {
  name: string;
  email: string;
  phone: string;
  roleId: string;
  active: boolean;
  password: string;
  confirmPassword: string;
  changePassword: boolean;
};

export type FormErrors = Partial<Record<keyof FormData, string>>;

const ROLE_BADGE_VARIANTS: Record<string, "info" | "success" | "warning" | "muted"> = {
  admin: "info",
  operator: "success",
  kasir: "warning",
  member: "muted",
};

// Warna badge berdasarkan nama role. Role custom yang tidak dikenal -> "muted".
export function getRoleBadgeVariant(roleName: string): "info" | "success" | "warning" | "muted" {
  return ROLE_BADGE_VARIANTS[roleName.toLowerCase()] ?? "muted";
}

export const EMPTY_FORM: FormData = {
  name: "", email: "", phone: "", roleId: "", active: true,
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

// Normalize API response -> frontend UserItem
export function normalizeUser(u: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: { id: string; name: string };
  status: string;
  lastActive: string;
}): UserItem {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    roleId: u.role.id,
    roleName: u.role.name,
    status: u.status.toLowerCase() as UserStatus,
    lastActive: u.lastActive,
  };
}

// Map daftar role dari /api/roles -> opsi untuk <Select>
export function toRoleOptions(roles: { id: string; name: string }[]): RoleOption[] {
  return roles.map((r) => ({ value: r.id, label: r.name }));
}
