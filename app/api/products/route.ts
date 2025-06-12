import { NextRequest, NextResponse } from 'next/server';
import { mongo } from '../../../lib/mongo';

const coll = mongo.db('checkout').collection('products');

// GET  ➜ list all products
// POST ➜ body { title:string, price:number }
export async function GET() {
  const list = await coll.find().sort({ createdAt: -1 }).toArray();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const { title, price } = await req.json();
  if (!title || !price) {
    return NextResponse.json({ error: 'Missing title or price' }, { status: 400 });
  }
  const doc = await coll.insertOne({
    title,
    price: Number(price),
    createdAt: new Date(),
  });
  return NextResponse.json({ _id: doc.insertedId, title, price });
}
