import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        sportType: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(venue);
  } catch (err) {
    console.error("[GET /api/venues/:id]", err);
    return NextResponse.json({ error: "Gagal mengambil data venue." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const sportTypeId = typeof body.sportTypeId === "string" ? body.sportTypeId.trim() : "";
    const capacity = typeof body.capacity === "number" ? body.capacity : 0;
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : null;
    const status = typeof body.status === "string" ? body.status.toUpperCase() : "ACTIVE";

    if (!name) {
      return NextResponse.json({ error: "Nama venue wajib diisi." }, { status: 400 });
    }

    if (!sportTypeId) {
      return NextResponse.json({ error: "Jenis olahraga wajib dipilih." }, { status: 400 });
    }

    if (!capacity || capacity <= 0) {
      return NextResponse.json({ error: "Kapasitas harus lebih dari 0." }, { status: 400 });
    }

    if (!location) {
      return NextResponse.json({ error: "Lokasi wajib diisi." }, { status: 400 });
    }

    // Verify sport type exists
    const sportType = await prisma.sportType.findUnique({ where: { id: sportTypeId } });
    if (!sportType) {
      return NextResponse.json({ error: "Jenis olahraga tidak ditemukan." }, { status: 404 });
    }

    // Check if name is already used by another venue
    const existing = await prisma.venue.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Nama venue sudah digunakan." }, { status: 409 });
    }

    const venue = await prisma.venue.update({
      where: { id },
      data: {
        name,
        sportTypeId,
        capacity,
        location,
        description: description || null,
        imageUrl: imageUrl || null,
        status: status as any,
      },
      include: {
        sportType: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(venue);
  } catch (err) {
    console.error("[PUT /api/venues/:id]", err);
    return NextResponse.json({ error: "Gagal mengupdate venue." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.venue.delete({ where: { id } });

    return NextResponse.json({ message: "Venue berhasil dihapus." });
  } catch (err) {
    console.error("[DELETE /api/venues/:id]", err);
    return NextResponse.json({ error: "Gagal menghapus venue." }, { status: 500 });
  }
}
