import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const sportTypes = await prisma.sportType.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(sportTypes);
  } catch (err) {
    console.error("[GET /api/sport-types]", err);
    return NextResponse.json({ error: "Gagal mengambil data jenis olahraga." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const color = typeof body.color === "string" && body.color.trim() ? body.color.trim() : "blue";

    if (!name) {
      return NextResponse.json({ error: "Nama jenis olahraga wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.sportType.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Nama jenis olahraga sudah digunakan." }, { status: 409 });
    }

    const sportType = await prisma.sportType.create({
      data: {
        name,
        description: description || null,
        color,
      },
    });

    return NextResponse.json(sportType, { status: 201 });
  } catch (err) {
    console.error("[POST /api/sport-types]", err);
    return NextResponse.json({ error: "Gagal membuat jenis olahraga." }, { status: 500 });
  }
}