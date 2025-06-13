import { NextRequest, NextResponse } from 'next/server';
import { mongo } from '../../../lib/mongo';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

const coll = mongo.db('checkout').collection('products');

/* ─────────── GET: list all products ─────────── */
export async function GET() {
  const docs = await coll.find().sort({ createdAt: -1 }).toArray();
  const safe = docs.map(({ _id, ...rest }) => ({ _id: _id.toString(), ...rest }));
  return NextResponse.json(safe);
}

/* ─────────── POST: add a product ─────────── */
export async function POST(req: NextRequest) {
  const { title, price, description = '', imageUrl = '' } = await req.json();

  if (!title || !price) {
    return NextResponse.json({ error: 'Missing title or price' }, { status: 400 });
  }

  const doc = await coll.insertOne({
    title,
    price: Number(price),
    description,
    imageUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({
    _id: doc.insertedId.toString(),
    title,
    price: Number(price),
    description,
    imageUrl,
  });
}

/* ─────────── PUT: update a product ─────────── */
export async function PUT(req: NextRequest) {
  const { _id, title, price, description = '', imageUrl = '' } = await req.json();

  if (!_id || !title || !price) {
    return NextResponse.json(
      { error: 'Missing _id, title or price' },
      { status: 400 },
    );
  }

  let oid: ObjectId;
  try {
    oid = new ObjectId(_id);
  } catch {
    return NextResponse.json({ error: 'Invalid _id' }, { status: 400 });
  }

  const { matchedCount } = await coll.updateOne(
    { _id: oid },
    {
      $set: {
        title,
        price: Number(price),
        description,
        imageUrl,
        updatedAt: new Date(),
      },
    },
  );

  if (!matchedCount) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({
    _id,
    title,
    price: Number(price),
    description,
    imageUrl,
  });
}
