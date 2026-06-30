'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, AlertCircle, CreditCard } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import { ToastProvider, useToast } from '../../../../components/ui/Toast';
import { createToastHelpers } from '../../../../lib/toast-helpers';

type BookingDetail = {
  id: string;
  bookingCode: string;
  venueName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  latestPayment: {
    id: string;
    status: string;
    method: string;
    amountPaid: number;
    proofUrl: string | null;
  } | null;
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastContext = useToast();
  const t = createToastHelpers(toastContext);
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'TRANSFER' | 'QRIS' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!bookingId) {
      t.error('Booking ID tidak ditemukan');
      router.push('/my-bookings');
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          const b = data.data;
          setBooking({
            id: b.id,
            bookingCode: b.bookingCode,
            venueName: b.venue?.name || 'Unknown',
            bookingDate: new Date(b.bookingDate).toLocaleDateString('id-ID'),
            startTime: b.startTime,
            endTime: b.endTime,
            totalPrice: b.totalPrice,
            status: b.status,
            latestPayment: b.payments?.[0] || null,
          });
        } else {
          t.error('Gagal memuat data booking');
          router.push('/my-bookings');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        t.error('Gagal memuat data booking');
        router.push('/my-bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router, toastContext]);

  const handleTimeout = async () => {
    if (!bookingId) return;

    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      t.error('Waktu pembayaran habis. Booking dibatalkan.');
      router.push('/venues');
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  useEffect(() => {
    if (!booking || booking.status !== 'PENDING' || booking.latestPayment) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [booking, handleTimeout]);

  const handlePaymentSubmit = async () => {
    if (!selectedMethod || !booking) return;

    if (selectedMethod === 'TRANSFER' && !proofUrl.trim()) {
      t.error('Upload bukti transfer terlebih dahulu');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          method: selectedMethod,
          amountPaid: booking.totalPrice,
          proofUrl: selectedMethod === 'TRANSFER' ? proofUrl : null,
          notes: notes.trim() || null,
        }),
      });

      if (res.ok) {
        t.success('Pembayaran berhasil dikonfirmasi. Menunggu verifikasi admin.');
        setBooking((prev) => prev ? { ...prev, latestPayment: { id: 'temp', status: 'PENDING', method: selectedMethod, amountPaid: booking.totalPrice, proofUrl } } : null);
        setShowPaymentForm(false);
       } else {
         const error = await res.json();
         t.error(error.error || 'Gagal konfirmasi pembayaran');
       }
     } catch (error) {
       console.error('Error submitting payment:', error);
       t.error('Gagal konfirmasi pembayaran');
     } finally {
       setSubmitting(false);
     }
   };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  if (!booking) {
    return null;
  }

  const paymentStatus = booking.latestPayment?.status || null;
  const hasPayment = !!booking.latestPayment;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {booking.status === 'PENDING' && !hasPayment && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          timeLeft < 60 ? 'border-red-500/40 bg-red-500/10' : 'border-yellow-500/40 bg-yellow-500/10'
        }`}>
          <Clock className={`h-5 w-5 ${timeLeft < 60 ? 'text-red-400' : 'text-yellow-400'}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">Selesaikan pembayaran dalam</p>
            <p className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-yellow-400'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
          {timeLeft < 60 && <AlertCircle className="h-5 w-5 text-red-400" />}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detail Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted">Kode Booking</p>
              <p className="font-mono font-semibold">{booking.bookingCode}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Venue</p>
              <p className="font-semibold">{booking.venueName}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Tanggal</p>
              <p className="font-semibold">{booking.bookingDate}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Waktu</p>
              <p className="font-semibold">{booking.startTime} - {booking.endTime}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between items-center">
              <p className="text-text-muted">Total Pembayaran</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(booking.totalPrice)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasPayment && (
        <Card>
          <CardHeader>
            <CardTitle>Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">Metode</p>
              <p className="font-semibold">{booking.latestPayment?.method === 'TRANSFER' ? 'Transfer Manual' : 'QRIS'}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">Jumlah</p>
              <p className="font-semibold">{formatPrice(booking.latestPayment?.amountPaid || 0)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">Status</p>
              <Badge className={
                paymentStatus === 'VERIFIED' ? 'border-green-500/40 bg-green-500/10 text-green-400' :
                paymentStatus === 'REJECTED' ? 'border-red-500/40 bg-red-500/10 text-red-400' :
                'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
              }>
                {paymentStatus === 'VERIFIED' ? 'Terverifikasi' : paymentStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu Verifikasi'}
              </Badge>
            </div>
            {booking.latestPayment?.proofUrl && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-text-muted mb-2">Bukti Pembayaran</p>
                <img src={booking.latestPayment.proofUrl} alt="Bukti" className="w-full rounded max-h-60 object-contain" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!hasPayment && (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPaymentForm ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedMethod('TRANSFER');
                    setShowPaymentForm(true);
                  }}
                  className="w-full p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all text-left space-y-2"
                >
                  <p className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Transfer Manual
                  </p>
                  <p className="text-sm text-text-muted">Upload bukti transfer bank</p>
                </button>

                <button
                  disabled
                  className="w-full p-4 rounded-lg border-2 border-border/50 opacity-50 text-left space-y-2 cursor-not-allowed"
                >
                  <p className="font-semibold flex items-center gap-2 text-text-muted">
                    <CreditCard className="h-4 w-4" />
                    QRIS
                  </p>
                  <p className="text-sm text-text-muted">Coming Soon</p>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-surface/50 border border-border">
                  <p className="text-sm text-text-muted">Metode: Transfer Manual</p>
                  <p className="text-xs text-text-muted mt-1">Bank BCA: 1234567890 a.n. SprotSpace</p>
                </div>

                <Input
                  label="URL Bukti Transfer"
                  placeholder="https://example.com/bukti.jpg"
                  value={proofUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProofUrl(e.target.value)}
                />

                <Input
                  as="textarea"
                  label="Catatan (Optional)"
                  placeholder="Catatan tambahan..."
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  rows={2}
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowPaymentForm(false);
                      setSelectedMethod(null);
                      setProofUrl('');
                      setNotes('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Kembali
                  </Button>
                  <Button
                    onClick={handlePaymentSubmit}
                    disabled={submitting || !proofUrl.trim()}
                    className="flex-1"
                  >
                    {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ToastProvider>
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Checkout</h2>
          <p className="text-sm text-text-muted">
            Selesaikan pembayaran sebelum waktu habis
          </p>
        </div>
        <CheckoutContent />
      </section>
    </ToastProvider>
  );
}
