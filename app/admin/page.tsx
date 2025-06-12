'use client';
import { useState } from 'react';

type CreateResponse = {
  slug: string;
  sessionUrl: string;
};

export default function AdminCreatePage() {
  const [title, setTitle]   = useState('');
  const [price, setPrice]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateResponse | null>(null);

  const disabled = !title || !price || loading;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const r = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price }),
      });
      const json = await r.json();

      if (r.ok) {
        setResult(json);           // { slug, sessionUrl }
        setTitle('');
        setPrice('');
      } else {
        alert(json.error || 'Server error');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 500,
        margin: '3rem auto',
        padding: '0 1rem',
        fontFamily: 'sans-serif',
      }}
    >
      <h1>Create checkout link</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          placeholder="Service title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        />

        <input
          placeholder="Price (e.g. 49.99)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        />

        <button
          disabled={disabled}
          style={{
            padding: '10px 18px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {result && (
        <section style={{ marginTop: 32, wordBreak: 'break-all' }}>
          <h2>Links to share</h2>

          <p>
            Customer review page:<br />
            <a
              href={`https://pay.vcga.uk/review/${result.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              https://pay.vcga.uk/review/{result.slug}
            </a>
          </p>

          <p style={{ marginTop: 16, opacity: 0.8 }}>
            Direct Stripe Checkout (testing):<br />
            <a href={result.sessionUrl} target="_blank" rel="noopener noreferrer">
              {result.sessionUrl}
            </a>
          </p>
        </section>
      )}
    </main>
  );
}
