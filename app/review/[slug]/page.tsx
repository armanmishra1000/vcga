'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

type Item = { title: string; price: number };

export default function ReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [items, setItems]         = useState<Item[]>([]);
  const [total, setTotal]         = useState(0);
  const [currency, setCurrency]   = useState('usd');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  /* 1️⃣ load order details */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/order-details', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ slug }),
        });
        const j = await r.json();
        if (r.ok) {
          setItems(j.items);
          setTotal(j.total);
          setCurrency(j.currency);
          setSessionId(j.sessionId);
        } else {
          setError(j.error || 'Order lookup failed');
        }
      } catch (e:any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  /* 2️⃣ pay now */
  async function handlePay() {
    if (!sessionId) return alert('Session not ready');
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
    const { error } = await stripe!.redirectToCheckout({ sessionId });
    if (error) alert(error.message);
  }

  /* ── UI ─────────────────────────────────────────────── */
  if (loading) return <p style={{textAlign:'center',marginTop:60}}>Loading…</p>;

  return (
    <main style={{maxWidth:540,margin:'3rem auto',fontFamily:'sans-serif'}}>
      <h1 style={{textAlign:'center'}}>Review your order</h1>

      {error && <p style={{color:'tomato'}}>{error}</p>}

      {/* product list */}
      <table style={{width:'100%',marginTop:24,borderCollapse:'collapse'}}>
        <thead>
          <tr><th align="left">Product</th><th style={{width:90}} align="right">Price</th></tr>
        </thead>
        <tbody>
          {items.map((it,i)=>(
            <tr key={i}>
              <td>{it.title}</td>
              <td align="right">{currency.toUpperCase()} {it.price}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td><strong>Total</strong></td>
              <td align="right"><strong>{currency.toUpperCase()} {total}</strong></td></tr>
        </tfoot>
      </table>

      {/* confirm checkbox */}
      <label style={{display:'flex',gap:8,margin:'24px 0',alignItems:'center'}}>
        <input type="checkbox" defaultChecked/>
        <span>I confirm the details are correct</span>
      </label>

      {/* Pay now */}
      <button
        onClick={handlePay}
        disabled={!sessionId}
        style={{padding:'10px 24px',background:'#000',color:'#fff',border:'none',borderRadius:4}}
      >
        Pay now
      </button>

      {/* contact link */}
      <p style={{marginTop:24,fontSize:14}}>
        Not correct?&nbsp;
        <a href="mailto:support@yourbrand.com" style={{color:'#0af'}}>
          Contact us
        </a>
      </p>
    </main>
  );
}
