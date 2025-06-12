'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const nav = [
  { href: '/admin',           label: 'Checkout Links' },
  { href: '/admin/products',  label: 'Products'       },
  // add more here any time
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const path = usePathname();

  return (
    <div className="flex min-h-screen font-sans">
      {/* ───────────── sidebar ───────────── */}
      <aside className="w-56 shrink-0 bg-gray-100 dark:bg-gray-900 p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Admin
        </h2>

        <nav className="flex flex-col gap-3 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800
                ${
                  path === item.href
                    ? 'bg-gray-200 dark:bg-gray-800 font-semibold'
                    : ''
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ───────────── main content ───────────── */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
