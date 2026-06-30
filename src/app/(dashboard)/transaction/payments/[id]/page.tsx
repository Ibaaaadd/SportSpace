'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import Link from 'next/link';
import Badge from '../../../../../components/ui/Badge';
import Button from '../../../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/Card';
import Modal from '../../../../../components/ui/Modal';
import Input from '../../../../../components/ui/Input';
import { ToastProvider, useToast } from '../../../../../components/ui/Toast';
import {
  formatPrice,
  formatDate,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_BADGE,
  type PaymentItem,
} from '../_data';
import {
  BOOKING_STATUS_BADGE,
} from '../../bookings/_data';

interface DetailPaymentItem extends PaymentItem {
  booking?: {
    id: string;
    bookingCode: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: string;
    notes: string | null;
    user?: {
      id: string;
      name: string;
      email: string;
    };
    venue?: {
      id: string;
      name: string;
    };
  };
  verifier?: {
    id: string;
    name: string;
  } | null;
}

function PaymentDetailContent({ paymentId }: { paymentId: string }) {
  const toastContext = useToast();
  const [payment, setPayment] = useState<DetailPaymentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/payments/${paymentId}`);

        if (res.ok) {
          const data = await res.json();
          setPayment(data.data);
        } else {
          toastContext.push({ title: 'Gagal mengambil data pembayaran', variant: 'error' });
        }
      } catch (error) {
        console.error('Error fetching payment:', error);
        toastContext.push({ title: 'Gagal mengambil data pembayaran', variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId, toastContext]);

  const handleShowActionModal = (type: 'verify' | 'reject') => {
    setActionType(type);
    setRejectReason('');
    setIsActionModalOpen(true);
  };

  const handleVerify = async () => {
    if (!payment) return;

    try {
      setProcessingId(payment.id);
      const res = await fetch(`/api/payments/${payment.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifiedBy: 'current-user-id',
        }),
      });

      if (res.ok) {
        toastContext.push({ title: 'Pembayaran berhasil diverifikasi', variant: 'success' });
        setIsActionModalOpen(false);
        setTimeout(() => window.location.href = '/transaction/payments', 1000);
      } else {
        const error = await res.json();
        toastContext.push({ title: error.error || 'Gagal memverifikasi pembayaran', variant: 'error' });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toastContext.push({ title: 'Gagal memverifikasi pembayaran', variant: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!payment) return;

    try {
      setProcessingId(payment.id);
      const res = await fetch(`/api/payments/${payment.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifiedBy: 'current-user-id',
          reason: rejectReason || 'Bukti pembayaran tidak valid',
        }),
      });

      if (res.ok) {
        toastContext.push({ title: 'Pembayaran berhasil ditolak', variant: 'success' });
        setIsActionModalOpen(false);
        setTimeout(() => window.location.href = '/transaction/payments', 1000);
      } else {
        const error = await res.json();
        toastContext.push({ title: error.error || 'Gagal menolak pembayaran', variant: 'error' });
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toastContext.push({ title: 'Gagal menolak pembayaran', variant: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-text-muted">Loading...</div>
    );
  }

  if (!payment) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-text-muted">
          Pembayaran tidak ditemukan
        </CardContent>
      </Card>
    );
  }

  const bookingStatusBadge = payment.booking?.status 
    ? BOOKING_STATUS_BADGE[payment.booking.status as keyof typeof BOOKING_STATUS_BADGE]
    : { color: 'border-gray-500/40 bg-gray-500/10 text-gray-400', label: 'Unknown' };
  const paymentStatusBadge = PAYMENT_STATUS_BADGE[payment.status];

  return (
    <>
      <div className="space-y-4">
        <Link
          href="/transaction/payments"
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pembayaran
        </Link>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 border-b border-accent/30 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-3">Kode Booking</p>
                <p className="font-mono text-4xl font-bold text-accent tracking-wider">{payment.bookingCode}</p>
              </div>
              <Badge className={`${paymentStatusBadge.color} text-base px-4 py-2`}>
                {paymentStatusBadge.label}
              </Badge>
            </div>
          </div>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/30">
                <p className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wide">Metode</p>
                <p className="text-lg font-bold text-text-primary">{PAYMENT_METHOD_LABEL[payment.method]}</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/15 to-purple-500/5 border border-purple-500/30">
                <p className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wide">Tanggal</p>
                <p className="text-lg font-bold text-text-primary">{payment.createdAt ? formatDate(payment.createdAt.split('T')[0]) : '-'}</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-500/30">
                <p className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wide">Status</p>
                <p className="text-lg font-bold text-cyan-400">{paymentStatusBadge.label}</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-accent/25 to-accent/10 border-2 border-accent/40 shadow-lg">
              <p className="text-sm text-accent font-semibold uppercase tracking-widest mb-3">Jumlah Pembayaran</p>
              <p className="text-5xl font-black text-accent">{formatPrice(payment.amountPaid)}</p>
              <div className="mt-4 pt-4 border-t border-accent/30">
                <p className="text-xs text-text-muted">Dari booking {payment.booking?.venue?.name || 'N/A'}</p>
              </div>
            </div>

            {payment.notes && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-blue-400 font-semibold mb-2 uppercase tracking-wide">Catatan</p>
                <p className="text-sm text-text-primary">{payment.notes}</p>
              </div>
            )}

            {payment.proofUrl && (
              <div className="space-y-2">
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wide">Bukti Transfer</p>
                <div className="rounded-xl overflow-hidden border-2 border-border/50 bg-surface p-3 shadow-md">
                  <img
                    src={payment.proofUrl}
                    alt="Bukti pembayaran"
                    className="w-full rounded-lg max-h-80 object-contain"
                  />
                </div>
              </div>
            )}

            {payment.status === 'VERIFIED' && payment.verifier && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/15 to-green-500/5 border border-green-500/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-green-400 font-semibold mb-1 uppercase tracking-wide">Diverifikasi Oleh</p>
                    <p className="font-semibold text-green-300">{payment.verifier.name}</p>
                    {payment.verifiedAt && (
                      <p className="text-xs text-text-muted mt-2">{formatDate(payment.verifiedAt.split('T')[0])}</p>
                    )}
                  </div>
                  <div className="text-green-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {payment.booking && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Informasi Booking</CardTitle>
                <Badge className={bookingStatusBadge.color}>
                  {bookingStatusBadge.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-text-muted mb-1">Pelanggan</p>
                    <p className="font-semibold text-text-primary">{payment.booking.user?.name}</p>
                    <p className="text-sm text-text-muted">{payment.booking.user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-text-muted">Lapangan</p>
                  </div>
                  <p className="text-sm font-semibold">{payment.booking.venue?.name}</p>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-text-muted">Tanggal</p>
                  </div>
                  <p className="text-sm font-semibold">{payment.booking.bookingDate ? formatDate(payment.booking.bookingDate.split('T')[0]) : '-'}</p>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-text-muted">Mulai</p>
                  </div>
                  <p className="text-sm font-semibold">{payment.booking.startTime}</p>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-text-muted">Selesai</p>
                  </div>
                  <p className="text-sm font-semibold">{payment.booking.endTime}</p>
                </div>
              </div>

              {payment.booking.notes && (
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-xs text-purple-400 font-semibold mb-2 uppercase tracking-wide">Catatan Booking</p>
                  <p className="text-sm text-text-primary">{payment.booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {payment.status === 'PENDING' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShowActionModal('verify')}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-green-600/25 to-green-600/10 border border-green-500/50 p-4 text-left transition-all hover:shadow-lg hover:shadow-green-500/20 hover:border-green-400"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20 text-green-400 group-hover:bg-green-500/30 transition-colors">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-400 group-hover:text-green-300 transition-colors">Verifikasi</p>
                  <p className="text-xs text-text-muted">Setujui pembayaran ini</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleShowActionModal('reject')}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-red-600/25 to-red-600/10 border border-red-500/50 p-4 text-left transition-all hover:shadow-lg hover:shadow-red-500/20 hover:border-red-400"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 group-hover:bg-red-500/30 transition-colors">
                  <X className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-red-400 group-hover:text-red-300 transition-colors">Tolak</p>
                  <p className="text-xs text-text-muted">Tolak pembayaran ini</p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {payment && (
        <Modal
          open={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          title={actionType === 'verify' ? 'Verifikasi Pembayaran' : 'Tolak Pembayaran'}
          footer={
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="px-4 py-2 rounded border border-border hover:bg-surface transition-colors"
              >
                Batal
              </button>
              <button
                onClick={actionType === 'verify' ? handleVerify : handleReject}
                disabled={processingId === payment.id}
                className="px-4 py-2 rounded bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                {actionType === 'verify' ? 'Verifikasi' : 'Tolak'}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-surface rounded border border-border">
              <div>
                <p className="text-xs text-text-muted">Booking</p>
                <p className="font-mono font-semibold">{payment.bookingCode}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Jumlah</p>
                <p className="font-semibold">{formatPrice(payment.amountPaid)}</p>
              </div>
            </div>

            {actionType === 'reject' && (
              <div>
                <label className="block text-sm font-medium mb-2">Alasan Penolakan (Optional)</label>
                <Input
                  as="textarea"
                  placeholder="Misal: Bukti transfer tidak jelas, nominal tidak sesuai, dll"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {actionType === 'verify' && (
              <p className="text-sm text-text-muted">
                Pastikan bukti pembayaran sudah sesuai sebelum memverifikasi. Status booking akan berubah menjadi CONFIRMED.
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [paymentId, setPaymentId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => setPaymentId(id));
  }, [params]);

  return (
    <ToastProvider>
      <section className="space-y-4">
        {paymentId && <PaymentDetailContent paymentId={paymentId} />}
      </section>
    </ToastProvider>
  );
}
