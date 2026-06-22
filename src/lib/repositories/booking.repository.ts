import { prisma } from '../prisma';
import { Booking, BookingStatus } from '@prisma/client';

export const bookingRepository = {
  // Create booking
  create: async (data: {
    bookingCode: string;
    userId: string;
    venueId: string;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    totalPrice: number;
    notes?: string;
  }) => {
    return await prisma.booking.create({
      data: {
        bookingCode: data.bookingCode,
        userId: data.userId,
        venueId: data.venueId,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        totalPrice: data.totalPrice,
        status: 'PENDING',
        notes: data.notes,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        venue: { select: { id: true, name: true } },
        payments: true,
      },
    });
  },

  // Get booking by ID
  findById: async (id: string) => {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        venue: { select: { id: true, name: true } },
        payments: true,
        notifications: true,
      },
    });
  },

  // Get booking by code
  findByCode: async (bookingCode: string) => {
    return await prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        venue: { select: { id: true, name: true } },
        payments: true,
      },
    });
  },

  // Get all bookings
  findMany: async (filters?: { userId?: string; venueId?: string; status?: BookingStatus }) => {
    return await prisma.booking.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.venueId && { venueId: filters.venueId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        venue: { select: { id: true, name: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Update booking status
  updateStatus: async (id: string, status: BookingStatus) => {
    return await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        venue: { select: { id: true, name: true } },
        payments: true,
      },
    });
  },

  // Cancel booking
  cancel: async (id: string, notes?: string) => {
    return await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: notes || 'Dibatalkan oleh user',
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        venue: { select: { id: true, name: true } },
        payments: true,
      },
    });
  },

  // Check if slot is available
  checkAvailability: async (venueId: string, bookingDate: Date, startTime: string, endTime: string) => {
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        venueId,
        bookingDate,
        startTime: { lte: endTime },
        endTime: { gte: startTime },
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      },
    });

    return !conflictingBooking;
  },

  // Get total bookings for user
  countUserBookings: async (userId: string) => {
    return await prisma.booking.count({ where: { userId } });
  },
};
