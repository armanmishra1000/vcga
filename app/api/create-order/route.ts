import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { mongo } from '../../../lib/mongo';              // 👈 NEW

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST /api/create-order   { title, price, currency? }
export async function POST(req: NextRequest) {
  try {
    const { title, price, currency = 'usd' } = await req.json();
    if (!title || !price) {
      return NextResponse.json({ error: 'Missing title or price' }, { status: 400 });
    }

    const slug = nanoid(6);                              // e.g. "OJONb-"

    // 1️⃣  Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(Number(price) * 100),
            product_data: { name: title },
          },
          quantity: 1,
        },
      ],
      metadata: { slug },
      success_url: `https://pay.vcga.uk/success?slug=${slug}`,
      cancel_url:  `https://pay.vcga.uk/cancel?slug=${slug}`,
    });

    // 2️⃣  Store a “pending” order document in MongoDB
    await mongo.db('checkout').collection('orders').insertOne({
      slug,
      title,
      price: Number(price),
      currency,
      status: 'pending',
      sessionId: session.id,
      createdAt: new Date(),
    });

    // 3️⃣  Return slug & Stripe URL to the admin UI
    return NextResponse.json({ slug, sessionUrl: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Server error', detail: err.message }, { status: 500 });
  }
}
