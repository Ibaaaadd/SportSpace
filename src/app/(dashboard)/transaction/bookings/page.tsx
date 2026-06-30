'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search, Calendar, Clock, User, DollarSign } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import { Card, CardContent } from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { ToastProvider, useToast } from '../../../../components/ui/Toast';
import {
  normalizeBooking,
  formatPrice,
  formatDate,
  BOOKING_STATUS_BADGE,
  PAYMENT_STATUS_BADGE,
  type BookingItem,
} from './_data';

function BookingsContent() {
  const router = useRouter();
  const { push } = useToast();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 9,
  });
  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CHECKED_IN', label: 'Checked In' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pagination.limit.toString(),
        });
        if (debouncedSearch.trim()) {
          params.set('search', debouncedSearch.trim());
        }
        if (statusFilter) {
          params.set('status', statusFilter);
        }

        const bookingsRes = await fetch(`/api/bookings?${params}`);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data.data?.map(normalizeBooking) || []);
          if (data.pagination) {
            setPagination({
              total: data.pagination.total,
              totalPages: data.pagination.totalPages,
              limit: data.pagination.limit,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        push({ title: 'Gagal mengambil data', variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pagination.limit, debouncedSearch, statusFilter, push]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

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
        setBookings((prev) => 
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
        );
        push({ title: 'Booking berhasil dibatalkan', variant: 'success' });
      } else {
        const error = await res.json();
        push({ title: error.error || 'Gagal membatalkan booking', variant: 'error' });
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      push({ title: 'Gagal membatalkan booking', variant: 'error' });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Manajemen Booking</h1>
            <p className="text-sm text-text-muted">Kelola transaksi booking lapangan</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Booking Baru
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Cari kode booking, user, atau lapangan..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(e.target.value)}
                options={statusOptions}
                placeholder="Semua Status"
              />
            </div>

            {loading ? (
              <div className="py-12 text-center text-text-muted">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="py-12 text-center text-text-muted">Tidak ada data booking</div>
            ) : (
              <>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {bookings.map((booking) => {
                    const bookingBadge = BOOKING_STATUS_BADGE[booking.status];
                    const paymentBadge = booking.paymentStatus ? PAYMENT_STATUS_BADGE[booking.paymentStatus] : null;

                    return (
                      <div
                        key={booking.id}
                        className="rounded-xl border border-border/70 bg-surface/60 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_28px_rgba(0,0,0,0.2)] transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-mono text-xs font-semibold text-text-muted">{booking.bookingCode}</p>
                              <p className="text-sm font-semibold text-text-primary mt-1">{booking.venueName}</p>
                            </div>
                            <Badge className={bookingBadge.color}>{bookingBadge.label}</Badge>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                              <User className="h-3.5 w-3.5" />
                              <span>{booking.userName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(booking.bookingDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{booking.startTime} - {booking.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                              <DollarSign className="h-3.5 w-3.5" />
                              <span className="font-semibold text-accent">{formatPrice(booking.totalPrice)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                            <div className="flex gap-1">
                              {paymentBadge && (
                                <Badge className={paymentBadge.color}>{paymentBadge.label}</Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(booking.id, booking.bookingCode)}
                              disabled={booking.status === 'CANCELLED'}
                              className="h-7 px-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-8 w-8 text-xs font-medium rounded transition ${
                              currentPage === pageNum
                                ? 'bg-primary text-surface'
                                : 'border border-border text-text-primary hover:border-primary'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}

                <div className="text-center text-xs text-text-muted pt-2">
                  Showing {bookings.length} of {pagination.total} bookings (Page {currentPage} of {pagination.totalPages})
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
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
