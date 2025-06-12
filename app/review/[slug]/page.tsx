'use client';
import { useRouter } from 'next/navigation';

export default function ReviewPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();

  function handleAccept() {
    // 🔜  In the next step we’ll call Stripe here.
    // For now, just bounce to a placeholder
    router.push(`/api/placeholder-redirect?slug=${slug}`);
  }

  return (
    <main style={{maxWidth:480,margin:'3rem auto',padding:'0 1rem',fontFamily:'sans-serif'}}>
      <h1>Review your order</h1>

      <p>Everything look good for <strong>order #{slug}</strong>?</p>

      {/* later we’ll show title, price, etc. */}

      <label style={{display:'flex',gap:8,margin:'24px 0'}}>
        <input type="checkbox" id="agree" />
        <span>I confirm the details are correct</span>
      </label>

      <button
        onClick={handleAccept}
        style={{padding:'10px 18px',background:'#000',color:'#fff',border:'none',borderRadius:4}}
      >
        Pay now
      </button>
    </main>
  );
}
