import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { mongo } from '../../../lib/mongo';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST body: { items:[{ _id,title,price }], currency? }
export async function POST(req: NextRequest) {
  try {
    const { items = [], currency = 'usd' } = await req.json();
    if (items.length === 0) {
      return NextResponse.json({ error: 'No items supplied' }, { status: 400 });
    }

    const slug = nanoid(6);

    const line_items = items.map((it: any) => ({
      price_data: {
        currency,
        unit_amount: Math.round(Number(it.price) * 100),
        product_data: { name: it.title },
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      metadata: { slug },
      success_url: `https://pay.vcga.uk/success?slug=${slug}`,
      cancel_url : `https://pay.vcga.uk/cancel?slug=${slug}`,
    });

    await mongo.db('checkout').collection('orders').insertOne({
      slug,
      items,
      currency,
      status   : 'pending',
      sessionId: session.id,
      paymentIntentId: session.payment_intent,         // 👈 store it
      createdAt: new Date(),
    });

    return NextResponse.json({ slug, sessionUrl: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
