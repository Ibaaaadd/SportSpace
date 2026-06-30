import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause: Record<string, unknown> = {};
    if (status && ["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
      whereClause.status = status;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            venue: { select: { id: true, name: true } },
          },
        },
        verifier: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: payments });
  } catch (err) {
    console.error("[GET /api/payments]", err);
    return NextResponse.json(
      { error: "Gagal mengambil data pembayaran." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, method, amountPaid, proofUrl, notes } = body;

    if (!bookingId?.trim() || !method?.trim()) {
      return NextResponse.json(
        { error: "bookingId dan method wajib diisi." },
        { status: 400 }
      );
    }

    if (typeof amountPaid !== "number" || amountPaid <= 0) {
      return NextResponse.json(
        { error: "Jumlah pembayaran harus angka positif." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan." },
        { status: 404 }
      );
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: `Booking harus berstatus PENDING. Status saat ini: ${booking.status}` },
        { status: 400 }
      );
    }

    const existingPayment = booking.payments.find(
      (p) => p.status === "PENDING"
    );
    if (existingPayment) {
      return NextResponse.json(
        { error: "Booking sudah memiliki pembayaran pending." },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        method,
        amountPaid,
        proofUrl: proofUrl || null,
        notes: notes?.trim() || null,
        status: "PENDING",
      },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            venue: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/payments]", err);
    return NextResponse.json(
      { error: "Gagal membuat pembayaran." },
      { status: 500 }
    );
  }
}
