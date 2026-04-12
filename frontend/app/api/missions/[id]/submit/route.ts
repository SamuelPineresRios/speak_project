import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB, findById, generateId, getWeekStart } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import { CEFR_THRESHOLDS } from '@/lib/utils'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

const SYSTEM_PROMPT_BASE = `You are an expert English language evaluator for Latin American Spanish-speaking students learning English.
Your job: evaluate a student's written English response in a communicative mission context and provide CONSTRUCTIVE feedback.

CRITICAL RULES:
1. Be GENEROUS with ADVANCE judgments — prioritize communicative success over perfection
2. Evaluate COMMUNICATIVE EFFECTIVENESS above all — not grammatical perfection
3. Feedback must sound like a native Spanish-speaking English teacher giving friendly advice
4. Return ONLY valid JSON — no markdown, no explanation, no preamble
5. feedback_text MUST follow this exact 3-part structure (separated by \\n\\n):
   PART 1 (2 sentences max): Narrative result — did the character understand/achieve the objective?
   PART 2 (2 sentences max): One thing the student did correctly — quote their exact words
   PART 3 (2-3 sentences max): ONE single improvement with a corrected example sentence

SCORING GUIDELINES:
- Score based on UNDERSTANDING and COMMUNICATIVE INTENT first, grammar second
- A1/A2: Accept basic but correct responses. Core meaning is key.
- B1: Accept mostly correct with minor errors
- B2: Accept well-formed responses with natural flow

JUDGMENT CALCULATION (AUTOMATIC):
1. Calculate comprehensibility_score based on how well the message was understood
2. Then AUTOMATICALLY apply this logic:
   - A1: judgment = "ADVANCE" if comprehensibility_score >= 55, else "PAUSE"
   - A2: judgment = "ADVANCE" if comprehensibility_score >= 65, else "PAUSE"
   - B1: judgment = "ADVANCE" if comprehensibility_score >= 75, else "PAUSE"
   - B2: judgment = "ADVANCE" if comprehensibility_score >= 80, else "PAUSE"

KEY: If student answered the question correctly, comprehensibility_score should be AT LEAST 70+.

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
    const { response_text, group_id, time_taken_seconds } = await req.json()
    if (!response_text?.trim()) return NextResponse.json({ error: 'response_text required' }, { status: 400 })

    const missionId = params.id

    // Try to fetch mission from Supabase first, then fallback to local DB
    let mission: any = null
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data } = await supabase
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single()
        
        if (data) {
          mission = data
        }
      } catch (e) {
        console.log('[Submit] Supabase fallback to local DB')
      }
    }

    // Fallback to local DB if not found in Supabase
    if (!mission) {
      const db = readDB()
      mission = findById(db.missions, missionId)
    }

    if (!mission) {
      console.error('[Submit] Mission not found:', missionId)
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // Try to fetch user from Supabase first, then fallback to local DB
    let user: any = null
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (data) {
          user = data
        }
      } catch (e) {
        console.log('[Submit] User fetch from Supabase failed, using local DB')
      }
    }

    // Fallback to local DB if not found in Supabase
    if (!user) {
      const db = readDB()
      user = findById(db.users, userId)
    }

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

EVALUATION INSTRUCTIONS:
1. Read the response carefully
2. Determine: Did the student answer the question/objective? YES or NO?
3. If YES: comprehensibility_score should be 65-100 → judgment = "ADVANCE"
4. If NO or unclear: comprehensibility_score should be 0-60 → judgment = "PAUSE"
5. grammar_score and lexical_richness_score are secondary - based on actual performance
6. For feedback_text - be encouraging and constructive

Remember: Your job is to help students succeed, not to fail them. If they answered correctly (even with errors), they should ADVANCE.`

      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vox.app", 
          "X-Title": "VOX Evaluation"
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
      transcript: responseRecord.input_mode === 'audio' ? (responseRecord.transcript ?? null) : null,
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

    // Also update Supabase narrative_states if configured
    if (supabaseUrl && supabaseKey && completed) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const existingState = await supabase
          .from('narrative_states')
          .select('id')
          .eq('student_id', userId)
          .eq('mission_id', params.id)
          .single()
        
        if (existingState.data) {
          // Update existing record
          await supabase
            .from('narrative_states')
            .update({
              state: 'completed',
              character_reaction: 'positive',
              scene_position: 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingState.data.id)
          console.log('[Submit] Updated narrative_state in Supabase:', existingState.data.id)
        } else {
          // Insert new record
          await supabase
            .from('narrative_states')
            .insert([{
              student_id: userId,
              mission_id: params.id,
              group_id: group_id ?? null,
              state: 'completed',
              character_reaction: 'positive',
              scene_position: 1,
              updated_at: new Date().toISOString()
            }])
          console.log('[Submit] Inserted narrative_state to Supabase')
        }
      } catch (e) {
        console.log('[Submit] Could not update Supabase narrative_states:', e)
        // Continue anyway - we already saved to local DB
      }
    }

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
