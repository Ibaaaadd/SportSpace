import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/pricing — ambil semua pricing rules (atau filter by venueId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");

    const pricing = await prisma.pricing.findMany({
      where: venueId ? { venueId } : undefined,
      select: {
        id: true,
        venueId: true,
        venue: { select: { name: true } },
        label: true,
        dayType: true,
        startTime: true,
        endTime: true,
        pricePerHour: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      pricing.map(({ venue, createdAt, ...p }: any) => ({
        ...p,
        venueName: venue.name,
      }))
    );
  } catch (err) {
    console.error("[GET /api/pricing]", err);
    return NextResponse.json({ error: "Gagal mengambil data pricing." }, { status: 500 });
  }
}

// POST /api/pricing — buat pricing rule baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { venueId, label, dayType, startTime, endTime, pricePerHour } = body;

    // Validasi field wajib
    if (!venueId || !label || !dayType || !startTime || !endTime || !pricePerHour) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    // Cek venue valid
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) {
      return NextResponse.json({ error: "Venue tidak ditemukan." }, { status: 400 });
    }

    // Validasi waktu
    if (startTime >= endTime) {
      return NextResponse.json({ error: "Jam selesai harus setelah jam mulai." }, { status: 400 });
    }

    // Validasi harga
    if (pricePerHour < 1) {
      return NextResponse.json({ error: "Harga harus lebih dari 0." }, { status: 400 });
    }

    // Cek duplikat
    const existing = await prisma.pricing.findFirst({
      where: {
        venueId,
        label,
        dayType,
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Pricing rule dengan label dan tipe hari yang sama sudah ada." }, { status: 409 });
    }

    const pricing = await prisma.pricing.create({
      data: {
        venueId,
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

    return NextResponse.json(
      {
        id: pricing.id,
        venueId: pricing.venueId,
        venueName: pricing.venue.name,
        label: pricing.label,
        dayType: pricing.dayType,
        startTime: pricing.startTime,
        endTime: pricing.endTime,
        pricePerHour: pricing.pricePerHour,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/pricing]", err);
    return NextResponse.json({ error: "Gagal membuat pricing rule." }, { status: 500 });
  }
}
