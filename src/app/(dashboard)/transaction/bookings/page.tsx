'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // Status options
  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CHECKED_IN', label: 'Checked In' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  // User options
  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));
  // Venue options
  const venueOptions = venues.map((v) => ({ value: v.id, label: v.name }));

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, usersRes, venuesRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/users'),
          fetch('/api/venues'),
        ]);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data.data?.map(normalizeBooking) || []);
        }

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data || []);
        }

        if (venuesRes.ok) {
          const data = await venuesRes.json();
          setVenues(data || []);
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

  // Filter bookings
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

  // Handle create
  const handleCreate = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setIsModalOpen(true);
  }, []);

  // Handle submit
  const handleSubmit = async () => {
    const newErrors = validateBookingForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        userId: form.userId,
        venueId: form.venueId,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        totalPrice: parseInt(form.totalPrice),
        notes: form.notes || undefined,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        setBookings((prev) => [normalizeBooking(result.data), ...prev]);
        toast.success('Booking berhasil dibuat');
        setIsModalOpen(false);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Gagal membuat booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Gagal membuat booking');
    }
  };

  // Handle cancel booking
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
      header: 'Kode Booking',
      accessor: 'bookingCode',
      cell: (value) => <span className="font-mono text-sm font-semibold">{value}</span>,
    },
    {
      header: 'User',
      accessor: 'userName',
    },
    {
      header: 'Lapangan',
      accessor: 'venueName',
    },
    {
      header: 'Tanggal',
      accessor: 'bookingDate',
      cell: (value) => formatDate(value),
    },
    {
      header: 'Jam',
      accessor: 'startTime',
      cell: (value, row) => `${value} - ${row.endTime}`,
    },
    {
      header: 'Harga',
      accessor: 'totalPrice',
      cell: (value) => formatPrice(value),
    },
    {
      header: 'Status Booking',
      accessor: 'status',
      cell: (value) => {
        const badge = BOOKING_STATUS_BADGE[value];
        return <Badge className={badge.color}>{badge.label}</Badge>;
      },
    },
    {
      header: 'Status Bayar',
      accessor: 'paymentStatus',
      cell: (value) => {
        if (!value) return <span className="text-xs text-text-muted">-</span>;
        const badge = PAYMENT_STATUS_BADGE[value];
        return <Badge className={badge.color}>{badge.label}</Badge>;
      },
    },
    {
      header: 'Action',
      accessor: 'id',
      cell: (id, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCancel(id, row.bookingCode)}
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

      {/* Modal Create Booking */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Booking Baru"
        onConfirm={handleSubmit}
        confirmText="Buat Booking"
      >
        <div className="space-y-4">
          <div>
            <Select
              label="User"
              value={form.userId}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, userId: e.target.value }));
                setErrors((prev) => ({ ...prev, userId: '' }));
              }}
              options={userOptions}
              placeholder="- Pilih User -"
              error={errors.userId}
            />
          </div>

          <div>
            <Select
              label="Lapangan"
              value={form.venueId}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, venueId: e.target.value }));
                setErrors((prev) => ({ ...prev, venueId: '' }));
              }}
              options={venueOptions}
              placeholder="- Pilih Lapangan -"
              error={errors.venueId}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <Input
                type="date"
                value={form.bookingDate}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, bookingDate: e.target.value }));
                  setErrors((prev) => ({ ...prev, bookingDate: '' }));
                }}
              />
              {errors.bookingDate && <p className="text-xs text-red-500 mt-1">{errors.bookingDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Harga (Rp)</label>
              <Input
                type="number"
                value={form.totalPrice}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, totalPrice: e.target.value }));
                  setErrors((prev) => ({ ...prev, totalPrice: '' }));
                }}
              />
              {errors.totalPrice && <p className="text-xs text-red-500 mt-1">{errors.totalPrice}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jam Mulai</label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, startTime: e.target.value }));
                  setErrors((prev) => ({ ...prev, startTime: '' }));
                }}
              />
              {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Jam Selesai</label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, endTime: e.target.value }));
                  setErrors((prev) => ({ ...prev, endTime: '' }));
                }}
              />
              {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catatan (Optional)</label>
            <Input
              as="textarea"
              placeholder="Catatan booking..."
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

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
