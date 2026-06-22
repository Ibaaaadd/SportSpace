import { prisma } from '../prisma';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export const paymentRepository = {
  // Create payment
  create: async (data: {
    bookingId: string;
    method: PaymentMethod;
    amountPaid: number;
    proofUrl?: string;
    notes?: string;
  }) => {
    return await prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        method: data.method,
        amountPaid: data.amountPaid,
        status: 'PENDING',
        proofUrl: data.proofUrl,
        notes: data.notes,
      },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            venue: { select: { id: true, name: true } },
          },
        },
        verifier: { select: { id: true, name: true, email: true } },
      },
    });
  },

  // Get payment by ID
  findById: async (id: string) => {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            venue: { select: { id: true, name: true } },
          },
        },
        verifier: { select: { id: true, name: true, email: true } },
      },
    });
  },

  // Get payments by booking ID
  findByBookingId: async (bookingId: string) => {
    return await prisma.payment.findMany({
      where: { bookingId },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            venue: { select: { id: true, name: true } },
          },
        },
        verifier: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get all payments
  findMany: async (filters?: { status?: PaymentStatus; method?: PaymentMethod }) => {
    return await prisma.payment.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.method && { method: filters.method }),
      },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            venue: { select: { id: true, name: true } },
          },
        },
        verifier: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Verify payment
  verify: async (id: string, verifiedBy: string) => {
    return await prisma.payment.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy,
      },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            venue: { select: { id: true, name: true } },
          },
        },
        verifier: { select: { id: true, name: true, email: true } },
      },
    });
  },

  // Reject payment
  reject: async (id: string, verifiedBy: string, notes?: string) => {
    return await prisma.payment.update({
      where: { id },
      data: {
        status: 'REJECTED',
        verifiedAt: new Date(),
        verifiedBy,
        notes: notes || 'Pembayaran ditolak',
      },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            venue: { select: { id: true, name: true } },
          },
        },
        verifier: { select: { id: true, name: true, email: true } },
      },
    });
  },

  // Get payment by booking (latest)
  findLatestByBookingId: async (bookingId: string) => {
    return await prisma.payment.findFirst({
      where: { bookingId },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            venue: { select: { id: true, name: true } },
          },
        },
        verifier: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
