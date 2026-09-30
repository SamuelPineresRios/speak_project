import { NextRequest, NextResponse } from 'next/server'
import { and, eq, sql, type SQL } from 'drizzle-orm'
import { getDb } from '@/lib/postgres'
import { guides, type CefrLevel } from '@/lib/schema'
import { isAuthFailure, requireUser } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requireUser(request)
    if (isAuthFailure(session)) return session

    const query = getDb().select().from(guides)

    // Filtros: ?cefr_level=B1 y ?concept_tag=present-perfect
    const { searchParams } = new URL(request.url)
    const cefrLevel = searchParams.get('cefr_level')
    const conceptTag = searchParams.get('concept_tag')

    const conditions: SQL[] = []
    if (cefrLevel) conditions.push(eq(guides.cefr_level, cefrLevel as CefrLevel))
    if (conceptTag) {
      // concept_tags es jsonb; equivalente al `contains` de PostgREST (`@>`).
      conditions.push(sql`${guides.concept_tags} @> ${JSON.stringify([conceptTag])}::jsonb`)
    }

    const data = conditions.length
      ? await query.where(and(...conditions))
      : await query

    return NextResponse.json({ guides: data })
  } catch (e) {
    console.error('[Guides API] Error:', e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
