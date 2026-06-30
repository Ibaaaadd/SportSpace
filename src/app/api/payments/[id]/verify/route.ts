import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { verifiedBy } = body;

    if (!verifiedBy?.trim()) {
      return NextResponse.json(
        { error: "verifiedBy wajib diisi." },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Pembayaran tidak ditemukan." },
        { status: 404 }
      );
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: `Pembayaran harus berstatus PENDING. Status saat ini: ${payment.status}` },
        { status: 400 }
      );
    }

    const verifier = await prisma.user.findUnique({
      where: { id: verifiedBy },
    });

    if (!verifier) {
      return NextResponse.json(
        { error: "Verifier tidak ditemukan." },
        { status: 404 }
      );
    }

    const [updatedPayment, updatedBooking] = await Promise.all([
      prisma.payment.update({
        where: { id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          verifiedBy,
        },
        include: {
          booking: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              venue: { select: { id: true, name: true } },
            },
          },
          verifier: { select: { id: true, name: true } },
        },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          venue: { select: { id: true, name: true } },
          payments: true,
        },
      }),
    ]);

    await prisma.slotLock.deleteMany({
      where: { bookingId: payment.bookingId },
    });

    return NextResponse.json({ data: updatedPayment });
  } catch (err) {
    console.error("[POST /api/payments/[id]/verify]", err);
    return NextResponse.json(
      { error: "Gagal memverifikasi pembayaran." },
      { status: 500 }
    );
  }
}
