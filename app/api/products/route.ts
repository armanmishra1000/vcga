import { NextRequest, NextResponse } from 'next/server';
import { mongo } from '../../../lib/mongo';

/**
 * POST { slug }
 * Returns { items:[{title,price,description?,imageUrl?}], total, currency, sessionId }
 * Items come directly from the stored order document.
 */
export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const order = await mongo
    .db('checkout')
    .collection('orders')
    .findOne({ slug });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // If this is a legacy single-item order, fabricate an items array.
  const items =
    order.items ??
    [{ title: order.title, price: order.price }];

  const total = items.reduce(
    (sum: number, it: any) => sum + Number(it.price),
    0,
  );

  return NextResponse.json({
    items,
    total,
    currency : order.currency ?? 'usd',
    sessionId: order.sessionId,
  });
}
