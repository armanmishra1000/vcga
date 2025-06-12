import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { mongo } from '../../../lib/mongo';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST body: { slug, name, email, phone }
export async function POST(req: NextRequest) {
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

  /* 2️⃣ update SESSION metadata (optional but harmless) */
  await stripe.checkout.sessions.update(order.sessionId, {
    metadata: {
      ...(order.metadata || {}),
      buyer_name : name,
      buyer_email: email,
      buyer_phone: phone,
    },
  });

  /* 3️⃣ update PAYMENT INTENT metadata → shows on Charge */
  await stripe.paymentIntents.update(order.paymentIntentId, {
    metadata: {
      buyer_name  : name,
      buyer_email : email,
      buyer_phone : phone,
      slug,
    },
  });

  /* 4️⃣ persist locally */
  await orders.updateOne(
    { slug },
    { $set: { buyer: { name, email, phone } } }
  );

  return NextResponse.json({ ok: true });
}
