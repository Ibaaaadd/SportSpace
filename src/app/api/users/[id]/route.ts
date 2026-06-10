import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/users/:id — ambil satu user
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true,
        role: { select: { id: true, name: true } }, status: true, lastActive: true, createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data user." }, { status: 500 });
  }
}

// PUT /api/users/:id — update user
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, roleId, active, password } = body;

    if (!name || !email || !roleId) {
      return NextResponse.json({ error: "Field name, email, dan role wajib diisi." }, { status: 400 });
    }

    // Cek role valid
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 400 });
    }

    // Cek email dipakai user lain
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Email sudah dipakai user lain." }, { status: 409 });
    }

    const updateData: Record<string, unknown> = {
      name,
      email,
      phone: phone || null,
      roleId,
      status: active === false ? "INACTIVE" : "ACTIVE",
    };

    // Hanya update password kalau dikirim
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, phone: true,
        role: { select: { id: true, name: true } }, status: true, lastActive: true, createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate user." }, { status: 500 });
  }
}

// DELETE /api/users/:id — hapus user
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User berhasil dihapus." });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus user." }, { status: 500 });
  }
}
