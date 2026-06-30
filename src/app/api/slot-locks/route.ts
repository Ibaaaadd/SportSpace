import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, userId, venueId, bookingDate, startTime, endTime } =
      body;

    if (
      !bookingId?.trim() ||
      !userId?.trim() ||
      !venueId?.trim() ||
      !bookingDate?.trim() ||
      !startTime?.trim() ||
      !endTime?.trim()
    ) {
      return NextResponse.json(
        {
          error: "Semua field wajib diisi (bookingId, userId, venueId, bookingDate, startTime, endTime).",
        },
        { status: 400 }
      );
    }

    const slotLock = await prisma.slotLock.create({
      data: {
        bookingId,
        userId,
        venueId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        expiresAt: new Date(Date.now() + 3 * 60 * 1000),
      },
    });

    return NextResponse.json({ data: slotLock }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/slot-locks]", err);
    return NextResponse.json(
      { error: "Gagal membuat slot lock." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId?.trim()) {
      return NextResponse.json(
        { error: "bookingId wajib diisi." },
        { status: 400 }
      );
    }

    await prisma.slotLock.deleteMany({
      where: { bookingId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/slot-locks]", err);
    return NextResponse.json(
      { error: "Gagal menghapus slot lock." },
      { status: 500 }
    );
  }
}
