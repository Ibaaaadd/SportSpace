import { prisma } from '../prisma';
import { NotificationType } from '@prisma/client';

export const notificationRepository = {
  // Create in-app notification only
  create: async (data: {
    userId: string;
    bookingId?: string;
    type: NotificationType;
    message: string;
  }) => {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        bookingId: data.bookingId,
        type: data.type,
        channel: 'IN_APP', // Always IN_APP for now
        message: data.message,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        booking: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
          },
        },
      },
    });
  },

  // Get user notifications
  findByUserId: async (userId: string, options?: { unreadOnly?: boolean; limit?: number }) => {
    return await prisma.notification.findMany({
      where: {
        userId,
        ...(options?.unreadOnly && { isRead: false }),
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || undefined,
    });
  },

  // Get unread count
  countUnread: async (userId: string) => {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  // Mark as read
  markAsRead: async (id: string) => {
    return await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
          },
        },
      },
    });
  },

  // Mark all as read
  markAllAsRead: async (userId: string) => {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  // Get notification by ID
  findById: async (id: string) => {
    return await prisma.notification.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        booking: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
          },
        },
      },
    });
  },

  // Delete notification
  delete: async (id: string) => {
    return await prisma.notification.delete({
      where: { id },
    });
  },

  // Delete old notifications (for cleanup)
  deleteOlderThan: async (days: number = 30) => {
    const olderThan = new Date();
    olderThan.setDate(olderThan.getDate() - days);

    return await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: olderThan,
        },
        isRead: true, // Only delete read notifications
      },
    });
  },
};
