type Props = { params: { slug: string } };

export default function HotelDetailPage({ params }: Props) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Hotel: {params.slug}</h1>
      <p className="mt-2 text-sm text-gray-600">TODO: hotel details, restaurants, table booking</p>
    </main>
  );
}
