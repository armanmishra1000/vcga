import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // secret key already set in Vercel

// POST /api/get-session   { "slug": "X7F4K3" }
export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    // ───────────────────────────────────────────────────────────────
    // Stripe’s JS runtime already supports checkout.sessions.search(),
    // but the current TypeScript defs don’t have it. We silence TS here.
    // @ts-ignore
    const found = await stripe.checkout.sessions.search({
      query: `metadata['slug']:'${slug}'`,
      limit: 1,
    });
    // ───────────────────────────────────────────────────────────────

    if (found.data.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionId = found.data[0].id; // e.g. "cs_test_a1F…"

    return NextResponse.json({ sessionId });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Server error', detail: err.message },
      { status: 500 },
    );
  }
}
