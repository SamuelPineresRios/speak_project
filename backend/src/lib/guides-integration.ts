/**
 * Integración entre la evaluación de una misión y las guías de estudio.
 *
 * A partir de las estructuras detectadas por la IA se derivan «conceptos» y se
 * recomiendan hasta 3 guías que los trabajan.
 */
import { db } from '../db/client.ts'
import { guides } from '../db/schema.ts'

/** Traducción de estructura detectada -> etiqueta de concepto de guía. */
const CONCEPT_MAP: Record<string, string> = {
  'present-simple': 'present-simple',
  'past-simple': 'past-simple',
  'present-perfect': 'present-perfect',
  'phrasal-verbs': 'phrasal-verbs',
  negotiation: 'negotiation',
  'conversation-skills': 'conversation-skills',
  'modal-verbs': 'modal-verbs',
  conditionals: 'conditionals',
  'passive-voice': 'passive-voice',
  'reported-speech': 'reported-speech',
  future: 'future',
  would: 'would-like',
  'would like': 'would-like',
  "i'd like": 'would-like',
  irregular: 'irregular-verbs',
  verb: 'verb-usage',
  preposition: 'prepositions',
  grammar: 'grammar',
}

export function detectConceptsInResponse(detectedStructures: string[]): string[] {
  const concepts = new Set<string>()

  for (const structure of detectedStructures) {
    const lower = structure.toLowerCase()
    for (const [key, concept] of Object.entries(CONCEPT_MAP)) {
      if (lower.includes(key)) concepts.add(concept)
    }
  }

  return Array.from(concepts)
}

export interface RecommendedGuide {
  id: string
  title: string
  concept_connection: string[]
  cover_emoji: string | null
  estimated_minutes: number | null
}

export async function getRecommendedGuides(
  concepts: string[],
  cefrLevel?: string,
): Promise<RecommendedGuide[]> {
  if (concepts.length === 0) return []

  const allGuides = await db.select().from(guides)

  // 5 de las 9 guías no traen concept_tags (usan `concepts` en su lugar):
  // sin el null-check este filtro lanzaba y las recomendaciones se perdían
  // en silencio.
  const recommended = allGuides.filter(guide => {
    const tags = guide.concept_tags ?? []
    const hasRelevantConcept = tags.some(tag => concepts.includes(tag))

    const matchesCefr = cefrLevel
      ? guide.cefr_level === cefrLevel ||
        (guide.cefr_level !== null && guide.cefr_level <= cefrLevel && cefrLevel >= 'A2')
      : true

    return hasRelevantConcept && matchesCefr
  })

  return recommended.slice(0, 3).map(guide => ({
    id: guide.id,
    title: guide.title,
    concept_connection: (guide.concept_tags ?? []).filter(tag => concepts.includes(tag)),
    cover_emoji: guide.cover_emoji,
    estimated_minutes: guide.estimated_minutes,
  }))
}
