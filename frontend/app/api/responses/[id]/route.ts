import { NextRequest, NextResponse } from 'next/server'
import { readDB, findById } from '@/lib/db'
import { forbidden, isAuthFailure, ownsResource, requireUser } from '@/lib/session'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireUser(req)
    if (isAuthFailure(session)) return session

    const responseId = params.id
    const db = readDB()
    const response = findById(db.responses, responseId)

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    if (!ownsResource(session, response.student_id, ['teacher'])) {
      return forbidden()
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
