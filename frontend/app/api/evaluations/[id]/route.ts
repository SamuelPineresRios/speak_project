import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'
import { forbidden, isAuthFailure, ownsResource, requireUser } from '@/lib/session'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireUser(req)
    if (isAuthFailure(session)) return session

    const evaluationId = params.id
    const db = readDB()
    const evaluation = findById(db.evaluations, evaluationId)

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      )
    }

    // An evaluation is only visible to the student who produced the response
    // and to their teachers.
    const response = findById(db.responses, evaluation.response_id)
    if (!ownsResource(session, response?.student_id, ['teacher'])) {
      return forbidden()
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
