'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, DollarSign, Clock } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { ToastProvider, useToast } from '../../../components/ui/Toast';
import { createToastHelpers } from '../../../lib/toast-helpers';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

type BookingItem = {
  id: string;
  bookingCode: string;
  venueName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  latestPayment: {
    status: PaymentStatus;
    method: string;
  } | null;
};

const STATUS_BADGE: Record<BookingStatus, { color: string; label: string }> = {
  PENDING: { color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400', label: 'Pending' },
  CONFIRMED: { color: 'border-green-500/40 bg-green-500/10 text-green-400', label: 'Confirmed' },
  CHECKED_IN: { color: 'border-blue-500/40 bg-blue-500/10 text-blue-400', label: 'Checked In' },
  COMPLETED: { color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400', label: 'Completed' },
  CANCELLED: { color: 'border-red-500/40 bg-red-500/10 text-red-400', label: 'Cancelled' },
  EXPIRED: { color: 'border-gray-500/40 bg-gray-500/10 text-gray-400', label: 'Expired' },
};

const PAYMENT_STATUS_BADGE: Record<PaymentStatus, { color: string; label: string }> = {
  PENDING: { color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400', label: 'Menunggu' },
  VERIFIED: { color: 'border-green-500/40 bg-green-500/10 text-green-400', label: 'Terverifikasi' },
  REJECTED: { color: 'border-red-500/40 bg-red-500/10 text-red-400', label: 'Ditolak' },
};

function MyBookingsContent() {
  const toastContext = useToast();
  const t = createToastHelpers(toastContext);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const data = await res.json();
          const normalized = (data.data || []).map((b: any) => ({
            id: b.id,
            bookingCode: b.bookingCode,
            venueName: b.venue?.name || 'Unknown',
            bookingDate: new Date(b.bookingDate).toLocaleDateString('id-ID'),
            startTime: b.startTime,
            endTime: b.endTime,
            totalPrice: b.totalPrice,
            status: b.status,
            latestPayment: b.payments?.[0]
              ? {
                  status: b.payments[0].status,
                  method: b.payments[0].method,
                }
              : null,
          }));
          setBookings(normalized);
        } else {
          t.error('Gagal memuat data booking');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        t.error('Gagal memuat data booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toastContext]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-text-muted mb-4">Belum ada booking</p>
          <Button onClick={() => window.location.href = '/venues'}>
            Booking Sekarang
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const statusBadge = STATUS_BADGE[booking.status];
        const paymentBadge = booking.latestPayment
          ? PAYMENT_STATUS_BADGE[booking.latestPayment.status]
          : null;

        return (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-semibold text-sm">{booking.bookingCode}</p>
                    <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                    {paymentBadge && (
                      <Badge className={paymentBadge.color}>{paymentBadge.label}</Badge>
                    )}
                  </div>

                  <p className="font-medium">{booking.venueName}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar className="h-4 w-4" />
                      <span>{booking.bookingDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Clock className="h-4 w-4" />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatPrice(booking.totalPrice)}</span>
                  </div>
                </div>

                {booking.status === 'PENDING' && !booking.latestPayment && (
                  <Button
                    size="sm"
                    onClick={() => window.location.href = `/booking/checkout?bookingId=${booking.id}`}
                  >
                    Bayar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <ToastProvider>
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">My Bookings</h2>
          <p className="text-sm text-text-muted">
            Daftar booking dan status pembayaran kamu
          </p>
        </div>
        <MyBookingsContent />
      </section>
    </ToastProvider>
  );
}
