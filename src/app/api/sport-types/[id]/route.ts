import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const sportType = await prisma.sportType.findUnique({ where: { id } });

    if (!sportType) {
      return NextResponse.json({ error: "Jenis olahraga tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(sportType);
  } catch (err) {
    console.error("[GET /api/sport-types/:id]", err);
    return NextResponse.json({ error: "Gagal mengambil data jenis olahraga." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const color = typeof body.color === "string" && body.color.trim() ? body.color.trim() : "blue";

    if (!name) {
      return NextResponse.json({ error: "Nama jenis olahraga wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.sportType.findFirst({
      where: { name, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Nama jenis olahraga sudah digunakan." }, { status: 409 });
    }

    const sportType = await prisma.sportType.update({
      where: { id },
      data: {
        name,
        description: description || null,
        color,
      },
    });

    return NextResponse.json(sportType);
  } catch (err) {
    console.error("[PUT /api/sport-types/:id]", err);
    return NextResponse.json({ error: "Gagal mengupdate jenis olahraga." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const sportType = await prisma.sportType.findUnique({ where: { id } });

    if (!sportType) {
      return NextResponse.json({ error: "Jenis olahraga tidak ditemukan." }, { status: 404 });
    }

    if (sportType.venueCount > 0) {
      return NextResponse.json(
        { error: `Jenis olahraga masih digunakan oleh ${sportType.venueCount} venue. Pindahkan venue terlebih dahulu.` },
        { status: 409 }
      );
    }

    await prisma.sportType.delete({ where: { id } });
    return NextResponse.json({ message: "Jenis olahraga berhasil dihapus." });
  } catch (err) {
    console.error("[DELETE /api/sport-types/:id]", err);
    return NextResponse.json({ error: "Gagal menghapus jenis olahraga." }, { status: 500 });
  }
}