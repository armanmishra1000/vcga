'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

type Item = { title: string; price: number; description?: string; imageUrl?: string };

export default function ReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState('usd');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true); const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/order-details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (r.ok) { setItems(j.items); setTotal(j.total); setCurrency(j.currency); setSessionId(j.sessionId); } else setErr(j.error);
      setLoading(false);
    })();
  }, [slug]);

  async function handlePay() {
    if (!sessionId || !email) return alert('Please fill required fields');
    const up = await fetch('/api/update-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, name, email, phone }) }).then(r => r.json());
    if (up.error) return alert(up.error);
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    stripe?.redirectToCheckout({ sessionId });
  }

  if (loading) return <p className="mt-24 text-center text-gray-200">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-12 md:py-16 font-sans">
      {/* Logo / Brand */}
      <div className="text-center mb-8 text-3xl font-bold text-emerald-400">SEO Vally</div>

      {/* Heading */}
      <h1 className="text-center text-3xl md:text-4xl font-bold mb-8 md:mb-12">Review your order</h1>

      {err && <p className="bg-red-700 text-white p-4 rounded-md text-center my-6">{err}</p>}

      {/* Items */}
      <div className="space-y-6">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-zinc-800 rounded-lg p-6 shadow-lg"
          >
            {it.imageUrl && (
              <img
                src={it.imageUrl}
                alt={it.title}
                className="w-20 h-20 object-cover rounded-md"
              />
            )}
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-100">{it.title}</div>
              {it.description && (
                <div className="text-sm text-gray-400 mt-1">{it.description}</div>
              )}
            </div>
            <div className="whitespace-nowrap font-semibold text-lg text-gray-100">
              {currency.toUpperCase()} {it.price}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <p className="text-right text-xl md:text-2xl font-bold text-gray-100 py-6 border-t border-b border-gray-700 my-8">
        Total: {currency.toUpperCase()} {total}
      </p>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
            Full name
          </label>
          <input
            id="fullName"
            className="input bg-white dark:bg-gray-100 border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500 rounded-md p-3"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            className="input bg-white dark:bg-gray-100 border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500 rounded-md p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
            Phone (optional)
          </label>
          <input
            id="phone"
            className="input bg-white dark:bg-gray-100 border-gray-300 dark:border-gray-600 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500 rounded-md p-3"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handlePay} className="btn-primary w-full text-lg py-3 mt-8">
        Pay now
      </button>

      <p className="text-xs text-gray-500 text-center mt-2">Secure payment powered by Stripe</p>

      <p className="text-center text-sm text-gray-400 mt-8">
        Need changes?{' '}
        <a href="mailto:support@yourbrand.com" className="text-emerald-400 hover:text-emerald-300 underline">
          Contact us
        </a>
      </p>
    </div>
  );
}
