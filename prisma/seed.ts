import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ALL_PERMS = [
  "dashboard.view",
  "master.view", "master.create", "master.edit", "master.delete",
  "transaction.view", "transaction.create", "transaction.edit", "transaction.delete",
  "report.view", "report.export",
  "setup.view", "setup.create", "setup.edit", "setup.delete",
];

// ─── Roles ──────────────────────────────────────────────────────────────────

async function seedRoles() {
  await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin", description: "Akses penuh ke seluruh sistem.", permissions: ALL_PERMS, isSystem: true },
  });
  await prisma.role.upsert({
    where: { name: "Operator" },
    update: {},
    create: {
      name: "Operator", description: "Kelola venue, booking, dan pembayaran.", isSystem: false,
      permissions: ["dashboard.view", "master.view", "transaction.view", "transaction.create", "transaction.edit", "report.view"],
    },
  });
  await prisma.role.upsert({
    where: { name: "Kasir" },
    update: {},
    create: {
      name: "Kasir", description: "Proses pembayaran dan cetak struk.", isSystem: false,
      permissions: ["dashboard.view", "transaction.view", "transaction.create", "report.view"],
    },
  });
  await prisma.role.upsert({
    where: { name: "Member" },
    update: {},
    create: {
      name: "Member", description: "Hanya bisa melihat jadwal dan booking mandiri.", isSystem: false,
      permissions: ["dashboard.view", "transaction.view", "transaction.create"],
    },
  });

  console.log("✅ 4 roles siap.");
}

// ─── Users dummy ────────────────────────────────────────────────────────────

async function seedUsers() {
  const password = await bcrypt.hash("password123", 10);

  const roles = await prisma.role.findMany({
    where: { name: { in: ["Admin", "Operator", "Kasir", "Member"] } },
  });
  const roleIdByName = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  const users: { name: string; email: string; phone: string; roleName: "Admin" | "Operator" | "Kasir" | "Member" }[] = [
    { name: "Admin SportSpace", email: "admin@sportspace.test", phone: "081200000001", roleName: "Admin" },
    { name: "Operator Lapangan", email: "operator@sportspace.test", phone: "081200000002", roleName: "Operator" },
    { name: "Kasir Toko", email: "kasir@sportspace.test", phone: "081200000003", roleName: "Kasir" },
    { name: "Member Demo", email: "member@sportspace.test", phone: "081200000004", roleName: "Member" },
  ];

  for (const u of users) {
    const { roleName, ...data } = u;
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...data, roleId: roleIdByName[roleName], password },
    });
  }

  console.log("✅ 4 user dummy siap (password: password123).");
}

// ─── Menus + permission per role ───────────────────────────────────────────

type Perm = { view: boolean; create: boolean; edit: boolean; delete: boolean };

type MenuSeed = {
  key: string;
  label: string;
  icon: string;
  href: string;
  parentKey: string | null;
  order: number;
  isGroup: boolean;
  isActive: boolean;
  access: Record<"admin" | "operator" | "kasir" | "member", Perm>;
};

function p(view: boolean, create: boolean, edit: boolean, del: boolean): Perm {
  return { view, create, edit, delete: del };
}

const MENU_SEED: MenuSeed[] = [
  {
    key: "dashboard", label: "Dashboard", icon: "dashboard", href: "/dashboard",
    parentKey: null, order: 1, isGroup: false, isActive: true,
    access: {
      admin: p(true, false, false, false), operator: p(true, false, false, false),
      kasir: p(true, false, false, false), member: p(true, false, false, false),
    },
  },
  {
    key: "transaction", label: "Transaksi", icon: "calendar", href: "#",
    parentKey: null, order: 2, isGroup: true, isActive: true,
    access: {
      admin: p(true, false, false, false), operator: p(true, false, false, false),
      kasir: p(true, false, false, false), member: p(true, false, false, false),
    },
  },
  {
    key: "transaction.bookings", label: "Bookings", icon: "calendar", href: "/transaction/bookings",
    parentKey: "transaction", order: 1, isGroup: false, isActive: true,
    access: {
      admin: p(true, true, true, true), operator: p(true, true, true, false),
      kasir: p(true, true, false, false), member: p(true, true, false, false),
    },
  },
  {
    key: "transaction.payments", label: "Payments", icon: "payment", href: "/transaction/payments",
    parentKey: "transaction", order: 2, isGroup: false, isActive: true,
    access: {
      admin: p(true, true, true, true), operator: p(true, true, true, false),
      kasir: p(true, true, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "transaction.waiting-list", label: "Waiting List", icon: "activity", href: "/transaction/waiting-list",
    parentKey: "transaction", order: 3, isGroup: false, isActive: true,
    access: {
      admin: p(true, true, true, true), operator: p(true, true, false, false),
      kasir: p(true, false, false, false), member: p(true, false, false, false),
    },
  },
  {
    key: "master", label: "Master Data", icon: "database", href: "#",
    parentKey: null, order: 3, isGroup: true, isActive: true,
    access: {
      admin: p(true, false, false, false), operator: p(true, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "master.sport-types", label: "Jenis Olahraga", icon: "tag", href: "/master/sport-types",
    parentKey: "master", order: 1, isGroup: false, isActive: true,
    access: {
      admin: p(true, true, true, true), operator: p(true, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "master.venues", label: "Venue", icon: "pin", href: "/master/venues",
    parentKey: "master", order: 2, isGroup: false, isActive: true,
    access: {
      admin: p(true, true, true, true), operator: p(true, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "master.pricing", label: "Harga", icon: "dollar", href: "/master/pricing",
    parentKey: "master", order: 3, isGroup: false, isActive: true,
    access: {
      admin: p(true, true, true, true), operator: p(true, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "report", label: "Laporan", icon: "chart", href: "#",
    parentKey: null, order: 4, isGroup: true, isActive: true,
    access: {
      admin: p(true, false, false, false), operator: p(true, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "report.occupancy", label: "Okupansi", icon: "activity", href: "/report/occupancy",
    parentKey: "report", order: 1, isGroup: false, isActive: true,
    access: {
      admin: p(true, false, false, false), operator: p(true, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "report.revenue", label: "Pendapatan", icon: "trending", href: "/report/revenue",
    parentKey: "report", order: 2, isGroup: false, isActive: true,
    access: {
      admin: p(true, false, false, false), operator: p(false, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "setup", label: "Setup", icon: "settings", href: "#",
    parentKey: null, order: 5, isGroup: true, isActive: true,
    access: {
      admin: p(true, false, false, false), operator: p(false, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "setup.users", label: "Pengguna", icon: "users", href: "/setup/users",
    parentKey: "setup", order: 1, isGroup: false, isActive: true,
    access: {
      admin: p(true, true, true, true), operator: p(false, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
  {
    key: "setup.roles", label: "Role", icon: "shield", href: "/setup/roles",
    parentKey: "setup", order: 2, isGroup: false, isActive: true,
    access: {
      admin: p(true, true, true, true), operator: p(false, false, false, false),
      kasir: p(false, false, false, false), member: p(false, false, false, false),
    },
  },
];

const ROLE_NAME_BY_KEY: Record<string, string> = {
  admin: "Admin", operator: "Operator", kasir: "Kasir", member: "Member",
};

async function seedMenus() {
  const roles = await prisma.role.findMany({ where: { name: { in: Object.values(ROLE_NAME_BY_KEY) } } });
  const roleIdByName = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  // Reset menu data agar seed idempotent
  await prisma.menuPermission.deleteMany({});
  await prisma.menu.deleteMany({});

  const idByKey: Record<string, string> = {};

  // Pass 1: buat root menus (tanpa parent)
  for (const m of MENU_SEED.filter((m) => !m.parentKey)) {
    const menu = await prisma.menu.create({
      data: { label: m.label, icon: m.icon, href: m.href, order: m.order, isGroup: m.isGroup, isActive: m.isActive },
    });
    idByKey[m.key] = menu.id;
  }

  // Pass 2: buat child menus
  for (const m of MENU_SEED.filter((m) => m.parentKey)) {
    const menu = await prisma.menu.create({
      data: {
        label: m.label, icon: m.icon, href: m.href, order: m.order,
        isGroup: m.isGroup, isActive: m.isActive, parentId: idByKey[m.parentKey!],
      },
    });
    idByKey[m.key] = menu.id;
  }

  // Pass 3: matriks permission per role
  for (const m of MENU_SEED) {
    const menuId = idByKey[m.key];
    for (const roleKey of Object.keys(m.access) as (keyof typeof m.access)[]) {
      const roleId = roleIdByName[ROLE_NAME_BY_KEY[roleKey]];
      if (!roleId) continue;
      const perm = m.access[roleKey];
      await prisma.menuPermission.create({
        data: {
          menuId, roleId,
          canView: perm.view, canCreate: perm.create, canEdit: perm.edit, canDelete: perm.delete,
        },
      });
    }
  }

  console.log(`✅ ${MENU_SEED.length} menu + permission per role siap.`);
}

async function main() {
  await seedRoles();
  await seedUsers();
  await seedMenus();
}

main().catch(console.error).finally(() => prisma.$disconnect());
