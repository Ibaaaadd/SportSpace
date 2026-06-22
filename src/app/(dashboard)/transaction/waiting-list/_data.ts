export type WaitingListItem = {
  id: string;
  userId: string;
  userName: string;
  venueId: string;
  venueName: string;
  bookingDate: string; // ISO format
  startTime: string;
  endTime: string;
  isNotified: boolean;
  notifiedAt: string | null;
  createdAt: string;
};

export const WAITING_LIST_NOTIFICATION_BADGE = {
  true: { color: 'border-green-500/40 bg-green-500/10 text-green-400', label: 'Notified' },
  false: { color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400', label: 'Waiting' },
};

export function normalizeWaitingList(item: any): WaitingListItem {
  return {
    id: item.id,
    userId: item.userId,
    userName: item.user?.name ?? 'Unknown',
    venueId: item.venueId,
    venueName: item.venue?.name ?? 'Unknown',
    bookingDate: new Date(item.bookingDate).toISOString().split('T')[0],
    startTime: item.startTime,
    endTime: item.endTime,
    isNotified: item.isNotified ?? false,
    notifiedAt: item.notifiedAt ? new Date(item.notifiedAt).toISOString().split('T')[0] : null,
    createdAt: new Date(item.createdAt).toISOString().split('T')[0],
  };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
