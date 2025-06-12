'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

export default function ReviewPage() {
  const router  = useRouter();
  const params  = useParams();
  const slug    = params.slug as string;          // e.g. "OJONb-"

  const [loading, setLoading]       = useState(true);
  const [sessionId, setSessionId]   = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  /** ── 1. On mount, look up the Checkout Session that matches this slug */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/get-session', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ slug }),
        });
        const j = await r.json();

        if (r.ok) setSessionId(j.sessionId);      // "cs_test_..."
        else      setError(j.error || 'Lookup failed');
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  /** ── 2. When the user clicks Pay, redirect them to Stripe Checkout */
  async function handlePay() {
    if (!sessionId) return alert('Session not ready');

    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );

    const { error } = await stripe!.redirectToCheckout({ sessionId });
    if (error) alert(error.message);
  }

  /* ──────────────────────────  UI  ────────────────────────── */

  return (
    <main
      style={{
        maxWidth: 500,
        margin: '3rem auto',
        padding: '0 1rem',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      <h1>Review your order</h1>

      <p>
        Everything look good for <strong>order #{slug}</strong>?
      </p>

      <label style={{ display: 'flex', gap: 8, margin: '24px 0', justifyContent: 'center' }}>
        <input type="checkbox" id="agree" defaultChecked />
        <span>I confirm the details are correct</span>
      </label>

      {error && (
        <p style={{ color: 'tomato', marginBottom: 16 }}>
          {error}
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={loading || !sessionId}
        style={{
          padding: '10px 20px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Preparing…' : 'Pay now'}
      </button>
    </main>
  );
}
