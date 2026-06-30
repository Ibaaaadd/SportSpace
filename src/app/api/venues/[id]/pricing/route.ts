import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { error: "Parameter date wajib diisi." },
        { status: 400 }
      );
    }

    const bookingDate = new Date(dateStr);
    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid." },
        { status: 400 }
      );
    }

    const dayOfWeek = bookingDate.getDay();
    const dayType =
      dayOfWeek === 0 || dayOfWeek === 6 ? "weekend" : "weekday";

    const pricing = await prisma.pricing.findMany({
      where: {
        venueId: id,
        dayType,
      },
      select: {
        label: true,
        startTime: true,
        endTime: true,
        pricePerHour: true,
      },
      orderBy: { startTime: "asc" },
    });

    if (pricing.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const timeSlots = pricing.map((p) => ({
      startTime: p.startTime,
      endTime: p.endTime,
      pricePerHour: p.pricePerHour,
    }));

    return NextResponse.json({ data: timeSlots });
  } catch (err) {
    console.error("[GET /api/venues/:id/pricing]", err);
    return NextResponse.json(
      { error: "Gagal mengambil data pricing." },
      { status: 500 }
    );
  }
}
