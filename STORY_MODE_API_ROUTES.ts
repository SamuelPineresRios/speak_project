// ===================================================================
// STORY MODE - API ROUTES
// ===================================================================

// 1. `/api/story/evaluate` - frontend/app/api/story/evaluate.ts
// Main endpoint for validating story scene responses
// ===================================================================

import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

interface EvaluationRequest {
  user_response: string
  scene_id: string
  story_id: string
  student_level: 'A1' | 'A2' | 'B1' | 'B2'
  attempt_number: number
}

export async function POST(req: NextRequest) {
  try {
    const body: EvaluationRequest = await req.json()
    const {
      user_response,
      scene_id,
      story_id,
      student_level,
      attempt_number,
    } = body

    // 1. Load scene data from stories.json (or DB)
    const sceneData = await loadSceneData(scene_id)
    if (!sceneData) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      )
    }

    // 2. Build evaluation prompt for OpenRouter
    const evaluationPrompt = buildEvaluationPrompt(
      user_response,
      sceneData,
      student_level,
      attempt_number
    )

    // 3. Call OpenRouter for detailed evaluation
    const aiEvaluation = await callOpenRouterForEvaluation(
      evaluationPrompt
    )

    // 4. Post-process and calculate scores
    const scores = calculateScores(aiEvaluation, student_level)

    // 5. Determine approval
    const isApproved = shouldApproveResponse(scores, student_level)

    // 6. Generate character reaction
    const characterReaction = isApproved
      ? sceneData.character_reactions.advance
      : attempt_number === 3
        ? sceneData.character_reactions.confusion
        : sceneData.character_reactions.pause

    // 7. If approved, generate next message for progression
    let npcNextMessage = ''
    if (isApproved && !sceneData.is_final_scene) {
      npcNextMessage = await generateNPCContinuation(
        sceneData,
        user_response
      )
    }

    // 8. Return comprehensive evaluation
    return NextResponse.json({
      is_approved: isApproved,
      quality_score: scores.quality,
      context_relevance: scores.context,
      grammar_score: scores.grammar,
      vocabulary_score: scores.vocabulary,
      naturalness_score: scores.naturalness,
      feedback: aiEvaluation.feedback,
      context_validation: {
        is_contextually_appropriate: scores.context > 0.6,
        relevance_explanation: aiEvaluation.context_explanation,
      },
      character_reaction: characterReaction,
      npc_next_message: npcNextMessage,
      attempt_number,
    })
  } catch (error) {
    console.error('Story evaluation error:', error)
    return NextResponse.json(
      { error: 'Evaluation failed', details: String(error) },
      { status: 500 }
    )
  }
}

// Helper: Build detailed evaluation prompt for AI
function buildEvaluationPrompt(
  userResponse: string,
  scene: any,
  studentLevel: string,
  attemptNumber: number
) {
  const levelGuidelines: Record<string, string> = {
    A1: `
Expected level: A1 (Beginner)
- Use very simple vocabulary
- Short sentences (3-7 words expected)
- Present simple tense primarily
- Should answer the question directly
- Flexibility on grammar, but clarity is key
    `,
    A2: `
Expected level: A2 (Elementary)
- Simple vocabulary, some common adjectives
- Sentences of 5-12 words
- Present and past simple tenses
- Should be contextually relevant
- Grammar errors acceptable if meaning is clear
    `,
    B1: `
Expected level: B1 (Intermediate)
- Varied vocabulary, some complex constructions
- Sentences of 8-15 words with connectors
- Multiple tenses used appropriately
- Must be contextually appropriate
- Good grammar expected with minor errors tolerated
    `,
    B2: `
Expected level: B2 (Upper-intermediate/Advanced)
- Sophisticated vocabulary, idioms acceptable
- Complex sentence structures, discourse markers
- All tenses used correctly and naturally
- Excellent contextual relevance required
- Near-native naturalness expected
    `,
  }

  return `
You are evaluating a language learner's response in a story-based learning scenario.

CONTEXT:
Scene Title: "${scene.title}"
Character: "${scene.character_name}" (${scene.character_role})
NPC said: "${scene.character_opening_dialogue}"
Objective: "${scene.objective}"
Student Level: ${studentLevel}
Attempt Number: ${attemptNumber}

STUDENT RESPONSE:
"${userResponse}"

EXPECTED RESPONSE TYPES:
High quality examples:
${scene.expected_responses.high_quality.map((r) => `- "${r}"`).join('\n')}

Acceptable examples:
${scene.expected_responses.acceptable.map((r) => `- "${r}"`).join('\n')}

LEVEL GUIDELINES:
${levelGuidelines[studentLevel]}

EVALUATION CRITERIA:
1. **Grammar Score** (1-5): Assess grammar usage for this level
2. **Vocabulary Score** (1-5): Assess vocabulary complexity and appropriateness
3. **Naturalness Score** (1-5): Does it sound natural/native-like?
4. **Context Relevance Score** (1-5): Does it properly answer the NPC's question/prompt?
5. **Overall Quality** (1-5): General impression

RETURN JSON OBJECT WITH:
{
  "grammar_score": number,
  "vocabulary_score": number,
  "naturalness_score": number,
  "context_score": number,
  "quality_score": number,
  "is_contextually_appropriate": boolean,
  "context_explanation": "Why or why not contextually appropriate",
  "feedback": {
    "positive_aspects": ["What went well"],
    "areas_to_improve": ["What could be better"],
    "specific_corrections": [
      {
        "original": "phrase from student response",
        "corrected": "better way to say it",
        "reason": "Why this is better",
        "alternative_options": ["option1", "option2"]
      }
    ],
    "nativelike_suggestions": [
      {
        "current_phrase": "what they said",
        "native_alternative": "more natural way",
        "explanation": "Why this sounds more native"
      }
    ]
  }
}

IMPORTANT:
- Be encouraging but honest
- Provide specific, actionable feedback
- Reference the expected responses for this level
- Consider attempt number (be more lenient on attempt 1, stricter on attempt 3+)
- Focus on communication success first, perfection second (especially for A1-A2)
  `
}

// Helper: Call OpenRouter API for evaluation
async function callOpenRouterForEvaluation(prompt: string) {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vox.app',
        'X-Title': 'VOX Story Mode',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText}`
    )
  }

  const result = await response.json()
  if (!result.choices?.[0]?.message?.content) {
    throw new Error('Invalid response from OpenRouter')
  }

  try {
    return JSON.parse(result.choices[0].message.content)
  } catch (_) {
    console.error('Failed to parse OpenRouter response')
    throw new Error('Failed to parse evaluation response')
  }
}

// Helper: Calculate normalized scores
function calculateScores(
  aiEvaluation: any,
  studentLevel: string
) {
  // Normalize AI scores (1-5 scale) to 0-1 scale
  const grammar = (aiEvaluation.grammar_score || 3) / 5
  const vocabulary = (aiEvaluation.vocabulary_score || 3) / 5
  const naturalness = (aiEvaluation.naturalness_score || 3) / 5
  const context = (aiEvaluation.context_score || 3) / 5
  const quality = (aiEvaluation.quality_score || 3) / 5

  return {
    grammar,
    vocabulary,
    naturalness,
    context,
    quality,
  }
}

// Helper: Determine if response should be approved
function shouldApproveResponse(
  scores: {
    grammar: number
    vocabulary: number
    naturalness: number
    context: number
    quality: number
  },
  studentLevel: string
) {
  const rubrics: Record<
    string,
    { threshold: number; min_context: number }
  > = {
    A1: { threshold: 0.7, min_context: 0.5 },
    A2: { threshold: 0.75, min_context: 0.6 },
    B1: { threshold: 0.8, min_context: 0.8 },
    B2: { threshold: 0.85, min_context: 0.9 },
  }

  const rubric = rubrics[studentLevel] || rubrics.A2
  const averageScore =
    (scores.grammar + scores.vocabulary + scores.naturalness) / 3

  // Must meet both: average score threshold AND context relevance
  return (
    averageScore >= rubric.threshold &&
    scores.context >= rubric.min_context
  )
}

// Helper: Load scene data
async function loadSceneData(sceneId: string) {
  try {
    // In production, fetch from DB
    // For MVP, load from stories.json
    const response = await fetch(
      new URL('@/data/stories.json', import.meta.url).href
    )
    const data = await response.json()

    return data.scenes.find((s: any) => s.id === sceneId)
  } catch (error) {
    console.error('Failed to load scene data:', error)
    return null
  }
}

// Helper: Generate next NPC message for continuation
async function generateNPCContinuation(
  scene: any,
  userResponse: string
) {
  const prompt = `
You are playing ${scene.character_name}, a character in a language learning story.
The student just said: "${userResponse}"

Your job is to acknowledge their response positively and move the scenario forward.

Context: ${scene.narrative_context}
Your personality: ${scene.character_personality.join(', ')}

Generate a SHORT (1-2 sentences) natural response that:
1. Acknowledges what they said
2. Moves the story forward
3. Is appropriate for their level
4. Could lead to a new question or scenario

Respond ONLY with the character's dialogue, in Spanish.
  `

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      }),
    }
  )

  const result = await response.json()
  return result.choices?.[0]?.message?.content || ''
}


// 2. `/api/story/guidance` - Generate pre-response modal content
// ===================================================================

import { NextRequest, NextResponse } from 'next/server'

interface GuidanceRequest {
  scene_id: string
  student_level: 'A1' | 'A2' | 'B1' | 'B2'
  last_npc_message: string
}

export async function POST(req: NextRequest) {
  try {
    const body: GuidanceRequest = await req.json()
    const { scene_id, student_level, last_npc_message } = body

    // Load scene to get pre-built guidance
    const scene = await loadSceneData(scene_id)
    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      )
    }

    // Return guidance from scene definition
    // (Pre-built during scene creation for consistency)
    return NextResponse.json({
      key_verbs: scene.guidance.key_verbs,
      key_adjectives: scene.guidance.key_adjectives,
      key_nouns: scene.guidance.key_nouns,
      grammar_tips: scene.guidance.grammar_tips,
      sentence_starters: scene.guidance.sentence_starters,
      register_notes: scene.guidance.register_notes,
    })
  } catch (error) {
    console.error('Guidance generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate guidance' },
      { status: 500 }
    )
  }
}


// 3. `/api/story/progress` - Update story progress
// ===================================================================

import { NextRequest, NextResponse } from 'next/server'

interface ProgressUpdateRequest {
  student_id: string
  story_id: string
  current_scene_id: string
  response_id: string
  quality_score: number
  is_approved: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body: ProgressUpdateRequest = await req.json()
    const {
      student_id,
      story_id,
      current_scene_id,
      response_id,
      quality_score,
      is_approved,
    } = body

    if (!is_approved) {
      // If not approved, don't update progress
      return NextResponse.json({
        progress_updated: false,
        next_scene: null,
        reason: 'Response not approved, stay in current scene',
      })
    }

    // Load all scenes for this story
    const stories = await loadStoriesData()
    const story = stories.find((s: any) => s.id === story_id)
    const allScenes = stories
      .filter((s: any) => s.id === story_id)
      .flatMap((s: any) => s.scenes)
    
    const currentScene = allScenes.find((s: any) => s.id === current_scene_id)
    const currentSceneOrder = currentScene?.order || 0

    // Find next scene
    const nextScene = allScenes.find(
      (s: any) => s.order === currentSceneOrder + 1
    )
    const isStoryCompleted = !nextScene

    // Update progress in DB/JSON
    const progressData = {
      student_id,
      story_id,
      current_scene_id: nextScene?.id || current_scene_id,
      current_scene_order: nextScene?.order || currentSceneOrder,
      scenes_completed: [
        ...new Array(currentSceneOrder).fill(null).map((_, i) => i + 1),
        currentSceneOrder,
      ],
      status: isStoryCompleted ? 'completed' : 'in_progress',
      average_quality_score: quality_score,
      updated_at: new Date().toISOString(),
    }

    // Save to DB (implementation depends on your DB)
    // await db.storyProgress.update(progressData)

    return NextResponse.json({
      progress_updated: true,
      next_scene: nextScene || null,
      story_completed: isStoryCompleted,
      completion_stats: {
        scenes_completed: currentSceneOrder,
        average_quality: quality_score,
        total_scenes: allScenes.length,
      },
    })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// Helper: Load all stories
async function loadStoriesData() {
  try {
    const response = await fetch(
      new URL('@/data/stories.json', import.meta.url).href
    )
    const data = await response.json()
    return data.stories
  } catch (error) {
    console.error('Failed to load stories:', error)
    return []
  }
}
