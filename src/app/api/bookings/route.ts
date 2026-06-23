import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// Utility: Generate unique booking code
function generateBookingCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "BK";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/bookings — fetch all bookings
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        venue: { select: { id: true, name: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: bookings });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Gagal mengambil data booking." }, { status: 500 });
  }
}

// POST /api/bookings — create new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, venueId, bookingDate, startTime, endTime, totalPrice, notes } = body;

    // Validasi field wajib
    if (!userId?.trim() || !venueId?.trim() || !bookingDate?.trim() || !startTime?.trim() || !endTime?.trim()) {
      return NextResponse.json(
        { error: "Semua field wajib diisi (userId, venueId, bookingDate, startTime, endTime)." },
        { status: 400 }
      );
    }

    if (typeof totalPrice !== "number" || totalPrice <= 0) {
      return NextResponse.json({ error: "Total harga harus angka positif." }, { status: 400 });
    }

    // Cek user & venue exist
    const [user, venue] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.venue.findUnique({ where: { id: venueId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    if (!venue) {
      return NextResponse.json({ error: "Venue tidak ditemukan." }, { status: 404 });
    }

    // Parse booking date
    const bookingDateObj = new Date(bookingDate);
    if (isNaN(bookingDateObj.getTime())) {
      return NextResponse.json({ error: "Format tanggal tidak valid." }, { status: 400 });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingCode: generateBookingCode(),
        userId,
        venueId,
        bookingDate: bookingDateObj,
        startTime,
        endTime,
        totalPrice,
        notes: notes?.trim() || null,
        status: "PENDING",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        venue: { select: { id: true, name: true } },
        payments: true,
      },
    });

    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Gagal membuat booking." }, { status: 500 });
  }
}
