'use client';
import { useState } from 'react';

type CreateResponse = { slug: string; sessionUrl: string };

export default function AdminCreatePage() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateResponse | null>(null);
  const disabled = !title || !price || loading;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const r = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price }),
    });
    const json = await r.json();
    setLoading(false);

    if (r.ok) {
      setResult(json);
      setTitle('');
      setPrice('');
    } else {
      alert(json.error || 'Server error');
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 font-sans">
      <h1 className="text-2xl font-bold">Create checkout link</h1>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          className="block w-full rounded border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
          placeholder="Service title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="block w-full rounded border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
          placeholder="Price (e.g. 49.99)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button
          disabled={disabled}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {result && (
        <section className="space-y-4 break-words">
          <h2 className="text-lg font-semibold">Links to share</h2>
          <p>
            <span className="font-medium">Customer review page:</span>
            <br />
            <a
              href={`https://pay.vcga.uk/review/${result.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline"
            >
              https://pay.vcga.uk/review/{result.slug}
            </a>
          </p>
          <p className="opacity-80">
            <span className="font-medium">Direct Stripe Checkout (testing):</span>
            <br />
            <a href={result.sessionUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {result.sessionUrl}
            </a>
          </p>
        </section>
      )}
    </div>
  );
}
