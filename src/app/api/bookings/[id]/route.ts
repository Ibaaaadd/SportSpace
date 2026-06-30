import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET /api/bookings/[id] — get booking detail
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        venue: { select: { id: true, name: true } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ data: booking });
  } catch (err) {
    console.error("[GET /api/bookings/[id]]", err);
    return NextResponse.json({ error: "Gagal mengambil data booking." }, { status: 500 });
  }
}

// DELETE /api/bookings/[id] — cancel booking
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Cek booking exists
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
    }

    // Cek booking status - hanya pending yang bisa dibatalkan
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: `Hanya booking dengan status PENDING yang bisa dibatalkan. Status saat ini: ${booking.status}` },
        { status: 400 }
      );
    }

    // Update status to CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        venue: { select: { id: true, name: true } },
        payments: true,
      },
    });

    return NextResponse.json({ data: updatedBooking });
  } catch (err) {
    console.error("[DELETE /api/bookings/[id]]", err);
    return NextResponse.json({ error: "Gagal membatalkan booking." }, { status: 500 });
  }
}
