import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const evaluationId = params.id
    const db = readDB()
    const evaluation = findById(db.evaluations, evaluationId)

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ evaluation })
  } catch (e) {
    console.error('[Evaluation Get] Error:', e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
