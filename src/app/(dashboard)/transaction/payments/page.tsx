// @ts-nocheck
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, X, Search, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/Card';
import DataTable, { type Column } from '../../../../components/ui/DataTable';
import Input from '../../../../components/ui/Input';
import Modal from '../../../../components/ui/Modal';
import Select from '../../../../components/ui/Select';
import { ToastProvider, useToast } from '../../../../components/ui/Toast';
import {
  normalizePayment,
  formatPrice,
  formatDate,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_BADGE,
  type PaymentItem,
} from './_data';

function PaymentsContent() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  // Payment status options
  const paymentStatusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'REJECTED', label: 'Rejected' },
  ];
  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/payments?status=${statusFilter || ''}`);

        if (res.ok) {
          const data = await res.json();
          setPayments(data.data?.map(normalizePayment) || []);
        } else {
          toast.error('Gagal mengambil data pembayaran');
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Gagal mengambil data pembayaran');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [statusFilter, toast]);

  // Filter payments
  const filtered = useMemo(() => {
    let result = payments;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.bookingCode.toLowerCase().includes(q) ||
          p.userName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [payments, search]);

  // Show detail modal
  const handleShowDetail = useCallback((payment: PaymentItem) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  }, []);

  const handleShowActionModal = useCallback((payment: PaymentItem, type: 'verify' | 'reject') => {
    setSelectedPayment(payment);
    setActionType(type);
    setRejectReason('');
    setIsActionModalOpen(true);
  }, []);

  const handleVerify = async () => {
    if (!selectedPayment) return;

    try {
      setProcessingId(selectedPayment.id);
      const res = await fetch(`/api/payments/${selectedPayment.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifiedBy: 'current-user-id', // TODO: Get from session
        }),
      });

      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === selectedPayment.id
              ? { ...p, status: 'VERIFIED' }
              : p
          )
        );
        toast.success('Pembayaran berhasil diverifikasi');
        setIsActionModalOpen(false);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Gagal memverifikasi pembayaran');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Gagal memverifikasi pembayaran');
    } finally {
      setProcessingId(null);
    }
  };

  // Reject payment
  const handleReject = async () => {
    if (!selectedPayment) return;

    try {
      setProcessingId(selectedPayment.id);
      const res = await fetch(`/api/payments/${selectedPayment.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifiedBy: 'current-user-id', // TODO: Get from session
          reason: rejectReason || 'Bukti pembayaran tidak valid',
        }),
      });

      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === selectedPayment.id
              ? { ...p, status: 'REJECTED' }
              : p
          )
        );
        toast.success('Pembayaran berhasil ditolak');
        setIsActionModalOpen(false);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Gagal menolak pembayaran');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Gagal menolak pembayaran');
    } finally {
      setProcessingId(null);
    }
  };

  // Columns
  const columns: Column<PaymentItem>[] = [
    {
      key: 'bookingCode',
      header: 'Booking',
      render: (row) => <span className="font-mono text-sm font-semibold">{row.bookingCode}</span>,
    },
    {
      key: 'userName',
      header: 'User',
      render: (row) => row.userName,
    },
    {
      key: 'method',
      header: 'Metode',
      render: (row) => PAYMENT_METHOD_LABEL[row.method],
    },
    {
      key: 'amountPaid',
      header: 'Jumlah',
      render: (row) => formatPrice(row.amountPaid),
    },
    {
      key: 'totalBookingPrice',
      header: 'Total Booking',
      render: (row) => formatPrice(row.totalBookingPrice),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const badge = PAYMENT_STATUS_BADGE[row.status];
        return <Badge className={badge.color}>{badge.label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Tanggal',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'id',
      header: 'Action',
      render: (row) => (
        <div className="flex gap-2">
          <Link
            href={`/transaction/payments/${row.id}`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-7 px-2"
            title="Detail"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
          {row.proofUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShowDetail(row)}
              title="Lihat bukti"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {row.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                className="bg-green-600/20 text-green-400 hover:bg-green-600/30"
                onClick={() => handleShowActionModal(row, 'verify')}
                title="Verifikasi"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="bg-red-600/20 text-red-400 hover:bg-red-600/30"
                onClick={() => handleShowActionModal(row, 'reject')}
                title="Tolak"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Verifikasi Pembayaran</CardTitle>
            <CardDescription>Verifikasi atau tolak bukti pembayaran dari pelanggan</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cari kode booking atau user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={paymentStatusOptions}
              placeholder="Semua Status"
            />
          </div>

          {loading ? (
            <div className="py-8 text-center text-text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-text-muted">Tidak ada data pembayaran</div>
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </CardContent>
      </Card>

      {/* Detail Modal - Show Proof */}
      {selectedPayment && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Bukti Pembayaran - ${selectedPayment.bookingCode}`}
          hideConfirm
          closeText="Tutup"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted">Booking Code</p>
                <p className="font-mono font-semibold">{selectedPayment.bookingCode}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">User</p>
                <p className="font-semibold">{selectedPayment.userName}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Metode</p>
                <p className="font-semibold">{PAYMENT_METHOD_LABEL[selectedPayment.method]}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Jumlah</p>
                <p className="font-semibold">{formatPrice(selectedPayment.amountPaid)}</p>
              </div>
            </div>

            {selectedPayment.proofUrl && (
              <div>
                <p className="text-xs text-text-muted mb-2">Bukti Transfer</p>
                <img
                  src={selectedPayment.proofUrl}
                  alt="Bukti pembayaran"
                  className="w-full rounded border border-border max-h-96 object-contain"
                />
              </div>
            )}

            {selectedPayment.notes && (
              <div>
                <p className="text-xs text-text-muted">Catatan</p>
                <p className="text-sm">{selectedPayment.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Action Modal - Verify or Reject */}
      {selectedPayment && (
        <Modal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          title={actionType === 'verify' ? 'Verifikasi Pembayaran' : 'Tolak Pembayaran'}
          onConfirm={actionType === 'verify' ? handleVerify : handleReject}
          confirmText={actionType === 'verify' ? 'Verifikasi' : 'Tolak'}
          isLoading={processingId === selectedPayment.id}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-surface rounded border border-border">
              <div>
                <p className="text-xs text-text-muted">Booking</p>
                <p className="font-mono font-semibold">{selectedPayment.bookingCode}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Jumlah</p>
                <p className="font-semibold">{formatPrice(selectedPayment.amountPaid)}</p>
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

export default function PaymentsPage() {
  return (
    <ToastProvider>
      <section className="space-y-4">
        <PaymentsContent />
      </section>
    </ToastProvider>
  );
}
