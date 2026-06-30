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

// GET /api/bookings — fetch bookings with pagination, optional venueId & bookingDate filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const bookingDate = searchParams.get("bookingDate");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    const whereClause: Record<string, unknown> = {};

    if (venueId) whereClause.venueId = venueId;
    if (bookingDate) {
      const dateObj = new Date(bookingDate);
      if (!isNaN(dateObj.getTime())) {
        whereClause.bookingDate = dateObj;
      }
    }
    if (status && status !== '') {
      whereClause.status = status;
    }

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      whereClause.OR = [
        { bookingCode: { contains: searchLower, mode: 'insensitive' } },
        { user: { name: { contains: searchLower, mode: 'insensitive' } } },
        { venue: { name: { contains: searchLower, mode: 'insensitive' } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where: whereClause }),
      prisma.booking.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
          venue: { select: { id: true, name: true } },
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        currentRowsCount: bookings.length,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
      },
    });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Gagal mengambil data booking." }, { status: 500 });
  }
}

// POST /api/bookings — create new booking + payment atomically
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, venueId, bookingDate, startTime, endTime, totalPrice, notes, paymentMethod } = body;

    // Validasi field wajib
    if (!userId?.trim() || !venueId?.trim() || !bookingDate?.trim() || !startTime?.trim() || !endTime?.trim()) {
      return NextResponse.json(
        { error: "Semua field wajib diisi (userId, venueId, bookingDate, startTime, endTime)." },
        { status: 400 }
      );
    }

    if (!paymentMethod?.trim()) {
      return NextResponse.json(
        { error: "Metode pembayaran wajib dipilih." },
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

    // Check for conflicts with existing PENDING/CONFIRMED bookings
    const existingBooking = await prisma.booking.findFirst({
      where: {
        venueId,
        bookingDate: bookingDateObj,
        startTime,
        endTime,
        status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Slot sudah dipesan. Silakan pilih waktu lain." },
        { status: 409 }
      );
    }

    // Atomic transaction: create booking + payment + slot lock
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
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
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          method: paymentMethod,
          amountPaid: totalPrice,
          status: "PENDING",
        },
      });

      // Create slot lock (expires in 24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await tx.slotLock.create({
        data: {
          bookingId: booking.id,
          userId,
          venueId,
          bookingDate: bookingDateObj,
          startTime,
          endTime,
          expiresAt,
        },
      });

      return { booking, payment };
    });

    return NextResponse.json({
      data: {
        ...result.booking,
        payments: [result.payment],
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Gagal membuat booking." }, { status: 500 });
  }
}
