import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            venue: { select: { id: true, name: true } },
          },
        },
        verifier: { select: { id: true, name: true } },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ data: payment });
  } catch (err) {
    console.error("[GET /api/payments/[id]]", err);
    return NextResponse.json({ error: "Gagal mengambil data pembayaran." }, { status: 500 });
  }
}
