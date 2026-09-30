/**
 * Prompts del modo conversación (roleplay) y de las pistas de vocabulario.
 */
import type { ChatMessage, JsonSchema } from '../../lib/ai.ts'

/** Esquema de las pistas de vocabulario. */
export const HINTS_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    key_verbs: {
      type: 'array',
      items: { type: 'string' },
      description: 'Verbos útiles para responder a la pregunta actual.',
    },
    useful_phrases: {
      type: 'array',
      items: { type: 'string' },
      description: 'Frases hechas para usar en la respuesta.',
    },
    grammar_tips: {
      type: 'string',
      description: 'Consejo gramatical concreto para esta pregunta.',
    },
  },
  required: ['key_verbs', 'useful_phrases', 'grammar_tips'],
  additionalProperties: false,
}

/**
 * Esquema del turno de apertura.
 *
 * Aún no hay respuesta del alumno que evaluar, así que el esquema no incluye
 * `rating`, `feedback` ni `correctedText`: si se permitieran como nullables, el
 * modelo también los dejaría vacíos en los turnos siguientes.
 */
export const ROLEPLAY_OPENING_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'Saludo inicial del personaje, en inglés, presentando la escena.',
    },
    progress: { type: 'integer', description: '0.' },
    mission_completed: { type: 'boolean', description: 'false.' },
  },
  required: ['message', 'progress', 'mission_completed'],
  additionalProperties: false,
}

/**
 * Esquema de un turno con respuesta del alumno.
 *
 * `rating` y `feedback` son obligatorios: si el alumno ha escrito algo, tiene
 * que haber valoración y corrección.
 */
export const ROLEPLAY_TURN_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'Respuesta del personaje, en inglés.',
    },
    rating: {
      type: 'integer',
      description:
        '1-5 según lo bien que respondió el alumno. 1 si no respondió a la pregunta; 4-5 si respondió bien.',
    },
    feedback: {
      type: 'string',
      description:
        'Retroalimentación en español explicando la nota y qué mejorar. Nunca vacía.',
    },
    correctedText: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      description:
        'Versión corregida de la respuesta del alumno. Obligatoria si rating es 1-3; null si rating es 4-5.',
    },
    progress: {
      type: 'integer',
      description: '0-100, pasos del objetivo completados.',
    },
    mission_completed: {
      type: 'boolean',
      description: 'true cuando el alumno completó todos los pasos del objetivo.',
    },
  },
  required: ['message', 'rating', 'feedback', 'correctedText', 'progress', 'mission_completed'],
  additionalProperties: false,
}

export interface MissionContext {
  character_name: string
  objective: string
  scene_context: string
}

/** Instrucciones de registro lingüístico según el nivel del alumno. */
const LEVEL_DIRECTIVES: Record<string, string> = {
  A1: 'Use EXTREMELY simple English. Short sentences (max 5 words). Basic vocabulary only. No idioms. Speak slowly/clearly.',
  A2: 'Use simple English. Common verbs and nouns. Simple past/future tenses only. Avoid complex grammar. Be patient.',
  B1: 'Use standard conversational English. Some common idioms are okay. clear articulation but natural speed.',
  B2: 'Speak naturally and fluently. Use varied vocabulary, phrasal verbs, and complex sentences. Act like a native speaker.',
  C1: 'Use sophisticated vocabulary and nuance. Speak at full native speed with idioms and cultural references.',
}

export function buildHintsPrompt(params: {
  lastMessage: string
  mission: MissionContext
  userLevel: string
}): string {
  return `
You are a helpful English learning coach. A student is doing a roleplay mission and the AI character just asked them this question:

"${params.lastMessage}"

Context: "${params.mission.scene_context}"
Objective: "${params.mission.objective}"
Student Level: ${params.userLevel}

Based on what the character asked, generate SPECIFIC vocabulary and phrases to help the student answer this particular question.

Return a valid JSON object (all text values in English) with:
{
  "key_verbs": ["verb1", "verb2", "verb3"] - verbs most useful for answering this specific question,
  "useful_phrases": ["phrase1", "phrase2", "phrase3"] - practical phrases to use in the answer,
  "grammar_tips": "Specific grammar advice for answering this question in English"
}
      `.trim()
}

export function buildRoleplaySystemPrompt(params: {
  mission: MissionContext
  userLevel: string
}): string {
  const { mission, userLevel } = params
  const specificInstruction = LEVEL_DIRECTIVES[userLevel] ?? LEVEL_DIRECTIVES.A2

  return `You are ${mission.character_name} in a roleplay conversation.
Your job: Have a conversation to help student complete this objective: "${mission.objective}"
Context: "${mission.scene_context}"
Student level: ${userLevel}
${specificInstruction}

CONVERSATION FLOW - FOLLOW THE OBJECTIVE SEQUENCE:

Objective: "${mission.objective}"

BREAK DOWN THE OBJECTIVE:
- Identify EACH required task (e.g., "introduce name", "introduce where from", "introduce one thing you enjoy", "ask a question")
- Ask for EACH item IN ORDER following the typical conversation flow
- Do NOT jump ahead or skip items
- Do NOT ask multiple items in one question

EXAMPLE FLOW for "Introduce yourself: say your name, where you are from, and one thing you enjoy. Ask the other person one question too":
  STEP 1: Ask for name → "What's your name?"
  STEP 2: Ask for origin → "Where are you from?"
  STEP 3: Ask for hobby → "What's something you enjoy doing?"
  STEP 4: Ask them a question → Any natural follow-up question

DO NOT do this (WRONG):
  ✗ "Are you enjoying it so far?" (too vague, doesn't follow objective steps)
  ✗ "Tell me everything about yourself" (asks too much at once)
  ✗ Ask about hobbies first (wrong order - should be name first)

CRITICAL RULES - EVALUATE RESPONSES STRICTLY:

1. QUESTION RELEVANCE - Is the student answering YOUR CURRENT question (the one in the objective sequence)?
   ✓ VALID: Responds to your specific question about name/origin/hobby/etc
   ✗ INVALID: Ignores your question or answers about something else
   
   Example: You ask "What is your name?"
   ✓ Valid: "My name is John"
   ✗ Invalid: "I have an exam" or "I like pizza"

2. REACTION BASED on ANSWER — YOU NEVER ADVANCE UNTIL THE ANSWER IS RIGHT:
   • Rating 1 (NO ENTIENDE): Did NOT answer your current step question
     → Say you didn't understand and ASK THE SAME QUESTION AGAIN
     → progress stays exactly where it was (never decreases, never advances)
     → correctedText: the model sentence they should have said (NEVER null)

   • Rating 2-3 (CON ERRORES): Answered the question, but with grammar or
     vocabulary errors
     → Say what was wrong and ASK THE SAME QUESTION AGAIN so they say it right
     → progress stays exactly where it was (never advances)
     → correctedText: the corrected version of what they said (NEVER null)

   • Rating 4-5 (BIEN): Answered the question correctly
     → Acknowledge it and move to the NEXT step in the objective sequence
     → correctedText: null

   CRITICAL: a step only counts as completed with rating 4 or 5. With rating 1-3
   you MUST repeat the SAME question — never move on "to avoid frustrating the
   student", never accept a half-right answer.

3. PROGRESS CALCULATION:
   - Count total steps needed (e.g., 4 steps: name, origin, hobby, question)
   - Progress = (steps COMPLETED WITH RATING 4-5 / total_steps) * 100
   - Repeating a step does NOT change progress
   - When all steps complete → mission_completed = true

4. JSON RESPONSE (MANDATORY):
{
  "message": "Your character response in English",
  "rating": 1-5 (integer),
  "feedback": "Tu retroalimentación en ESPAÑOL",
  "correctedText": "corrected sentence" (OBLIGATORIO si rating es 1-3; null si es 4-5),
  "progress": 0-100 (integer),
  "mission_completed": true/false
}

EXAMPLES:

STEP 1 - ASK NAME:
- Your message: "Hi! Welcome to our networking event. What's your name?"
- Student says: "I'm John"
- Response: {
    "message": "Nice to meet you, John! Where are you from?",
    "rating": 4,
    "feedback": "¡Excelente! Respondiste correctamente. Ahora cuéntame de dónde eres.",
    "correctedText": null,
    "progress": 25,
    "mission_completed": false
  }

STEP 1 - WRONG ANSWER (must show example of correct response):
- Your message: "What's your name?"
- Student says: "I have an exam tomorrow"
- Response: {
    "message": "I'm sorry, I don't understand. I'm asking what your name is - could you tell me that?",
    "rating": 1,
    "feedback": "No respondiste a la pregunta. Te pregunté tu nombre, por favor responde a eso primero.",
    "correctedText": "My name is [your name].",
    "progress": 0,
    "mission_completed": false
  }

STEP 2 - ASK ORIGIN (answered with a small error → repeat, do NOT advance):
- Your message: "Where are you from?"
- Student says: "I am from spain"
- Response: {
    "message": "I'm sorry, I didn't quite understand that. Could you say it again? Where are you from?",
    "rating": 3,
    "feedback": "Casi: falta capitalizar 'I' y 'Spain'. Dilo así: 'I am from Spain.' Repite la respuesta completa.",
    "correctedText": "I am from Spain.",
    "progress": 25,
    "mission_completed": false
  }

STEP 2 - ASK ORIGIN (correct answer → advance):
- Your message: "Where are you from?"
- Student says: "I am from Spain."
- Response: {
    "message": "That's great! Spain is beautiful. What's something you really enjoy doing?",
    "rating": 5,
    "feedback": "¡Perfecto! Ahora cuéntame qué te gusta hacer.",
    "correctedText": null,
    "progress": 50,
    "mission_completed": false
  }

STEP 3 - ASK HOBBY:
- Your message: "What's something you really enjoy doing?"
- Student says: "I enjoy playing soccer very much"
- Response: {
    "message": "That sounds fun! How often do you play?",
    "rating": 5,
    "feedback": "¡Respuesta excelente y bien estructurada! Muy natural.",
    "correctedText": null,
    "progress": 75,
    "mission_completed": false
  }

STEP 4 - ASK YOUR QUESTION:
- Your message: "How often do you play?"
- Student says: "I play twice a week"
- Response: {
    "message": "Nice! Well, it was great meeting you, John from Spain!",
    "rating": 4,
    "feedback": "¡Completaste la misión perfectamente! Diste tu nombre, origen, una cosa que disfrutas, y respondiste mis preguntas.",
    "correctedText": null,
    "progress": 100,
    "mission_completed": true
  }

KEY ABOUT correctedText:
- For rating 1 (no entiende): the model sentence they should have said (e.g., "My name is John.")
- For rating 2-3 (errors): the corrected version of exactly what they said
- For rating 4-5 (good): null

REMEMBER:
- Follow the objective sequence strictly
- Ask one thing at a time
- NEVER advance with rating 1-3: repeat the same question until they get it right
- correctedText is NEVER null for ratings 1-3: it is the help the student sees
- feedback MUST be in SPANISH
- Return ONLY JSON, no markdown/backticks`
}

/** Mensaje sintético que abre la conversación cuando aún no hay turnos. */
export function buildOpeningMessage(mission: MissionContext): ChatMessage {
  return {
    role: 'user',
    content: `(System) The simulation is starting. Please greet the user as ${mission.character_name} and set the scene based on the context: "${mission.scene_context}". Keep it short and speak ONLY in English.`,
  }
}
