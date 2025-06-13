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

  if (loading) return <p className="mt-24 text-center">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8 font-sans">
      <h1 className="text-center text-2xl font-bold">Review your order</h1>
      {err && <p className="text-center text-red-600">{err}</p>}

      <div className="grid gap-4">
        {items.map((it, i) => (
          <div key={i} className="flex gap-4 rounded border p-4">
            {it.imageUrl && <img src={it.imageUrl} alt={it.title} className="h-16 w-16 object-cover" />}
            <div className="flex-1">
              <div className="font-semibold">{it.title}</div>
              {it.description && <div className="text-sm opacity-70">{it.description}</div>}
            </div>
            <div className="whitespace-nowrap font-medium">
              {currency.toUpperCase()} {it.price}
            </div>
          </div>
        ))}
      </div>

      <p className="text-right text-lg font-semibold">
        Total: {currency.toUpperCase()} {total}
      </p>

      <div className="grid gap-3">
        <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <button onClick={handlePay} className="btn-primary">
        Pay now
      </button>

      <p className="text-sm">
        Need changes?{' '}
        <a href="mailto:support@yourbrand.com" className="text-indigo-600 underline">
          Contact us
        </a>
      </p>
    </div>
  );
}
