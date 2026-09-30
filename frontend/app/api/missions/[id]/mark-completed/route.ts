import { NextRequest, NextResponse } from 'next/server'
import { and, count, eq, inArray } from 'drizzle-orm'
import { generateId } from '@/lib/db'
import { getDb } from '@/lib/postgres'
import { missions, narrative_states, users, type CefrLevel } from '@/lib/schema'
import { isAuthFailure, requireUser } from '@/lib/session'

// Hasta B2: `CefrLevel` sólo admite A1..B2 y no existen misiones ni guías de C1,
// así que ascender a C1 dejaría al alumno sin progresión posible.
const CEFR_PROGRESSION: CefrLevel[] = ['A1', 'A2', 'B1', 'B2']

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string
  try {
    const authSession = await requireUser(req)
    if (isAuthFailure(authSession)) return authSession
    userId = authSession.userId
    const { group_id } = await req.json().catch(() => ({}))

    const db = getDb()

    // Sin esta comprobación, un mission_id inexistente provocaba una violación
    // de clave foránea (500) en lugar de un 404 entendible.
    const [mission] = await db
      .select({ id: missions.id })
      .from(missions)
      .where(eq(missions.id, params.id))
      .limit(1)
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // El estado narrativo vive en PostgreSQL; el upsert aprovecha la
    // restricción UNIQUE (student_id, mission_id).
    await db
      .insert(narrative_states)
      .values({
        id: generateId(),
        student_id: userId,
        mission_id: params.id,
        group_id: group_id ?? null,
        state: 'completed',
        character_reaction: 'positive',
        scene_position: 1,
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: [narrative_states.student_id, narrative_states.mission_id],
        set: {
          state: 'completed',
          character_reaction: 'positive',
          scene_position: 1,
          group_id: group_id ?? null,
          updated_at: new Date(),
        },
      })

    // Check if user should be promoted to next level
    try {
      const [user] = await db
        .select({ cefr_level: users.cefr_level })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      const currentLevel = user?.cefr_level
      if (currentLevel) {
        const currentLevelIndex = CEFR_PROGRESSION.indexOf(currentLevel)

        if (currentLevelIndex < CEFR_PROGRESSION.length - 1) {
          const levelMissions = await db
            .select({ id: missions.id })
            .from(missions)
            .where(eq(missions.cefr_level, currentLevel))

          const totalMissions = levelMissions.length
          let completed = 0

          if (totalMissions > 0) {
            const [row] = await db
              .select({ value: count() })
              .from(narrative_states)
              .where(
                and(
                  eq(narrative_states.student_id, userId),
                  eq(narrative_states.state, 'completed'),
                  inArray(
                    narrative_states.mission_id,
                    levelMissions.map((m) => m.id)
                  )
                )
              )
            completed = row?.value ?? 0
          }

          if (totalMissions > 0 && completed >= totalMissions) {
            const nextLevel = CEFR_PROGRESSION[currentLevelIndex + 1]
            await db
              .update(users)
              .set({ cefr_level: nextLevel })
              .where(eq(users.id, userId))
            console.log(`[MarkCompleted] User promoted from ${currentLevel} to ${nextLevel}`)
          }
        }
      }
    } catch (e) {
      console.error('[MarkCompleted] Error checking promotions:', e)
      // Don't fail the mission completion if promotion check fails
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MarkCompleted]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
