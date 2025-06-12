import { NextRequest, NextResponse } from 'next/server';
import { mongo } from '../../../lib/mongo';

/* Always run on the Node runtime (required for the Mongo driver) */
export const runtime = 'nodejs';

const coll = mongo.db('checkout').collection('products');

// ─────────── GET: list all products ───────────
export async function GET() {
  const list = await coll.find().sort({ createdAt: -1 }).toArray();

  // stringify ObjectId so JSON is 100 % safe
  const safe = list.map(({ _id, ...rest }) => ({
    _id: _id.toString(),
    ...rest,
  }));

  return NextResponse.json(safe);
}

// ─────────── POST: add a product ───────────
export async function POST(req: NextRequest) {
  const {
    title,
    price,
    description = '',
    imageUrl = '',
  } = await req.json();

  if (!title || !price) {
    return NextResponse.json(
      { error: 'Missing title or price' },
      { status: 400 },
    );
  }

  const doc = await coll.insertOne({
    title,
    price: Number(price),
    description,
    imageUrl,
    createdAt: new Date(),
  });

  return NextResponse.json({
    _id: doc.insertedId.toString(),
    title,
    price: Number(price),
    description,
    imageUrl,
  });
}
