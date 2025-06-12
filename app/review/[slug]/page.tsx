'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

type Item = { title: string; price: number };

export default function ReviewPage() {
  const { slug } = useParams<{ slug: string }>();

  /* order data */
  const [items, setItems]   = useState<Item[]>([]);
  const [total, setTotal]   = useState(0);
  const [currency,setCurrency]=useState('usd');
  const [sessionId,setSessionId]=useState<string|null>(null);

  /* buyer form */
  const [name ,setName ] = useState('');
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState<string|null>(null);

  /* 1️⃣ fetch order details once */
  useEffect(()=>{
    (async()=>{
      try{
        const r = await fetch('/api/order-details',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({slug})
        });
        const j = await r.json();
        if(r.ok){
          setItems(j.items); setTotal(j.total);
          setCurrency(j.currency); setSessionId(j.sessionId);
        }else setErr(j.error||'Lookup failed');
      }catch(e:any){ setErr(e.message) }
      finally{ setLoading(false); }
    })();
  },[slug]);

  /* 2️⃣ pay flow */
  async function handlePay(){
    if(!sessionId) return alert('Session not ready');
    if(!email)     return alert('Email required');

    /* push buyer details to server + Stripe */
    const up = await fetch('/api/update-session',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({slug,name,email,phone})
    }).then(r=>r.json());

    if(up.error){ alert(up.error); return; }

    /* redirect */
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
    const { error } = await stripe!.redirectToCheckout({ sessionId });
    if(error) alert(error.message);
  }

  /* ── UI ──────────────────────────────────────────── */
  if(loading) return <p style={{textAlign:'center',marginTop:60}}>Loading…</p>;

  return(
    <main style={{maxWidth:560,margin:'3rem auto',fontFamily:'sans-serif'}}>
      <h1 style={{textAlign:'center'}}>Review your order</h1>

      {err && <p style={{color:'tomato'}}>{err}</p>}

      {/* product table */}
      <table style={{width:'100%',marginTop:24,borderCollapse:'collapse'}}>
        <thead><tr>
          <th align="left">Product</th>
          <th align="right" style={{width:90}}>Price</th>
        </tr></thead>
        <tbody>
          {items.map((it,i)=>(
            <tr key={i}>
              <td>{it.title}</td>
              <td align="right">
                {currency.toUpperCase()} {it.price}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Total</strong></td>
            <td align="right"><strong>
              {currency.toUpperCase()} {total}
            </strong></td>
          </tr>
        </tfoot>
      </table>

      {/* buyer details */}
      <div style={{display:'grid',gap:10,margin:'24px 0'}}>
        <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>
        <input placeholder="Email"     value={email}onChange={e=>setEmail(e.target.value)}/>
        <input placeholder="Phone (optional)" value={phone} onChange={e=>setPhone(e.target.value)}/>
      </div>

      <button
        onClick={handlePay}
        style={{padding:'10px 22px',background:'#000',color:'#fff',border:'none',borderRadius:4}}
      >
        Pay now
      </button>

      <p style={{marginTop:18,fontSize:14}}>
        Need changes?&nbsp;
        <a href="mailto:support@yourbrand.com" style={{color:'#0af'}}>Contact us</a>
      </p>
    </main>
  );
}
