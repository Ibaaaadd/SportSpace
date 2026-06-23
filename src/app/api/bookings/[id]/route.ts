import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// DELETE /api/bookings/[id] — cancel booking
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

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
