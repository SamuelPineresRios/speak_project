/**
 * Prompt de generación de la introducción narrativa.
 *
 * Parte de los datos de la misión y, si existe, de su conversación de ejemplo
 * (`missions.example_conversation`) para no inventar una situación distinta.
 */
import type { CefrLevel } from '@vox/shared'
import type { JsonSchema } from '../../lib/ai.ts'

/** Complexidad de la escena según el nivel; la introducción debe seguirlo. */
const CEFR_SCENE_GUIDANCE: Record<CefrLevel | 'C1', string> = {
  A1: 'Very short lines (3-6 words), everyday vocabulary, present simple, basic questions.',
  A2: 'Short lines (4-10 words), simple descriptions, basic past and future, common everyday expressions.',
  B1: 'Natural lines with varied tenses, opinions, explanations and experiences.',
  B2: 'More developed lines, some idiomatic expressions, arguments and nuances.',
  C1: 'Fluent and natural lines, specialised vocabulary where it fits, cultural nuances, advanced structures.',
}

export interface IntroductionSource {
  missionId: string
  title: string
  description: string | null
  objective: string | null
  sceneContext: string | null
  characterName: string | null
  cefrLevel: CefrLevel
  exampleConversation: string | null
  expectedOutcome: string | null
}

/** Esquema de la introducción que devuelve el modelo. */
export const INTRODUCTION_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    scene_title: {
      type: 'string',
      description: 'Título corto de la escena en español, p. ej. "En la agencia de viajes".',
    },
    scene_description: {
      type: 'string',
      description:
        'Cómo es el entorno y el ambiente, en español, 1-2 frases. Se usa como fondo de la escena.',
    },
    characters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', enum: ['A', 'B'], description: 'Referencia para las líneas.' },
          name: { type: 'string', description: 'Nombre del personaje.' },
          role: { type: 'string', description: 'Su papel en la escena, en español, p. ej. "Camarero".' },
          emoji: { type: 'string', description: 'Un emoji que lo represente.' },
          played_by: {
            type: 'string',
            enum: ['ai', 'student'],
            description: "'ai' lo interpretará el asistente; 'student' es el papel que asumirá el alumno.",
          },
        },
        required: ['id', 'name', 'role', 'emoji', 'played_by'],
        additionalProperties: false,
      },
    },
    lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          speaker: { type: 'string', enum: ['A', 'B'] },
          text: { type: 'string', description: 'Frase del personaje, en inglés.' },
          translation: { type: 'string', description: 'La misma frase traducida al español.' },
        },
        required: ['speaker', 'text', 'translation'],
        additionalProperties: false,
      },
    },
    useful_expressions: {
      type: 'array',
      items: { type: 'string', description: 'Expresión en inglés para la misión real.' },
      description: 'Entre 3 y 5 expresiones que el alumno necesitará.',
    },
  },
  required: ['scene_title', 'scene_description', 'characters', 'lines', 'useful_expressions'],
  additionalProperties: false,
}

export function buildIntroductionPrompt(source: IntroductionSource): string {
  const guidance = CEFR_SCENE_GUIDANCE[source.cefrLevel] ?? CEFR_SCENE_GUIDANCE.B1

  return `Create the OPENING SCENE of a learning mission, as a short dialogue between TWO characters that the student will watch before playing it themselves.

MISSION DATA
- Title: ${source.title}
- Description: ${source.description ?? '(none)'}
- Objective (what the student must achieve): ${source.objective ?? '(none)'}
- Scene: ${source.sceneContext ?? '(none)'}
- Character the AI will play: ${source.characterName ?? '(unnamed)'}
- CEFR level: ${source.cefrLevel}
- Expected outcome: ${source.expectedOutcome ?? '(none)'}

${source.exampleConversation ? `REFERENCE CONVERSATION provided by the teacher (follow its situation and the kind of phrases it uses, but you may improve the wording):\n${source.exampleConversation}` : 'There is no reference conversation: invent the scene from the mission data above.'}

RULES
1. Exactly TWO characters: one with played_by "ai" and one with played_by "student".
2. The character played_by "ai" MUST be named exactly "${source.characterName ?? 'Assistant'}". Never rename that character.
3. The character played_by "student" is a natural counterpart (customer, passenger, patient...). Never name it after the student.
4. 4 to 6 lines in total, alternating speakers, starting with the character played_by "ai" greeting the other.
5. The dialogue must END at the exact point where the student takes over: the character played_by "ai" has just asked something the student would answer. Do NOT resolve the objective.
6. Every line carries its Spanish translation, matching the English exactly in meaning (natural Spanish, not word by word).
7. useful_expressions: 3 to 5 phrases the student will actually need to achieve the objective. They must fit this mission, not be generic.
8. Level of complexity: ${guidance}
9. Write for a ${source.cefrLevel} student: the scene prepares, it does not test.
10. Return ONLY valid JSON.

Language note: the scene_title, scene_description, character roles and translations are in SPANISH; the lines' text and useful_expressions are in ENGLISH.`
}
