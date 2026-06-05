import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

// GET /api/users — ambil semua user
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        lastActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data user." }, { status: 500 });
  }
}

// POST /api/users — buat user baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, password, active } = body;

    // Validasi field wajib
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Field name, email, role, dan password wajib diisi." }, { status: 400 });
    }

    // Cek email sudah dipakai
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role.toUpperCase(),
        status: active === false ? "INACTIVE" : "ACTIVE",
        password: hashedPassword,
      },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, lastActive: true, createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat user." }, { status: 500 });
  }
}
