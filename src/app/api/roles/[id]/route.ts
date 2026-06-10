import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function withUserCount<T extends { id: string }>(role: T) {
  const userCount = await prisma.user.count({ where: { roleId: role.id } });
  return { ...role, userCount };
}

// GET /api/roles/:id
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const role = await prisma.role.findUnique({ where: { id } });

    if (!role) {
      return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(await withUserCount(role));
  } catch (err) {
    console.error("[GET /api/roles/:id]", err);
    return NextResponse.json({ error: "Gagal mengambil data role." }, { status: 500 });
  }
}

// PUT /api/roles/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama role wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.role.findFirst({
      where: { name: name.trim(), NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Nama role sudah digunakan." }, { status: 409 });
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        permissions: permissions ?? [],
      },
    });

    return NextResponse.json(await withUserCount(role));
  } catch (err) {
    console.error("[PUT /api/roles/:id]", err);
    return NextResponse.json({ error: "Gagal mengupdate role." }, { status: 500 });
  }
}

// DELETE /api/roles/:id
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const role = await prisma.role.findUnique({ where: { id } });

    if (!role) {
      return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 404 });
    }
    if (role.isSystem) {
      return NextResponse.json({ error: "Role system tidak dapat dihapus." }, { status: 403 });
    }

    const userCount = await prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      return NextResponse.json(
        { error: `Role masih digunakan oleh ${userCount} user. Pindahkan user terlebih dahulu.` },
        { status: 409 }
      );
    }

    await prisma.role.delete({ where: { id } });
    return NextResponse.json({ message: "Role berhasil dihapus." });
  } catch (err) {
    console.error("[DELETE /api/roles/:id]", err);
    return NextResponse.json({ error: "Gagal menghapus role." }, { status: 500 });
  }
}
