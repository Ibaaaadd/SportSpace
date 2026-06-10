import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/menus — ambil semua menu beserta matriks akses per role
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: { permissions: { include: { role: true } } },
      orderBy: { order: "asc" },
    });

    const result = menus.map((m) => ({
      id: m.id,
      label: m.label,
      icon: m.icon,
      href: m.href,
      parentId: m.parentId,
      order: m.order,
      isGroup: m.isGroup,
      isActive: m.isActive,
      access: Object.fromEntries(
        m.permissions.map((perm) => [
          perm.role.name.toLowerCase(),
          { view: perm.canView, create: perm.canCreate, edit: perm.canEdit, delete: perm.canDelete },
        ])
      ),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/menus]", err);
    return NextResponse.json({ error: "Gagal mengambil data menu." }, { status: 500 });
  }
}
