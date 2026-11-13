type Props = { params: { id: string } };

export default function BookingDetailPage({ params }: Props) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Booking #{params.id}</h1>
      <p className="mt-2 text-sm text-gray-600">TODO: booking detail & cancel</p>
    </main>
  );
}
