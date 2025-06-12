import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe          = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret   = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/stripe-webhook   (no JSON; Stripe sends raw bytes)
 */
export async function POST(req: NextRequest) {
  // 1️⃣ Read raw body as a Buffer
  const rawBody = Buffer.from(await req.arrayBuffer());

  // 2️⃣ Grab the signature header
  const signature = req.headers.get('stripe-signature') as string | null;
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('⚠️  Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  /* ─────────────── handle events you care about ─────────────── */
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const slug    = session.metadata?.slug;

    console.log(`✅ Payment succeeded for slug ${slug}`);

    // TODO: mark slug as "paid" in your DB or JSON store here
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent;
    console.warn('❌ Payment failed:', intent.last_payment_error?.message);
  }
  /* ──────────────────────────────────────────────────────────── */

  return NextResponse.json({ received: true });
}
