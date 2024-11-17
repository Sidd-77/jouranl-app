import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  const client = await clientPromise
  const db = client.db('journal')
  const entries = await db.collection('entries').find({}, { projection: { date: 1, content: { $substr: ['$content', 0, 100] } } }).sort({ date: -1 }).toArray()
  return NextResponse.json(entries)
}

export async function POST(request: Request) {
  const { date, content } = await request.json()
  const client = await clientPromise
  const db = client.db('journal')
  const result = await db.collection('entries').updateOne(
    { date },
    { $set: { content } },
    { upsert: true }
  )
  return NextResponse.json(result)
}