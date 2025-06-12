import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { mongo } from '../../../lib/mongo';              // 👈 NEW

const stripe        = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST /api/stripe-webhook
export async function POST(req: NextRequest) {
  // Grab the raw body for signature verification
  const rawBody   = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get('stripe-signature') as string | null;

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('⚠️  Signature check failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── Handle events ─────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const slug    = session.metadata?.slug;

    console.log(`✅ Payment succeeded for slug ${slug}`);

    await mongo.db('checkout').collection('orders').updateOne(
      { slug },
      { $set: { status: 'paid', paidAt: new Date() } }
    );
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent;
    console.warn('❌ Payment failed:', intent.last_payment_error?.message);

    // Optional: mark slug as failed
    const slug = intent.metadata?.slug;
    if (slug) {
      await mongo.db('checkout').collection('orders').updateOne(
        { slug },
        { $set: { status: 'failed', failedAt: new Date() } }
      );
    }
  }
  // ─────────────────────────────────────────────────────────────────

  return NextResponse.json({ received: true });
}
