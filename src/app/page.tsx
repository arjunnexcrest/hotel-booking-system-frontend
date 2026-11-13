import Link from 'next/link';

const links = [
  { href: '/hotels', label: 'Customer — Hotels' },
  { href: '/login', label: 'Login' },
  { href: '/hotel-admin', label: 'Hotel Admin' },
  { href: '/super-admin', label: 'Super Admin' },
  { href: '/staff', label: 'Staff' },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hotel Table Booking
        </h1>
        <p className="mt-2 text-gray-600">
          Starter frontend for the multi-hotel booking & AI table management
          platform.
        </p>
      </div>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link className="text-blue-700 underline" href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
