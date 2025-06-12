'use client';                    // <-- required for interactive form
import { useState } from 'react';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<{slug:string; sessionUrl:string}|null>(null);
  const [loading, setLoading] = useState(false);
  const disabled = !title || !price || loading;

  async function handleSubmit(e: React.FormEvent) {
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
      if (r.ok) setResult(json);
      else alert(json.error || 'Server error');
    } catch (err:any) {
      alert(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{maxWidth:480, margin:'3rem auto', padding:'0 1rem', fontFamily:'sans-serif'}}>
      <h1>Create checkout link</h1>

      <form onSubmit={handleSubmit} style={{display:'grid', gap:12}}>
        <input
          placeholder="Service title"
          value={title}
          onChange={e=>setTitle(e.target.value)}
          style={{padding:8, border:'1px solid #ccc', borderRadius:4}}
        />

        <input
          placeholder="Price (e.g. 49.99)"
          value={price}
          onChange={e=>setPrice(e.target.value)}
          style={{padding:8, border:'1px solid #ccc', borderRadius:4}}
        />

        <button disabled={disabled}
                style={{padding:'10px 18px', background:'#000', color:'#fff',
                        border:'none', borderRadius:4, opacity:disabled?0.6:1}}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {result && (
        <section style={{marginTop:32, wordBreak:'break-all'}}>
          <h2>Share this link</h2>
          <p>
            <a href={result.sessionUrl} target="_blank" rel="noopener noreferrer">
              {result.sessionUrl}
            </a>
          </p>
        </section>
      )}
    </main>
  );
}
