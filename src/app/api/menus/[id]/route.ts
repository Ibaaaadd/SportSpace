import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

type RolePerms = { view: boolean; create: boolean; edit: boolean; delete: boolean };

// PUT /api/menus/:id — update status aktif & matriks akses per role
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { access, isActive } = body as { access?: Record<string, RolePerms>; isActive?: boolean };

    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      return NextResponse.json({ error: "Menu tidak ditemukan." }, { status: 404 });
    }

    if (typeof isActive === "boolean") {
      await prisma.menu.update({ where: { id }, data: { isActive } });
    }

    if (access) {
      const roles = await prisma.role.findMany();
      const roleIdByName = Object.fromEntries(roles.map((r) => [r.name.toLowerCase(), r.id]));

      for (const [roleKey, perm] of Object.entries(access)) {
        const roleId = roleIdByName[roleKey.toLowerCase()];
        if (!roleId) continue;

        await prisma.menuPermission.upsert({
          where: { menuId_roleId: { menuId: id, roleId } },
          update: { canView: perm.view, canCreate: perm.create, canEdit: perm.edit, canDelete: perm.delete },
          create: {
            menuId: id, roleId,
            canView: perm.view, canCreate: perm.create, canEdit: perm.edit, canDelete: perm.delete,
          },
        });
      }
    }

    const updated = await prisma.menu.findUnique({
      where: { id },
      include: { permissions: { include: { role: true } } },
    });

    return NextResponse.json({
      id: updated!.id,
      label: updated!.label,
      icon: updated!.icon,
      href: updated!.href,
      parentId: updated!.parentId,
      order: updated!.order,
      isGroup: updated!.isGroup,
      isActive: updated!.isActive,
      access: Object.fromEntries(
        updated!.permissions.map((perm) => [
          perm.role.name.toLowerCase(),
          { view: perm.canView, create: perm.canCreate, edit: perm.canEdit, delete: perm.canDelete },
        ])
      ),
    });
  } catch (err) {
    console.error("[PUT /api/menus/:id]", err);
    return NextResponse.json({ error: "Gagal mengupdate menu." }, { status: 500 });
  }
}
