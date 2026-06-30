'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Users, Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { ToastProvider, useToast } from '../../../components/ui/Toast';
import { createToastHelpers } from '../../../components/ui/Toast';

type Venue = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  sportType: string;
  imageUrl: string | null;
};

function VenuesContent() {
  const router = useRouter();
  const toastContext = useToast();
  const t = createToastHelpers(toastContext);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch('/api/venues');
        if (res.ok) {
          const data = await res.json();
          setVenues(
            (data.data || []).map((v: any) => ({
              id: v.id,
              name: v.name,
              location: v.location,
              capacity: v.capacity,
              sportType: v.sportType?.name || 'Unknown',
              imageUrl: v.imageUrl,
            }))
          );
        } else {
          t.error('Gagal memuat data venue');
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
        t.error('Gagal memuat data venue');
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [toastContext]);

  const filteredVenues = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.location.toLowerCase().includes(search.toLowerCase()) ||
    v.sportType.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <Input
          placeholder="Cari venue, lokasi, atau jenis olahraga..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

      {filteredVenues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">
            {search ? 'Tidak ada venue yang sesuai pencarian' : 'Belum ada venue tersedia'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden hover:border-primary/50 transition-all">
              {venue.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{venue.name}</CardTitle>
                <p className="text-xs text-primary font-medium">{venue.sportType}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MapPin className="h-4 w-4" />
                  <span>{venue.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Users className="h-4 w-4" />
                  <span>Kapasitas: {venue.capacity} orang</span>
                </div>
                <Button
                  onClick={() => router.push(`/booking/${venue.id}`)}
                  className="w-full"
                  size="sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Booking Sekarang
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VenuesPage() {
  return (
    <ToastProvider>
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Pilih Venue</h2>
          <p className="text-sm text-text-muted">
            Pilih lapangan yang ingin kamu booking
          </p>
        </div>
        <VenuesContent />
      </section>
    </ToastProvider>
  );
}
