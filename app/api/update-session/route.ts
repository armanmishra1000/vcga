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

    /* 2️⃣ ensure we have a PaymentIntent ID */
    let paymentIntentId: string = order.paymentIntentId;
    if (!paymentIntentId) {
      const sess = await stripe.checkout.sessions.retrieve(order.sessionId);
      paymentIntentId = sess.payment_intent as string;
      await orders.updateOne({ slug }, { $set: { paymentIntentId } });
    }

    /* 3️⃣ update Session metadata (optional) */
    await stripe.checkout.sessions.update(order.sessionId, {
      metadata: {
        buyer_name : name,
        buyer_email: email,
        buyer_phone: phone,
        slug,
      },
    }).catch(() => {});           // ignore if this fails

    /* 4️⃣ update PaymentIntent metadata (shows on Charge) */
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        buyer_name : name,
        buyer_email: email,
        buyer_phone: phone,
        slug,
      },
    });

    /* 5️⃣ persist locally */
    await orders.updateOne(
      { slug },
      { $set: { buyer: { name, email, phone } } }
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('update-session error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
