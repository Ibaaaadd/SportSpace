interface BookingDetailPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { venueId } = await params;
  return (
    <section className="rounded-2xl border border-border bg-surface/70 p-6">
      <h2 className="text-2xl font-semibold">Booking Venue</h2>
      <p className="mt-2 text-sm text-text-muted">
        Placeholder booking untuk venue: {venueId}
      </p>
    </section>
  );
}
