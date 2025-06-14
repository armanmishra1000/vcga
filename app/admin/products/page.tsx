'use client';
import { useEffect, useState } from 'react';

type Prod = {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  custom?: number; // UI-only override for link generation
};

type CreateResp = { slug: string; sessionUrl: string };

export default function ProductsAdmin() {
  /* ────────── state ────────── */
  const [list, setList] = useState<Prod[]>([]);
  const [sel, setSel]   = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingProduct, setEditingProduct] = useState<Prod | null>(null); // NEW
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<CreateResp | null>(null);

  /* fetch catalog once */
  useEffect(() => {
    (async () => {
      const r = await fetch('/api/products');
      setList(await r.json());
    })();
  }, []);

  /* helper to clear the form */
  function resetForm() {
    setTitle(''); setPrice(''); setDescription(''); setImageUrl('');
    setEditingProduct(null);
  }

  /* add or update product */
  async function handleFormSubmit(e: any) {
    e.preventDefault();

    if (!title || !price) return;

    if (editingProduct) {
      /* ---- UPDATE (PUT) ---- */
      const r = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: editingProduct._id,
          title,
          price,
          description,
          imageUrl,
        }),
      });
      const updated = await r.json();
      if (r.ok) {
        setList(lst =>
          lst.map(p => (p._id === updated._id ? { ...p, ...updated } : p)),
        );
        resetForm();
      } else {
        alert(updated.error || 'Update failed');
      }
    } else {
      /* ---- ADD (POST) ---- */
      const r = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price, description, imageUrl }),
      });
      const p = await r.json();
      if (r.ok) {
        setList([p, ...list]);
        resetForm();
      } else {
        alert(p.error || 'Add failed');
      }
    }
  }

  /* generate checkout link */
  async function createLink() {
    setLoading(true); setLink(null);
    const items = list
      .filter(p => sel[p._id])
      .map(p => ({
        _id: p._id,
        title: p.title,
        price: p.custom ?? p.price,
        description: p.description,
        imageUrl: p.imageUrl,
      }));

    const r = await fetch('/api/create-order-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    const j = await r.json();
    setLink(j); setLoading(false);
  }

  /* ────────── UI ────────── */
  return (
    <main style={{ maxWidth: 860, margin: '3rem auto', fontFamily: 'sans-serif' }}>
      <h1>Products</h1>

      {/* add / edit form */}
      <form onSubmit={handleFormSubmit} style={{ display:'grid', gap:8, margin:'20px 0' }}>
        <input
          placeholder="Title"
          value={title}
          onChange={e=>setTitle(e.target.value)}
        />
        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={e=>setPrice(e.target.value)}
        />
        <input
          placeholder="Image URL"
          value={imageUrl}
          onChange={e=>setImageUrl(e.target.value)}
        />
        <textarea
          placeholder="Description"
          rows={2}
          value={description}
          onChange={e=>setDescription(e.target.value)}
        />

        <div style={{ display:'flex', gap:8 }}>
          <button type="submit">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={resetForm}
              style={{ background:'#ccc', color:'#000' }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* table */}
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th/>
            <th>Image</th>
            <th>Details</th>
            <th style={{ width:90 }}>Price</th>
            <th style={{ width:70 }}/>
          </tr>
        </thead>
        <tbody>
          {list.map(p => (
            <tr key={p._id} style={{ borderBottom:'1px solid #ddd' }}>
              <td>
                <input
                  type="checkbox"
                  checked={!!sel[p._id]}
                  onChange={e=>setSel({...sel, [p._id]:e.target.checked})}
                />
              </td>

              <td>
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    style={{ width:48, height:48, objectFit:'cover' }}
                  />
                )}
              </td>

              <td>
                <strong>{p.title}</strong><br/>
                <small style={{ opacity:.8 }}>{p.description?.slice(0,80)}</small>
              </td>

              <td>
                <input
                  type="number"
                  defaultValue={p.price}
                  onChange={e=>{
                    const v = Number(e.target.value);
                    setList(lst=>lst.map(x=>x._id===p._id?{...x, custom:v}:x));
                  }}
                  style={{ width:80 }}
                />
              </td>

              <td>
                <button
                  type="button"
                  onClick={()=>{
                    setEditingProduct(p);
                    setTitle(p.title);
                    setPrice(String(p.price));
                    setDescription(p.description || '');
                    setImageUrl(p.imageUrl || '');
                  }}
                  style={{ fontSize:12 }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        disabled={loading}
        onClick={createLink}
        style={{ marginTop:24, padding:'10px 18px', background:'#000', color:'#fff' }}
      >
        {loading ? 'Generating…' : 'Generate checkout link'}
      </button>

      {link && (
        <section style={{ marginTop:24, wordBreak:'break-all' }}>
          <p>
            <strong>Review page:</strong><br/>
            <a href={`https://pay.vcga.uk/review/${link.slug}`} target="_blank">
              https://pay.vcga.uk/review/{link.slug}
            </a>
          </p>
        </section>
      )}
    </main>
  );
}
