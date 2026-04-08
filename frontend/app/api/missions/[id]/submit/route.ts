import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB, findById, generateId, getWeekStart } from '@/lib/db'
import { CEFR_THRESHOLDS } from '@/lib/utils'

function getOpenRouterApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }
  return apiKey;
}

const SYSTEM_PROMPT_BASE = `You are an expert English language evaluator for Latin American Spanish-speaking students learning English.
Your job: evaluate a student's written English response in a communicative mission context.

CRITICAL RULES:
1. Evaluate COMMUNICATIVE EFFECTIVENESS above all — not grammatical perfection
2. Feedback must sound like a native Spanish-speaking English teacher giving friendly advice
3. Return ONLY valid JSON — no markdown, no explanation, no preamble
4. feedback_text MUST follow this exact 3-part structure (separated by \\n\\n):
   PART 1 (2 sentences max): Narrative result — did the character understand/achieve the objective?
   PART 2 (2 sentences max): One thing the student did correctly — quote their exact words
   PART 3 (2-3 sentences max): ONE single improvement with a corrected example sentence

JUDGMENT THRESHOLDS BY LEVEL:
- A1: ADVANCE if comprehensibility_score >= 60
- A2: ADVANCE if comprehensibility_score >= 70
- B1: ADVANCE if comprehensibility_score >= 80
- B2: ADVANCE if comprehensibility_score >= 85

COMPREHENSIBILITY (most important score):
- A1/A2: Is the core meaning intelligible despite errors? YES = high score
- B1: Is the message clear and mostly accurate?
- B2: Is the message precise, well-structured, appropriate register?

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
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const OPENROUTER_API_KEY = getOpenRouterApiKey();
    const { response_text, group_id, time_taken_seconds } = await req.json()
    if (!response_text?.trim()) return NextResponse.json({ error: 'response_text required' }, { status: 400 })

    const db = readDB()
    const mission = findById(db.missions, params.id)
    if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })

    const user = findById(db.users, userId)
    const cefrLevel = user?.cefr_level ?? 'B1'
    const langPref = user?.language_preference ?? 'es'

    // Save response
    const responseRecord = {
      id: generateId(),
      mission_id: params.id,
      student_id: userId,
      group_id: group_id ?? null,
      text_content: response_text.trim(),
      time_taken_seconds: time_taken_seconds ?? null,
      submitted_at: new Date().toISOString(),
    }
    db.responses.push(responseRecord)

    // Call evaluation service via Gemini/OpenRouter (replacing original external python service)
    let evaluation: any

    try {
      const t0 = Date.now()
      
      const prompt = `Evaluation Context:
Student CEFR Level: ${cefrLevel}
Mission Objective: ${mission.objective}
Scene Context: ${mission.scene_context}
Language for Feedback: ${langPref}

Response to Evaluate:
"""${response_text.trim()}"""

Evaluate this response according to the ${cefrLevel} criteria.`

      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://speak-mvp.com", 
          "X-Title": "Speak MVP Evaluation"
        },
        body: JSON.stringify({
          "model": "google/gemini-2.0-flash-001",
          "messages": [
            { role: "system", content: SYSTEM_PROMPT_BASE },
            { role: "user", content: prompt }
          ],
          "response_format": { "type": "json_object" }
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      evaluation = JSON.parse(aiData.choices[0].message.content);
      
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
      evaluated_at: new Date().toISOString(),
    }
    db.evaluations.push(evalRecord)

    // Update narrative state
    const threshold = CEFR_THRESHOLDS[cefrLevel] ?? 70
    // Accept completion either when the model explicitly judges ADVANCE
    // or when the numeric comprehensibility score meets the threshold.
    const completed = (evaluation.judgment === 'ADVANCE') || (evaluation.comprehensibility_score >= threshold)
    const existingStateIdx = db.narrative_states.findIndex(n => n.student_id === userId && n.mission_id === params.id)
    const narrativeState = {
      id: existingStateIdx >= 0 ? db.narrative_states[existingStateIdx].id : generateId(),
      student_id: userId,
      mission_id: params.id,
      group_id: group_id ?? null,
      state: (completed ? 'completed' : 'paused') as 'completed' | 'paused',
      character_reaction: completed ? 'positive' : 'confused',
      scene_position: completed ? 1 : 0,
      updated_at: new Date().toISOString(),
    }
    if (existingStateIdx >= 0) db.narrative_states[existingStateIdx] = narrativeState
    else db.narrative_states.push(narrativeState)

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

    // Get guide recommendations based on detected structures (defensive)
    let recommendedGuides: any[] = []
    try {
      const { detectConceptsInResponse, getRecommendedGuides } = require('@/lib/guides-integration')
      const detectedConcepts = detectConceptsInResponse(evaluation.detected_structures || [])
      recommendedGuides = getRecommendedGuides(detectedConcepts, cefrLevel)
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
    const details = err && (err as any).stack ? (err as any).stack : undefined
    // Return safe error info for local debugging
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 })
  }
}
