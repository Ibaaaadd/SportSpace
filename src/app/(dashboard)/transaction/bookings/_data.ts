// Booking Status types
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type BookingItem = {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  venueId: string;
  venueName: string;
  bookingDate: string; // ISO format
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  notes: string | null;
  paymentStatus: PaymentStatus | null;
  createdAt: string;
};

export type FormData = {
  userId: string;
  venueId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: string;
  notes: string;
};

export type FormErrors = Partial<Record<keyof FormData, string>>;

export const EMPTY_FORM: FormData = {
  userId: '',
  venueId: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  totalPrice: '',
  notes: '',
};

export const BOOKING_STATUS_BADGE: Record<BookingStatus, { color: string; label: string }> = {
  PENDING: { color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400', label: 'Pending' },
  CONFIRMED: { color: 'border-blue-500/40 bg-blue-500/10 text-blue-400', label: 'Confirmed' },
  CHECKED_IN: { color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400', label: 'Checked In' },
  COMPLETED: { color: 'border-green-500/40 bg-green-500/10 text-green-400', label: 'Completed' },
  CANCELLED: { color: 'border-red-500/40 bg-red-500/10 text-red-400', label: 'Cancelled' },
  EXPIRED: { color: 'border-gray-500/40 bg-gray-500/10 text-gray-400', label: 'Expired' },
};

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, { color: string; label: string }> = {
  PENDING: { color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400', label: 'Pending' },
  VERIFIED: { color: 'border-green-500/40 bg-green-500/10 text-green-400', label: 'Verified' },
  REJECTED: { color: 'border-red-500/40 bg-red-500/10 text-red-400', label: 'Rejected' },
};

export function normalizeBooking(item: any): BookingItem {
  const latestPayment = item.payments?.[0];
  
  return {
    id: item.id,
    bookingCode: item.bookingCode,
    userId: item.userId,
    userName: item.user?.name ?? 'Unknown',
    venueId: item.venueId,
    venueName: item.venue?.name ?? 'Unknown',
    bookingDate: new Date(item.bookingDate).toISOString().split('T')[0],
    startTime: item.startTime,
    endTime: item.endTime,
    totalPrice: item.totalPrice,
    status: item.status,
    notes: item.notes ?? null,
    paymentStatus: latestPayment?.status ?? null,
    createdAt: new Date(item.createdAt).toISOString().split('T')[0],
  };
}

export function validateBookingForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.userId?.trim()) errors.userId = 'User wajib dipilih';
  if (!data.venueId?.trim()) errors.venueId = 'Lapangan wajib dipilih';
  if (!data.bookingDate?.trim()) errors.bookingDate = 'Tanggal booking wajib diisi';
  if (!data.startTime?.trim()) errors.startTime = 'Jam mulai wajib diisi';
  if (!data.endTime?.trim()) errors.endTime = 'Jam selesai wajib diisi';
  if (!data.totalPrice?.trim()) errors.totalPrice = 'Total harga wajib diisi';
  if (isNaN(parseInt(data.totalPrice))) errors.totalPrice = 'Total harga harus angka';

  return errors;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
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
