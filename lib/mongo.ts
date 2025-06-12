import { MongoClient } from 'mongodb';

/**
 * Re-use the MongoClient across hot-reloads in dev.
 * Works for both local dev and Vercel serverless.
 */
const globalForMongo = global as unknown as { mongo?: MongoClient };

export const mongo =
  globalForMongo.mongo || new MongoClient(process.env.MONGODB_URI!);

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.mongo = mongo;
}
