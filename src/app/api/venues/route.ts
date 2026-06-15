import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        sportType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(venues);
  } catch (err) {
    console.error("[GET /api/venues]", err);
    return NextResponse.json({ error: "Gagal mengambil data venue." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const existing = await prisma.venue.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Nama venue sudah digunakan." }, { status: 409 });
    }

    const venue = await prisma.venue.create({
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

    return NextResponse.json(venue, { status: 201 });
  } catch (err) {
    console.error("[POST /api/venues]", err);
    return NextResponse.json({ error: "Gagal membuat venue." }, { status: 500 });
  }
}
