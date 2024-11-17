import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request, { params }: { params: { date: string } }) {
  const date = params.date
  const client = await clientPromise
  const db = client.db('journal')
  const entry = await db.collection('entries').findOne({ date })
  return NextResponse.json(entry || { date, content: '' })
}