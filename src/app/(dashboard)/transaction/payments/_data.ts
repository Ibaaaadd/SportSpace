// Payment types
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type PaymentMethod = 'TRANSFER' | 'QRIS' | 'CASH' | 'EWALLET';

export type PaymentItem = {
  id: string;
  bookingCode: string;
  bookingId: string;
  userId: string;
  userName: string;
  method: PaymentMethod;
  amountPaid: number;
  totalBookingPrice: number;
  status: PaymentStatus;
  proofUrl: string | null;
  verifiedAt: string | null;
  verifierName: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
};

export type FormData = {
  bookingId: string;
  method: 'TRANSFER' | 'QRIS' | 'CASH' | 'EWALLET';
  amountPaid: string;
  proofUrl: string;
  notes: string;
};

export type FormErrors = Partial<Record<keyof FormData, string>>;

export const EMPTY_FORM: FormData = {
  bookingId: '',
  method: 'TRANSFER',
  amountPaid: '',
  proofUrl: '',
  notes: '',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  TRANSFER: 'Transfer Bank',
  QRIS: 'QRIS',
  CASH: 'Tunai',
  EWALLET: 'E-Wallet',
};

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, { color: string; label: string }> = {
  PENDING: { color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400', label: 'Pending' },
  VERIFIED: { color: 'border-green-500/40 bg-green-500/10 text-green-400', label: 'Verified' },
  REJECTED: { color: 'border-red-500/40 bg-red-500/10 text-red-400', label: 'Rejected' },
};

export function normalizePayment(item: any): PaymentItem {
  return {
    id: item.id,
    bookingCode: item.booking?.bookingCode ?? 'Unknown',
    bookingId: item.bookingId,
    userId: item.booking?.userId ?? '',
    userName: item.booking?.user?.name ?? 'Unknown',
    method: item.method,
    amountPaid: item.amountPaid,
    totalBookingPrice: item.booking?.totalPrice ?? 0,
    status: item.status,
    proofUrl: item.proofUrl ?? null,
    verifiedAt: item.verifiedAt ? new Date(item.verifiedAt).toISOString().split('T')[0] : null,
    verifierName: item.verifier?.name ?? null,
    paidAt: item.paidAt ? new Date(item.paidAt).toISOString().split('T')[0] : null,
    notes: item.notes ?? null,
    createdAt: new Date(item.createdAt).toISOString().split('T')[0],
  };
}

export function validatePaymentForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.bookingId?.trim()) errors.bookingId = 'Booking wajib dipilih';
  if (!data.method?.trim()) errors.method = 'Metode pembayaran wajib dipilih';
  if (!data.amountPaid?.trim()) errors.amountPaid = 'Jumlah pembayaran wajib diisi';
  if (isNaN(parseInt(data.amountPaid))) errors.amountPaid = 'Jumlah pembayaran harus angka';

  return errors;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
