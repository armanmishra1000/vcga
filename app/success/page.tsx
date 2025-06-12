'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const params = useSearchParams();
  const slug   = params.get('slug');          // e.g. "eqeWEU"

  return (
    <main
      style={{
        maxWidth: 500,
        margin: '4rem auto',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h1>✅ Payment received</h1>

      <p style={{ marginTop: 24 }}>
        Thanks! Your order&nbsp;
        {slug && (
          <>
            <code style={{ fontSize: '1.1em' }}>{slug}</code>&nbsp;
          </>
        )}
        is now marked <strong>paid</strong>.
      </p>

      <p style={{ marginTop: 40 }}>
        <Link href="/" style={{ color: '#0af' }}>
          ← back to home
        </Link>
      </p>
    </main>
  );
}
