import "dotenv/config";
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

async function main() {
  await prisma.roleConfig.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin", description: "Akses penuh ke seluruh sistem.", permissions: ALL_PERMS, isSystem: true },
  });
  await prisma.roleConfig.upsert({
    where: { name: "Operator" },
    update: {},
    create: {
      name: "Operator", description: "Kelola venue, booking, dan pembayaran.", isSystem: false,
      permissions: ["dashboard.view", "master.view", "transaction.view", "transaction.create", "transaction.edit", "report.view"],
    },
  });
  await prisma.roleConfig.upsert({
    where: { name: "Kasir" },
    update: {},
    create: {
      name: "Kasir", description: "Proses pembayaran dan cetak struk.", isSystem: false,
      permissions: ["dashboard.view", "transaction.view", "transaction.create", "report.view"],
    },
  });
  await prisma.roleConfig.upsert({
    where: { name: "Member" },
    update: {},
    create: {
      name: "Member", description: "Hanya bisa melihat jadwal dan booking mandiri.", isSystem: false,
      permissions: ["dashboard.view", "transaction.view", "transaction.create"],
    },
  });

  console.log("✅ Seed selesai: 4 roles berhasil dibuat.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
