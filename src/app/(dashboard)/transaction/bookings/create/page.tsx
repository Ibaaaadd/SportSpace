'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import Button from '../../../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/Card';
import Input from '../../../../../components/ui/Input';
import Select from '../../../../../components/ui/Select';
import { ToastProvider, useToast } from '../../../../../components/ui/Toast';
import { formatPrice } from '../_data';

type UserOption = { id: string; name: string };
type VenueOption = { id: string; name: string };
type PricingOption = {
  id: string;
  label: string;
  dayType: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
};

type TimeSlot = {
  time: string;
  available: boolean;
};

type DayAvailability = {
  date: string;
  available: boolean;
  isToday: boolean;
  isSelected: boolean;
};

type FormData = {
  userId: string;
  venueId: string;
  pricingId: string;
  bookingDate: string;
  selectedTimes: string[];
  notes: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function CreateBookingContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [allPricings, setAllPricings] = useState<PricingOption[]>([]);
  const [pricings, setPricings] = useState<PricingOption[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<PricingOption | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendar, setCalendar] = useState<DayAvailability[]>([]);
  const [form, setForm] = useState<FormData>({
    userId: '',
    venueId: '',
    pricingId: '',
    bookingDate: '',
    selectedTimes: [],
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const getDayType = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6 ? 'weekend' : 'weekday';
  };

  const getDayTypeLabel = (dayType: string): string => {
    const labels: Record<string, string> = {
      weekday: 'Hari Kerja',
      weekend: 'Akhir Pekan',
      holiday: 'Hari Libur',
    };
    return labels[dayType] || dayType;
  };

  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startH] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);
    
    for (let h = startH; h < endH; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    
    return slots;
  };

  const fetchBookedTimes = async (venueId: string, bookingDate: string) => {
    try {
      const res = await fetch(`/api/bookings?venueId=${venueId}&bookingDate=${bookingDate}`);
      if (res.ok) {
        const data = await res.json();
        const booked: string[] = [];
        
        data.data?.forEach((booking: { status: string; startTime: string; endTime: string }) => {
          if (booking.status !== 'CANCELLED' && booking.status !== 'EXPIRED') {
            const [startH] = booking.startTime.split(':').map(Number);
            const [endH] = booking.endTime.split(':').map(Number);
            
            for (let h = startH; h < endH; h++) {
              booked.push(`${String(h).padStart(2, '0')}:00`);
            }
          }
        });
        
        setBookedTimes(booked);
      }
    } catch (error) {
      console.error('Error fetching booked times:', error);
    }
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, pricingRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/pricing'),
        ]);

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data || []);
        }

        if (pricingRes.ok) {
          const data = await pricingRes.json();
          setAllPricings(data);
          
          const uniqueVenues: VenueOption[] = [];
          const venueMap = new Map();
          
          data.forEach((pricing: { venueId: string; venueName: string }) => {
            if (!venueMap.has(pricing.venueId)) {
              venueMap.set(pricing.venueId, {
                id: pricing.venueId,
                name: pricing.venueName || 'Unknown',
              });
              uniqueVenues.push(venueMap.get(pricing.venueId));
            }
          });
          
          setVenues(uniqueVenues);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal mengambil data');
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    if (!form.venueId) {
      return;
    }
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const days: DayAvailability[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      
      days.push({
        date: dateStr,
        available: date >= today,
        isToday: date.getTime() === today.getTime(),
        isSelected: dateStr === form.bookingDate,
      });
    }

    setCalendar(days);
  }, [currentMonth, form.venueId, form.bookingDate]);

  const handlePricingChange = (pricingId: string) => {
    const pricing = pricings.find((p) => p.id === pricingId);
    setSelectedPricing(pricing || null);
    setForm((prev) => ({ ...prev, pricingId, selectedTimes: [] }));
    setErrors((prev) => ({ ...prev, pricingId: '' }));
    
    if (pricing) {
      const slots = generateTimeSlots(pricing.startTime, pricing.endTime);
      const timeSlotsWithAvailability = slots.map((time) => ({
        time,
        available: !bookedTimes.includes(time),
      }));
      setTimeSlots(timeSlotsWithAvailability);
    }
  };

  const handleVenueChange = (venueId: string) => {
    setForm((prev) => ({
      ...prev,
      venueId,
      pricingId: '',
      bookingDate: '',
      selectedTimes: [],
    }));
    setErrors((prev) => ({ ...prev, venueId: '' }));
    setSelectedPricing(null);
    setPricings([]);
    setTimeSlots([]);
    setCalendar([]);
    
    const filtered = allPricings.filter((p) => p.venueId === venueId);
    setPricings(filtered);
  };

  const handleDateSelect = (dateStr: string) => {
    setForm((prev) => ({ ...prev, bookingDate: dateStr, pricingId: '', selectedTimes: [] }));
    setErrors((prev) => ({ ...prev, bookingDate: '' }));
    setSelectedPricing(null);
    setTimeSlots([]);
    
    const dayType = getDayType(dateStr);
    const filtered = allPricings.filter((p) => p.venueId === form.venueId && p.dayType === dayType);
    setPricings(filtered);
  };

  const handleTimeSelect = (time: string) => {
    setForm((prev) => {
      const isSelected = prev.selectedTimes.includes(time);
      const newSelectedTimes = isSelected
        ? prev.selectedTimes.filter((t) => t !== time)
        : [...prev.selectedTimes, time].sort();
      
      return { ...prev, selectedTimes: newSelectedTimes };
    });
  };

  const calculateTotal = (): number => {
    if (!selectedPricing || form.selectedTimes.length === 0) return 0;
    return selectedPricing.pricePerHour * form.selectedTimes.length;
  };

  const calculateStartEndTime = (): { startTime: string; endTime: string } => {
    if (form.selectedTimes.length === 0) return { startTime: '', endTime: '' };
    
    const sortedTimes = [...form.selectedTimes].sort();
    const startTime = sortedTimes[0];
    const lastTime = sortedTimes[sortedTimes.length - 1];
    const [lastH] = lastTime.split(':').map(Number);
    const endTime = `${String(lastH + 1).padStart(2, '0')}:00`;
    
    return { startTime, endTime };
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.userId) newErrors.userId = 'User wajib dipilih';
    if (!form.venueId) newErrors.venueId = 'Lapangan wajib dipilih';
    if (!form.bookingDate) newErrors.bookingDate = 'Tanggal wajib diisi';
    if (!form.pricingId) newErrors.pricingId = 'Waktu main wajib dipilih';
    if (form.selectedTimes.length === 0) newErrors.selectedTimes = 'Pilih minimal 1 jam';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { startTime, endTime } = calculateStartEndTime();
      
      const payload = {
        userId: form.userId,
        venueId: form.venueId,
        bookingDate: form.bookingDate,
        startTime,
        endTime,
        totalPrice: calculateTotal(),
        notes: form.notes || undefined,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Booking berhasil dibuat');
        router.push('/transaction/bookings');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Gagal membuat booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Gagal membuat booking');
    } finally {
      setLoading(false);
    }
  };

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const pricingOptions = pricings.map((p) => ({
    value: p.id,
    label: `${p.label} (${p.startTime} - ${p.endTime})`,
  }));

  const selectedVenue = venues.find((v) => v.id === form.venueId);
  const totalPrice = calculateTotal();
  const { startTime, endTime } = calculateStartEndTime();
  const dayType = form.bookingDate ? getDayType(form.bookingDate) : '';

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (dateStr: string) => {
    setForm((prev) => ({ ...prev, bookingDate: dateStr, pricingId: '', selectedTimes: [] }));
    setErrors((prev) => ({ ...prev, bookingDate: '' }));
    setSelectedPricing(null);
    setTimeSlots([]);
    
    const dayType = getDayType(dateStr);
    const filtered = allPricings.filter((p) => p.venueId === form.venueId && p.dayType === dayType);
    setPricings(filtered);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-muted bg-clip-text text-transparent">
            Booking Baru
          </h1>
          <p className="text-sm text-text-muted mt-1">Buat booking lapangan untuk pelanggan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Booking</CardTitle>
              <CardDescription>Lengkapi data booking lapangan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Select
                  label="Pilih User"
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
                <label className="block text-sm font-medium mb-3">Pilih Lapangan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {venues.map((venue) => (
                    <button
                      key={venue.id}
                      type="button"
                      onClick={() => handleVenueChange(venue.id)}
                      className={`
                        relative group rounded-xl p-4 border-2 transition-all duration-200
                        ${form.venueId === venue.id
                          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(27,111,255,0.3)]'
                          : 'border-border/60 bg-surface-2/40 hover:border-primary/50 hover:bg-surface-2/60'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors
                          ${form.venueId === venue.id
                            ? 'bg-primary/20 text-primary'
                            : 'bg-surface/60 text-text-muted group-hover:text-primary'
                          }
                        `}>
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className={`
                            font-semibold text-sm transition-colors
                            ${form.venueId === venue.id ? 'text-primary' : 'text-text-primary'}
                          `}>
                            {venue.name}
                          </h4>
                          <p className="text-xs text-text-muted mt-1">
                            Lapangan Olahraga
                          </p>
                        </div>
                        {form.venueId === venue.id && (
                          <div className="absolute top-3 right-3">
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.venueId && (
                  <p className="text-xs text-red-400 mt-2">{errors.venueId}</p>
                )}
              </div>

              {form.venueId && (
                <div>
                  <label className="block text-sm font-medium mb-3">Pilih Tanggal</label>
                  <div className="bg-surface-2/60 border border-border/60 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-5">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-surface/80 rounded-lg transition-all hover:scale-105"
                      >
                        <ChevronLeft className="h-5 w-5 text-text-muted" />
                      </button>
                      <h3 className="text-base font-bold text-text-primary">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </h3>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-surface/80 rounded-lg transition-all hover:scale-105"
                      >
                        <ChevronRight className="h-5 w-5 text-text-muted" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 mb-3">
                      {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                        <div key={day} className="text-center text-xs font-bold text-text-muted py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {calendar.map((day) => {
                        const isPast = !day.available;
                        const isSelected = day.isSelected;
                        
                        return (
                          <button
                            key={day.date}
                            type="button"
                            onClick={() => day.available && handleDateSelect(day.date)}
                            disabled={isPast}
                            className={`
                              aspect-square rounded-lg text-sm font-semibold transition-all duration-200
                              ${isSelected
                                ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-[0_4px_16px_rgba(27,111,255,0.4)] scale-105'
                                : day.isToday
                                ? 'bg-accent/20 text-accent border-2 border-accent/50 hover:bg-accent/30'
                                : isPast
                                ? 'bg-surface/30 text-text-muted/30 cursor-not-allowed'
                                : 'bg-surface/60 text-text-primary hover:bg-surface hover:scale-105 hover:shadow-lg'
                              }
                            `}
                          >
                            {new Date(day.date).getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {errors.bookingDate && (
                    <p className="text-xs text-red-400 mt-2">{errors.bookingDate}</p>
                  )}
                  {dayType && form.bookingDate && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                      <span className="text-xs font-medium text-accent">{getDayTypeLabel(dayType)}</span>
                    </div>
                  )}
                </div>
              )}

              {form.venueId && form.bookingDate && pricingOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">Pilih Waktu Main</label>
                  <div className="grid grid-cols-1 gap-3">
                    {pricings.map((pricing) => (
                      <button
                        key={pricing.id}
                        type="button"
                        onClick={() => handlePricingChange(pricing.id)}
                        className={`
                          relative group rounded-xl p-4 border-2 transition-all duration-200 text-left
                          ${form.pricingId === pricing.id
                            ? 'border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(0,184,255,0.3)]'
                            : 'border-border/60 bg-surface-2/40 hover:border-secondary/50 hover:bg-surface-2/60'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors
                            ${form.pricingId === pricing.id
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-surface/60 text-text-muted group-hover:text-secondary'
                            }
                          `}>
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`
                              font-semibold text-sm transition-colors
                              ${form.pricingId === pricing.id ? 'text-secondary' : 'text-text-primary'}
                            `}>
                              {pricing.label}
                            </h4>
                            <p className="text-xs text-text-muted mt-1">
                              {pricing.startTime} - {pricing.endTime}
                            </p>
                            <p className={`
                              text-xs font-bold mt-1.5
                              ${form.pricingId === pricing.id ? 'text-accent' : 'text-text-muted'}
                            `}>
                              {formatPrice(pricing.pricePerHour)}/jam
                            </p>
                          </div>
                          {form.pricingId === pricing.id && (
                            <div className="absolute top-3 right-3">
                              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.pricingId && (
                    <p className="text-xs text-red-400 mt-2">{errors.pricingId}</p>
                  )}
                </div>
              )}

              {form.venueId && form.bookingDate && pricingOptions.length === 0 && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-yellow-400">Tidak ada waktu tersedia</p>
                    <p className="text-xs text-text-muted mt-1">Tidak ada harga yang tersedia untuk tanggal ini. Silakan pilih tanggal lain.</p>
                  </div>
                </div>
              )}

              {selectedPricing && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-3">Pilih Jam</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => slot.available && handleTimeSelect(slot.time)}
                          disabled={!slot.available}
                          className={`
                            relative px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
                            ${
                              form.selectedTimes.includes(slot.time)
                                ? 'bg-gradient-to-br from-accent to-accent/80 text-white shadow-[0_4px_16px_rgba(25,230,162,0.4)] scale-105 border-2 border-accent'
                                : slot.available
                                ? 'bg-surface-2/60 text-text-primary border-2 border-border/60 hover:border-accent/50 hover:bg-accent/10 hover:scale-105'
                                : 'bg-surface/30 text-text-muted/40 border-2 border-red-500/20 cursor-not-allowed opacity-50'
                            }
                          `}
                        >
                          <div className="flex flex-col items-center">
                            <span>{slot.time}</span>
                            {!slot.available && (
                              <span className="text-[10px] text-red-400 mt-0.5">Penuh</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.selectedTimes && (
                      <p className="text-xs text-red-400 mt-2">{errors.selectedTimes}</p>
                    )}
                    {form.selectedTimes.length > 0 && (
                      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/30">
                        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-semibold text-accent">
                          {form.selectedTimes.length} jam dipilih
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Catatan (Opsional)</label>
                <Input
                  as="textarea"
                  placeholder="Tambahkan catatan untuk booking ini..."
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl"></div>
            <CardHeader className="relative">
              <CardTitle>Ringkasan Booking</CardTitle>
              <CardDescription>Detail pesanan Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              {selectedVenue && (
                <div className="p-3 rounded-xl bg-surface-2/40 border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted mb-0.5">Lapangan</p>
                      <p className="font-bold text-text-primary truncate">{selectedVenue.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {form.bookingDate && (
                <div className="p-3 rounded-xl bg-surface-2/40 border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted mb-0.5">Tanggal</p>
                      <p className="font-bold text-text-primary text-sm leading-tight">
                        {new Date(form.bookingDate + 'T00:00:00').toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPricing && startTime && endTime && (
                <div className="p-3 rounded-xl bg-surface-2/40 border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted mb-0.5">Waktu Main</p>
                      <p className="font-bold text-text-primary">
                        {startTime} - {endTime}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPricing && (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4"></div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-muted">Harga per Jam</span>
                      <span className="font-bold text-text-primary">{formatPrice(selectedPricing.pricePerHour)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-muted">Durasi</span>
                      <span className="font-bold text-text-primary">{form.selectedTimes.length} jam</span>
                    </div>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30">
                      <span className="font-bold text-text-primary">Total Harga</span>
                      <span className="text-2xl font-black bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={loading || !selectedPricing || form.selectedTimes.length === 0}
                >
                  {loading ? 'Memproses...' : 'Buat Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default function CreateBookingPage() {
  return (
    <ToastProvider>
      <CreateBookingContent />
    </ToastProvider>
  );
}
