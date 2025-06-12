import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { mongo } from '../../../lib/mongo';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST body: { slug, name, email, phone }
export async function POST(req: NextRequest) {
  try {
    const { slug, name, email, phone } = await req.json();
    if (!slug || !email) {
      return NextResponse.json({ error: 'Missing slug or email' }, { status: 400 });
    }

    /* 1️⃣ find the order */
    const orders = mongo.db('checkout').collection('orders');
    const order  = await orders.findOne({ slug });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    /* 2️⃣ update Session metadata (safe, even before payment) */
    await stripe.checkout.sessions.update(order.sessionId, {
      metadata: {
        buyer_name : name,
        buyer_email: email,
        buyer_phone: phone,
        slug,
      },
    });

    /* 3️⃣ if we already have a PaymentIntent ID, also tag it */
    if (order.paymentIntentId) {
      await stripe.paymentIntents.update(order.paymentIntentId, {
        metadata: {
          buyer_name : name,
          buyer_email: email,
          buyer_phone: phone,
          slug,
        },
      }).catch(() => {}); // ignore in case the intent isn't finalized yet
    }

    /* 4️⃣ persist details locally */
    await orders.updateOne(
      { slug },
      { $set: { buyer: { name, email, phone } } }
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('update-session error:', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
