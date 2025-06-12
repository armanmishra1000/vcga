'use client';
import { useEffect, useState } from 'react';

type Prod = { _id: string; title: string; price: number; custom?: number };
type CreateResp = { slug: string; sessionUrl: string };

export default function ProductsAdmin() {
  const [list, setList]       = useState<Prod[]>([]);
  const [sel,  setSel]        = useState<Record<string, boolean>>({});
  const [title, setTitle]     = useState('');
  const [price, setPrice]     = useState('');
  const [loading, setLoading] = useState(false);
  const [link, setLink]       = useState<CreateResp | null>(null);

  /** fetch catalog once */
  useEffect(() => { (async () => {
      const r = await fetch('/api/products');
      setList(await r.json());
  })(); }, []);

  async function addProduct(e:any){
    e.preventDefault();
    const r = await fetch('/api/products',{method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({title,price})});
    const p = await r.json();
    setList([p,...list]);
    setTitle(''); setPrice('');
  }

  async function createLink(){
    setLoading(true); setLink(null);
    const items = list.filter(p=>sel[p._id]).map(p=>({
      _id   : p._id,
      title : p.title,
      price : p.custom ?? p.price
    }));
    const r = await fetch('/api/create-order-bulk',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({items})
    });
    const j = await r.json();
    setLink(j); setLoading(false);
  }

  return(
    <main style={{maxWidth:680,margin:'3rem auto',fontFamily:'sans-serif'}}>
      <h1>Products</h1>

      {/* add product */}
      <form onSubmit={addProduct} style={{display:'flex',gap:8,margin:'20px 0'}}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)}
               style={{flex:2,padding:6}}/>
        <input placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)}
               style={{width:100,padding:6}}/>
        <button style={{padding:'6px 14px'}}>Add</button>
      </form>

      {/* list + select */}
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th/></tr></thead>
        <tbody>
          {list.map(p=>(
            <tr key={p._id} style={{borderBottom:'1px solid #ddd'}}>
              <td><input type="checkbox" checked={!!sel[p._id]}
                onChange={e=>setSel({...sel,[p._id]:e.target.checked})}/></td>
              <td>{p.title}</td>
              <td style={{width:90}}>
                <input type="number" defaultValue={p.price}
                  onChange={e=>{
                    const v=Number(e.target.value);
                    setList(ls=>ls.map(x=>x._id===p._id?{...x,custom:v}:x))
                  }}
                  style={{width:'100%'}}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button disabled={loading}
        onClick={createLink}
        style={{marginTop:24,padding:'10px 18px',background:'#000',color:'#fff'}}>
        {loading?'Generating…':'Generate checkout link'}
      </button>

      {link && (
        <section style={{marginTop:24,wordBreak:'break-all'}}>
          <p><strong>Review page:</strong><br/>
          <a href={`https://pay.vcga.uk/review/${link.slug}`} target="_blank">
            https://pay.vcga.uk/review/{link.slug}
          </a></p>
        </section>
      )}
    </main>
  )
}
