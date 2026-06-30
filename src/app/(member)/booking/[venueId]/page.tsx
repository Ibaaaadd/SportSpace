'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { ToastProvider, useToast } from '../../../../components/ui/Toast';
import { createToastHelpers } from '../../../../components/ui/Toast';

type VenueDetail = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  sportType: string;
};

type TimeSlot = {
  startTime: string;
  endTime: string;
  pricePerHour: number;
};

function BookingDetailContent() {
  const router = useRouter();
  const params = useParams();
  const toastContext = useToast();
  const t = createToastHelpers(toastContext);
  const venueId = params.venueId as string;

  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await fetch(`/api/venues/${venueId}`);
        if (res.ok) {
          const data = await res.json();
          setVenue({
            id: data.data.id,
            name: data.data.name,
            location: data.data.location,
            capacity: data.data.capacity,
            sportType: data.data.sportType?.name || 'Unknown',
          });
        } else {
          t.error('Venue tidak ditemukan');
          router.push('/venues');
        }
      } catch (error) {
        console.error('Error fetching venue:', error);
        t.error('Gagal memuat data venue');
        router.push('/venues');
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      fetchVenue();
    }
  }, [venueId, router, toastContext]);

  const handleBookingDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setBookingDate(date);
    setTimeSlot(null);
    setTimeSlots([]);

    if (!date || !venueId) return;

    try {
      const res = await fetch(`/api/venues/${venueId}/pricing?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setTimeSlots(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      t.error('Gagal memuat slot waktu');
    }
  };

  const handleSubmit = async () => {
    if (!bookingDate || !timeSlot || !venue) {
      t.error('Semua field wajib diisi');
      return;
    }

    try {
      setSubmitting(true);

      const totalPrice = timeSlot.pricePerHour;
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id',
          venueId: venue.id,
          bookingDate: new Date(bookingDate).toISOString(),
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          totalPrice,
          notes: notes.trim() || null,
        }),
      });

      if (bookingRes.ok) {
        const bookingData = await bookingRes.json();
        const bookingId = bookingData.data.id;

        const slotLockRes = await fetch('/api/slot-locks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            userId: 'current-user-id',
            venueId: venue.id,
            bookingDate: new Date(bookingDate).toISOString(),
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
          }),
        });

        if (slotLockRes.ok) {
          t.success('Booking berhasil dibuat. Arahkan ke pembayaran...');
          router.push(`/booking/checkout?bookingId=${bookingId}`);
        } else {
          t.error('Gagal mengunci slot waktu');
        }
      } else {
        const error = await bookingRes.json();
        t.error(error.error || 'Gagal membuat booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      t.error('Gagal membuat booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!venue) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{venue.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-text-muted">
            <MapPin className="h-4 w-4" />
            <span>{venue.location}</span>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-text-muted text-xs">Tipe Olahraga</p>
              <p className="font-medium">{venue.sportType}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Kapasitas</p>
              <p className="font-medium">{venue.capacity} orang</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tanggal Booking <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              value={bookingDate}
              onChange={handleBookingDateChange}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>

          {timeSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Pilih Waktu <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    onClick={() => setTimeSlot(slot)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                      timeSlot?.startTime === slot.startTime
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">
                        Rp{slot.pricePerHour.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

           <div>
             <label className="block text-sm font-medium mb-2">Catatan (Optional)</label>
             <Input
               as="textarea"
               placeholder="Catatan tambahan untuk booking ini..."
               value={notes}
               onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
               rows={3}
             />
           </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !bookingDate || !timeSlot}
            className="w-full"
            size="lg"
          >
            {submitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <ToastProvider>
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Booking Venue</h2>
          <p className="text-sm text-text-muted">Pilih tanggal dan jam untuk booking</p>
        </div>
        <BookingDetailContent />
      </section>
    </ToastProvider>
  );
}
