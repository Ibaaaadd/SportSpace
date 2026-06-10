interface BookingDetailPageProps {
  params: { venueId: string };
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface/70 p-6">
      <h2 className="text-2xl font-semibold">Booking Venue</h2>
      <p className="mt-2 text-sm text-text-muted">
        Placeholder booking untuk venue: {params.venueId}
      </p>
    </section>
  );
}
