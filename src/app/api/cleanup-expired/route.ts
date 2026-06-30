import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST() {
  try {
    const now = new Date();

    const expiredLocks = await prisma.slotLock.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
      include: {
        booking: true,
      },
    });

    const bookingIdsToCancel = expiredLocks
      .filter((lock) => lock.booking && lock.booking.status === "PENDING")
      .map((lock) => lock.bookingId as string);

    if (bookingIdsToCancel.length > 0) {
      await prisma.booking.updateMany({
        where: {
          id: { in: bookingIdsToCancel },
          status: "PENDING",
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    await prisma.slotLock.deleteMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });

    return NextResponse.json({
      message: "Cleanup completed",
      expiredLocks: expiredLocks.length,
      cancelledBookings: bookingIdsToCancel.length,
    });
  } catch (err) {
    console.error("[POST /api/cleanup-expired]", err);
    return NextResponse.json(
      { error: "Gagal melakukan cleanup." },
      { status: 500 }
    );
  }
}
