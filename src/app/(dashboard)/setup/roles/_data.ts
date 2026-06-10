// Shared types, constants, and helpers for the roles module.

export type RoleItem = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
};

export type FormData = {
  name: string;
  description: string;
  permissions: string[];
};

export type FormErrors = Partial<Pick<FormData, "name">>;

export const PERM_GROUPS = [
  { module: "Dashboard",   key: "dashboard",   perms: ["view"] },
  { module: "Master Data", key: "master",      perms: ["view", "create", "edit", "delete"] },
  { module: "Transaksi",   key: "transaction", perms: ["view", "create", "edit", "delete"] },
  { module: "Laporan",     key: "report",      perms: ["view", "export"] },
  { module: "Setup",       key: "setup",       perms: ["view", "create", "edit", "delete"] },
];

export const PERM_LABEL: Record<string, string> = {
  view: "Lihat", create: "Buat", edit: "Edit", delete: "Hapus", export: "Export",
};

export function permKey(mod: string, perm: string) { return `${mod}.${perm}`; }

export const TOTAL_PERMS = PERM_GROUPS.flatMap((g) => g.perms).length;

export const EMPTY_FORM: FormData = { name: "", description: "", permissions: [] };

export function normalizeRole(r: {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
  userCount?: number;
  isSystem: boolean;
}): RoleItem {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    permissions: r.permissions ?? [],
    userCount: r.userCount ?? 0,
    isSystem: r.isSystem,
  };
}
