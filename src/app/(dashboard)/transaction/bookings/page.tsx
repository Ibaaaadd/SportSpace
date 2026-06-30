// @ts-nocheck
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
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
  EMPTY_FORM,
  normalizeBooking,
  formatPrice,
  formatDate,
  validateBookingForm,
  BOOKING_STATUS_BADGE,
  PAYMENT_STATUS_BADGE,
  type BookingItem,
  type FormData,
  type FormErrors,
} from './_data';

type UserOption = { id: string; name: string };
type VenueOption = { id: string; name: string };

function BookingsContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CHECKED_IN', label: 'Checked In' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const bookingsRes = await fetch('/api/bookings');

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data.data?.map(normalizeBooking) || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  const filtered = useMemo(() => {
    let result = bookings;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(q) ||
          b.userName.toLowerCase().includes(q) ||
          b.venueName.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    return result;
  }, [bookings, search, statusFilter]);

  const handleCreate = useCallback(() => {
    router.push('/transaction/bookings/create');
  }, [router]);

  const handleCancel = async (bookingId: string, bookingCode: string) => {
    if (!window.confirm(`Batalkan booking ${bookingCode}?`)) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Dibatalkan oleh admin' }),
      });

      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)));
        toast.success('Booking berhasil dibatalkan');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Gagal membatalkan booking');
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error('Gagal membatalkan booking');
    }
  };

  // Columns
  const columns: Column<BookingItem>[] = [
    {
      key: 'bookingCode',
      header: 'Kode Booking',
      render: (row) => <span className="font-mono text-sm font-semibold">{row.bookingCode}</span>,
    },
    {
      key: 'userName',
      header: 'User',
      render: (row) => row.userName,
    },
    {
      key: 'venueName',
      header: 'Lapangan',
      render: (row) => row.venueName,
    },
    {
      key: 'bookingDate',
      header: 'Tanggal',
      render: (row) => formatDate(row.bookingDate),
    },
    {
      key: 'startTime',
      header: 'Jam',
      render: (row) => `${row.startTime} - ${row.endTime}`,
    },
    {
      key: 'totalPrice',
      header: 'Harga',
      render: (row) => formatPrice(row.totalPrice),
    },
    {
      key: 'status',
      header: 'Status Booking',
      render: (row) => {
        const badge = BOOKING_STATUS_BADGE[row.status];
        return <Badge className={badge.color}>{badge.label}</Badge>;
      },
    },
    {
      key: 'paymentStatus',
      header: 'Status Bayar',
      render: (row) => {
        if (!row.paymentStatus) return <span className="text-xs text-text-muted">-</span>;
        const badge = PAYMENT_STATUS_BADGE[row.paymentStatus];
        return <Badge className={badge.color}>{badge.label}</Badge>;
      },
    },
    {
      key: 'id',
      header: 'Action',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCancel(row.id, row.bookingCode)}
            disabled={row.status === 'CANCELLED'}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Manajemen Booking</CardTitle>
              <CardDescription>Kelola transaksi booking lapangan</CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Booking Baru
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cari kode booking, user, atau lapangan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              placeholder="Semua Status"
            />
          </div>

          {loading ? (
            <div className="py-8 text-center text-text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-text-muted">Tidak ada data booking</div>
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function BookingsAdminPage() {
  return (
    <ToastProvider>
      <section className="space-y-4">
        <BookingsContent />
      </section>
    </ToastProvider>
  );
}
