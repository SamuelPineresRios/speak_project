import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const responseId = params.id
    const db = readDB()
    const response = findById(db.responses, responseId)

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ response })
  } catch (e) {
    console.error('[Response Get] Error:', e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
