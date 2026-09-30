import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB, generateId, getWeekStart } from '@/lib/db'
import { completeChat } from '@/lib/ai'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/postgres'
import { missions as missionsTable, users as usersTable, narrative_states } from '@/lib/schema'
import { isAuthFailure, requireUser } from '@/lib/session'
import { getRecommendedGuides, detectConceptsInResponse } from '@/lib/guides-integration'
import { CEFR_THRESHOLDS } from '@/lib/utils'

// Helper function to validate if response is serious/genuine
function isGenuineResponse(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  
  // Reject if too short
  if (normalized.length < 3) return false
  if (normalized.split(/\s+/).length < 2) return false
  
  // Reject common nonsense patterns
  const nonsensePatterns = [
    /^(haha|hehe|lol|test|aaa+|bbb+|ccc+|zzz+|xxx+|123+|456+|789+|000+)$/,
    /^(hi+|bye+|ok+|yes+|no+)$/,
    /^(.)\1{4,}$/, // 5+ of same character
  ]
  
  for (const pattern of nonsensePatterns) {
    if (pattern.test(normalized)) return false
  }
  
  // Reject if only numbers or special chars
  if (!/[a-zA-Z]/.test(text)) return false
  
  return true
}

const SYSTEM_PROMPT_BASE = `You are an expert English language evaluator for Latin American Spanish-speaking students learning English.
Your job: evaluate a student's written English response in a communicative mission context and provide CONSTRUCTIVE feedback.

🚫 VALIDATION RULES (REJECT IMMEDIATELY):
- Response is too short (< 5 words/characters in English): REJECT with comprehensibility_score = 10, judgment = "PAUSE"
- Response is nonsense/gibberish (HAHA, test, aaaaaa, etc): REJECT with comprehensibility_score = 15, judgment = "PAUSE"
- Response does NOT answer the objective/question asked: REJECT with comprehensibility_score = 20, judgment = "PAUSE"
- Response is in the WRONG LANGUAGE (not English): REJECT with comprehensibility_score = 5, judgment = "PAUSE"

CRITICAL SCORING RULES:
1. FIRST check: Does the response attempt to answer the objective? YES = continue evaluating, NO = automatic PAUSE
2. Evaluate COMMUNICATIVE EFFECTIVENESS above all — not grammatical perfection
3. Feedback must sound like a native Spanish-speaking English teacher
4. Return ONLY valid JSON — no markdown, no explanation, no preamble
5. feedback_text MUST follow this exact 3-part structure (separated by \\n\\n):
   PART 1 (2 sentences max): Narrative result — did the character understand/achieve the objective?
   PART 2 (2 sentences max): One thing the student did correctly
   PART 3 (2-3 sentences max): ONE specific improvement with corrected example

SCORING GUIDELINES:
- Minimum score for ANY valid attempt: 50 (must answer the question meaningfully)
- Score based on UNDERSTANDING and COMMUNICATIVE INTENT first, grammar second
- A1/A2: Accept basic but correct responses. Core meaning is key.
- B1: Accept mostly correct with minor errors
- B2: Accept well-formed responses with natural flow

JUDGMENT CALCULATION (AUTOMATIC):
1. Validate content quality first (reject if nonsense/off-topic)
2. Calculate comprehensibility_score (0-100) based on how well the message answers the objective
3. Apply this logic:
   - A1: judgment = "ADVANCE" if comprehensibility_score >= 55, else "PAUSE"
   - A2: judgment = "ADVANCE" if comprehensibility_score >= 65, else "PAUSE"
   - B1: judgment = "ADVANCE" if comprehensibility_score >= 75, else "PAUSE"
   - B2: judgment = "ADVANCE" if comprehensibility_score >= 80, else "PAUSE"

KEY: Valid answer to objective = minimum comprehensibility_score of 55+. Invalid/gibberish = comprehensibility_score < 30.

RETURN ONLY THIS JSON STRUCTURE:
{
  "comprehensibility_score": <integer 0-100>,
  "grammar_score": <integer 0-100>,
  "lexical_richness_score": <integer 0-100>,
  "judgment": "ADVANCE" or "PAUSE",
  "feedback_text": "<string>",
  "detected_structures": ["<string>"]
}`

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string

  try {
    const session = await requireUser(req)
    if (isAuthFailure(session)) return session
    userId = session.userId

    const { response_text, group_id, time_taken_seconds } = await req.json()
    if (!response_text?.trim()) return NextResponse.json({ error: 'response_text required' }, { status: 400 })

    const missionId = params.id

    const [mission] = await getDb()
      .select()
      .from(missionsTable)
      .where(eq(missionsTable.id, missionId))
      .limit(1)

    if (!mission) {
      console.error('[Submit] Mission not found:', missionId)
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    const [user] = await getDb()
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1)

    const cefrLevel = user?.cefr_level ?? 'B1'
    const langPref = user?.language_preference ?? 'es'

    // Read DB for saving responses and narrative states
    const db = readDB()

    // Save response
    const responseRecord = {
      id: generateId(),
      mission_id: params.id,
      student_id: userId,
      group_id: group_id ?? null,
      text_content: response_text.trim(),
      input_mode: 'text',
      transcript: null,
      time_taken_seconds: time_taken_seconds ?? null,
      submitted_at: new Date().toISOString(),
    }
    db.responses.push(responseRecord)

    // Validate if response is genuine/serious (not gibberish like "HAHA")
    if (!isGenuineResponse(response_text)) {
      console.log('[Submit] Rejected non-genuine response:', response_text.substring(0, 50))
      
      const evaluation = {
        comprehensibility_score: 15,
        grammar_score: 10,
        lexical_richness_score: 5,
        judgment: 'PAUSE' as const,
        feedback_text: `Tu respuesta debe ser seria y tener sentido. Escribe una respuesta completa que responda a la pregunta.`,
        detected_structures: [],
      }
      
      // Save evaluation
      const evalRecord = {
        id: generateId(),
        response_id: responseRecord.id,
        comprehensibility_score: evaluation.comprehensibility_score,
        grammar_score: evaluation.grammar_score,
        lexical_richness_score: evaluation.lexical_richness_score,
        judgment: evaluation.judgment as 'ADVANCE' | 'PAUSE',
        feedback_text: evaluation.feedback_text,
        detected_structures: evaluation.detected_structures,
        transcript: null,
        evaluated_at: new Date().toISOString(),
      }
      db.evaluations.push(evalRecord)
      db.responses[db.responses.length - 1] = { ...db.responses[db.responses.length - 1], status: 'in_progress' }
      writeDB(db)
      
      return NextResponse.json({
        response_id: responseRecord.id,
        evaluation_id: evalRecord.id,
        judgment: evaluation.judgment,
        comprehensibility_score: evaluation.comprehensibility_score,
        feedback_text: evaluation.feedback_text,
        correctedText: 'Por favor intenta de nuevo con una respuesta seria.',
        progress: 0,
        mission_completed: false,
      })
    }

    // Call evaluation service via Gemini/OpenRouter (replacing original external python service)
    let evaluation: any

    try {
      const t0 = Date.now()
      
      const levelCriteria = {
        'A1': 'Accept basic responses with simple structures. Focus: Can you understand the core meaning? Grammar perfection is NOT required.',
        'A2': 'Accept mostly correct responses with minor errors. Focus: Is the message clear? Minor grammar errors are OK.',
        'B1': 'Accept well-formed responses with natural flow. Minor errors acceptable if meaning is clear.',
        'B2': 'Expect more sophisticated language. Minor errors still acceptable if communication is successful.'
      }
      
      const prompt = `EVALUATION TASK - ${cefrLevel} Level Student

Student Profile:
- CEFR Level: ${cefrLevel}
- Evaluation Criteria: ${levelCriteria[cefrLevel as keyof typeof levelCriteria] || levelCriteria['B1']}

Mission Details:
- Objective: ${mission.objective}
- Scene: ${mission.scene_context}
- Feedback Language: ${langPref} (Spanish)

Student's Response to Evaluate:
"""${response_text.trim()}"""

EVALUATION INSTRUCTIONS (STRICT):
1. Read the response carefully
2. Does it answer the OBJECTIVE/QUESTION asked? 
   - YES → Evaluate quality (65-100 comprehensibility)
   - NO → Reject with PAUSE judgment (20-40 comprehensibility)
3. Quality Scoring:
   - If YES answer: comprehensibility_score 65-100 → judgment = "ADVANCE"
   - If NO/unclear answer: comprehensibility_score 10-60 → judgment = "PAUSE"
4. grammar_score and lexical_richness_score are secondary
5. For feedback_text - be encouraging but honest about whether they answered the question

Critical: A response must ACTUALLY ANSWER THE QUESTION to get a high score. If the response doesn't address the objective, judgment = "PAUSE".`

      const aiContent = await completeChat({
        messages: [
          { role: "system", content: SYSTEM_PROMPT_BASE },
          { role: "user", content: prompt }
        ],
        jsonMode: true,
      });

      evaluation = JSON.parse(aiContent);
      
      console.log(`[Eval] ${Date.now() - t0}ms judgment=${evaluation.judgment} score=${evaluation.comprehensibility_score}`)
    } catch (e) {
      console.error('[Eval] Fallback:', e)
      evaluation = {
        comprehensibility_score: 65, grammar_score: 60, lexical_richness_score: 55,
        judgment: 'PAUSE',
        feedback_text: `Recibimos tu mensaje, pero hubo un problema técnico al evaluarlo. ¡Tu respuesta fue guardada! Intenta de nuevo para continuar la historia.`,
        detected_structures: [],
      }
    }

    // Save evaluation
    const evalRecord = {
      id: generateId(),
      response_id: responseRecord.id,
      comprehensibility_score: evaluation.comprehensibility_score,
      grammar_score: evaluation.grammar_score,
      lexical_richness_score: evaluation.lexical_richness_score,
      judgment: evaluation.judgment as 'ADVANCE' | 'PAUSE',
      feedback_text: evaluation.feedback_text,
      detected_structures: evaluation.detected_structures ?? [],
      transcript: responseRecord.input_mode === 'audio' ? (responseRecord.transcript ?? null) : null,
      evaluated_at: new Date().toISOString(),
    }
    db.evaluations.push(evalRecord)

    // Update narrative state
    const threshold = CEFR_THRESHOLDS[cefrLevel] ?? 70
    // Accept completion either when the model explicitly judges ADVANCE
    // or when the numeric comprehensibility score meets the threshold.
    const completed = (evaluation.judgment === 'ADVANCE') || (evaluation.comprehensibility_score >= threshold)

    // Update response status so group assignment views can detect completion
    const respIdx = db.responses.findIndex(r => r.id === responseRecord.id)
    if (respIdx >= 0) {
      db.responses[respIdx] = { ...db.responses[respIdx], status: (completed ? 'completed' : 'in_progress') }
    }

    // Update weekly aggregates
    const weekStartDate = getWeekStart()
    const existingAggIdx = db.weekly_aggregates.findIndex(
      a => a.student_id === userId && a.week_start_date === weekStartDate
    )
    const timeTaken = time_taken_seconds ?? 0
    if (existingAggIdx >= 0) {
      const agg = db.weekly_aggregates[existingAggIdx]
      const newCompleted = completed ? agg.missions_completed + 1 : agg.missions_completed
      db.weekly_aggregates[existingAggIdx] = {
        ...agg,
        total_writing_time_seconds: agg.total_writing_time_seconds + timeTaken,
        missions_completed: newCompleted,
        avg_comprehensibility: completed
          ? ((agg.avg_comprehensibility ?? 0) * agg.missions_completed + evaluation.comprehensibility_score) / (newCompleted || 1)
          : agg.avg_comprehensibility,
        updated_at: new Date().toISOString(),
      }
    } else {
      db.weekly_aggregates.push({
        id: generateId(),
        student_id: userId,
        group_id: group_id ?? null,
        week_start_date: weekStartDate,
        total_writing_time_seconds: timeTaken,
        missions_completed: completed ? 1 : 0,
        avg_comprehensibility: completed ? evaluation.comprehensibility_score : null,
        updated_at: new Date().toISOString(),
      })
    }

    writeDB(db)

    // El estado narrativo vive en PostgreSQL. El upsert aprovecha la
    // restricción UNIQUE (student_id, mission_id), de modo que un mismo envío
    // concurrente no puede duplicar filas.
    try {
      await getDb()
        .insert(narrative_states)
        .values({
          id: generateId(),
          student_id: userId,
          mission_id: params.id,
          group_id: group_id ?? null,
          state: completed ? 'completed' : 'paused',
          character_reaction: completed ? 'positive' : 'confused',
          scene_position: completed ? 1 : 0,
          updated_at: new Date(),
        })
        .onConflictDoUpdate({
          target: [narrative_states.student_id, narrative_states.mission_id],
          set: {
            state: completed ? 'completed' : 'paused',
            character_reaction: completed ? 'positive' : 'confused',
            scene_position: completed ? 1 : 0,
            updated_at: new Date(),
          },
        })
    } catch (e) {
      // La respuesta y su evaluación ya están persistidas: el estado narrativo
      // no debe tirarse abajo el envío completo.
      console.error('[Submit] Could not upsert narrative_states:', e)
    }

    // Get guide recommendations based on detected structures (defensive)
    let recommendedGuides: any[] = []
    try {
      const detectedConcepts = detectConceptsInResponse(evaluation.detected_structures || [])
      recommendedGuides = await getRecommendedGuides(detectedConcepts, cefrLevel)
    } catch (e) {
      console.error('[GuidesIntegration] failed', e)
      recommendedGuides = []
    }

    return NextResponse.json({
      response_id: responseRecord.id,
      evaluation_id: evalRecord.id,
      judgment: evaluation.judgment,
      evaluation,
      recommended_guides: recommendedGuides,
    })
  } catch (err) {
    console.error('[Submit] error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 })
  }
}
