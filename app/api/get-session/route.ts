import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST /api/get-session   { "slug": "OJONb-" }
export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    /** ----------------------------------------------------------------
     * Stripe doesn’t have a public “search Checkout Sessions” API yet,
     * so we list the most-recent sessions and scan for the slug.
     * ---------------------------------------------------------------- */
    const list = await stripe.checkout.sessions.list({ limit: 100 });

    const match = list.data.find(
      (s) => (s.metadata?.slug || '') === slug
    );

    if (!match) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sessionId: match.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Server error', detail: err.message },
      { status: 500 }
    );
  }
}
