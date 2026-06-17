import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/pricing/:id
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const pricing = await prisma.pricing.findUnique({
      where: { id },
      select: {
        id: true,
        venueId: true,
        venue: { select: { name: true } },
        label: true,
        dayType: true,
        startTime: true,
        endTime: true,
        pricePerHour: true,
      },
    });

    if (!pricing) {
      return NextResponse.json({ error: "Pricing rule tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      id: pricing.id,
      venueId: pricing.venueId,
      venueName: pricing.venue.name,
      label: pricing.label,
      dayType: pricing.dayType,
      startTime: pricing.startTime,
      endTime: pricing.endTime,
      pricePerHour: pricing.pricePerHour,
    });
  } catch (err) {
    console.error("[GET /api/pricing/:id]", err);
    return NextResponse.json({ error: "Gagal mengambil data pricing." }, { status: 500 });
  }
}

// PUT /api/pricing/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { label, dayType, startTime, endTime, pricePerHour } = body;

    // Cek pricing ada
    const pricing = await prisma.pricing.findUnique({ where: { id } });
    if (!pricing) {
      return NextResponse.json({ error: "Pricing rule tidak ditemukan." }, { status: 404 });
    }

    // Validasi field
    if (!label || !dayType || !startTime || !endTime || !pricePerHour) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    // Validasi waktu
    if (startTime >= endTime) {
      return NextResponse.json({ error: "Jam selesai harus setelah jam mulai." }, { status: 400 });
    }

    // Validasi harga
    if (pricePerHour < 1) {
      return NextResponse.json({ error: "Harga harus lebih dari 0." }, { status: 400 });
    }

    // Cek duplikat (exclude current id)
    const existing = await prisma.pricing.findFirst({
      where: {
        venueId: pricing.venueId,
        label,
        dayType,
        NOT: { id },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Label dengan tipe hari yang sama sudah ada untuk venue ini." }, { status: 409 });
    }

    const updated = await prisma.pricing.update({
      where: { id },
      data: {
        label,
        dayType,
        startTime,
        endTime,
        pricePerHour: Number(pricePerHour),
      },
      select: {
        id: true,
        venueId: true,
        venue: { select: { name: true } },
        label: true,
        dayType: true,
        startTime: true,
        endTime: true,
        pricePerHour: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      venueId: updated.venueId,
      venueName: updated.venue.name,
      label: updated.label,
      dayType: updated.dayType,
      startTime: updated.startTime,
      endTime: updated.endTime,
      pricePerHour: updated.pricePerHour,
    });
  } catch (err) {
    console.error("[PUT /api/pricing/:id]", err);
    return NextResponse.json({ error: "Gagal mengupdate pricing rule." }, { status: 500 });
  }
}

// DELETE /api/pricing/:id
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const pricing = await prisma.pricing.findUnique({ where: { id } });

    if (!pricing) {
      return NextResponse.json({ error: "Pricing rule tidak ditemukan." }, { status: 404 });
    }

    await prisma.pricing.delete({ where: { id } });
    return NextResponse.json({ message: "Pricing rule berhasil dihapus." });
  } catch (err) {
    console.error("[DELETE /api/pricing/:id]", err);
    return NextResponse.json({ error: "Gagal menghapus pricing rule." }, { status: 500 });
  }
}
