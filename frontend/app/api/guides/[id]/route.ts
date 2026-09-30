import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/postgres'
import { guides } from '@/lib/schema'
import { isAuthFailure, requireUser } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireUser(request)
    if (isAuthFailure(session)) return session

    const [guide] = await getDb()
      .select()
      .from(guides)
      .where(eq(guides.id, params.id))
      .limit(1)

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
    }

    // `content` viaja como jsonb con la forma completa que consume la UI
    // (introduction, definition, key_structures, exercises, ...), así que la
    // fila se devuelve tal cual.
    return NextResponse.json({ guide })
  } catch (e) {
    console.error('[Guides Get] Error:', e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
