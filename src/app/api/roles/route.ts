import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { UserRole } from "../../../generated/prisma/enums";

// GET /api/roles — ambil semua role + user count per role
export async function GET() {
  try {
    const [roles, ...roleCounts] = await Promise.all([
      prisma.role.findMany({ orderBy: { createdAt: "asc" } }),
      // Hitung user per UserRole enum secara paralel
      ...Object.values(UserRole).map((r) =>
        prisma.user.count({ where: { role: r } }).then((count) => ({ role: r, count }))
      ),
    ]);

    const countMap = Object.fromEntries(
      roleCounts.map(({ role, count }) => [role.toLowerCase(), count])
    );

    return NextResponse.json(
      roles.map((r) => ({ ...r, userCount: countMap[r.name.toLowerCase()] ?? 0 }))
    );
  } catch (err) {
    console.error("[GET /api/roles]", err);
    return NextResponse.json({ error: "Gagal mengambil data role." }, { status: 500 });
  }
}

// POST /api/roles — buat role baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, permissions, isSystem } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama role wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.role.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: "Nama role sudah digunakan." }, { status: 409 });
    }

    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        permissions: permissions ?? [],
        isSystem: isSystem ?? false,
      },
    });

    return NextResponse.json({ ...role, userCount: 0 }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/roles]", err);
    return NextResponse.json({ error: "Gagal membuat role." }, { status: 500 });
  }
}
