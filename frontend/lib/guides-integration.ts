import { getDb } from "@/lib/postgres";
import { guides } from "@/lib/schema";

export function detectConceptsInResponse(
  detectedStructures: string[],
  missionId?: string,
  storyId?: string
): string[] {
  const conceptMap: { [key: string]: string } = {
    "present-simple": "present-simple",
    "past-simple": "past-simple",
    "present-perfect": "present-perfect",
    "phrasal-verbs": "phrasal-verbs",
    "negotiation": "negotiation",
    "conversation-skills": "conversation-skills",
    "modal-verbs": "modal-verbs",
    "conditionals": "conditionals",
    "passive-voice": "passive-voice",
    "reported-speech": "reported-speech",
    future: "future",
    would: "would-like",
    "would like": "would-like",
    "i'd like": "would-like",
    irregular: "irregular-verbs",
    verb: "verb-usage",
    preposition: "prepositions",
    grammar: "grammar",
  };

  const concepts = new Set<string>();

  detectedStructures.forEach((structure) => {
    const lower = structure.toLowerCase();
    Object.keys(conceptMap).forEach((key) => {
      if (lower.includes(key)) {
        concepts.add(conceptMap[key]);
      }
    });
  });

  return Array.from(concepts);
}

export async function getRecommendedGuides(
  concepts: string[],
  cefrLevel?: string
): Promise<any[]> {
  if (concepts.length === 0) return [];

  // 5 de las 9 guías no traen concept_tags (usan `concepts` en su lugar):
  // sin el optional chaining este filtro lanzaba y las recomendaciones
  // se perdían en silencio.
  const db = await getDb();
  const allGuides = await db.select().from(guides);

  // Filtrar guías que coincidan con los conceptos detectados
  let recommended = allGuides.filter((guide) => {
    const tags = guide.concept_tags ?? [];
    const hasRelevantConcept = tags.some((tag) => concepts.includes(tag));

    const matchesCefr = cefrLevel
      ? guide.cefr_level === cefrLevel ||
      (guide.cefr_level !== null && guide.cefr_level <= (cefrLevel as any) && cefrLevel >= "A2")
      : true;

    return hasRelevantConcept && matchesCefr;
  });

  // Limitar a 3 recomendaciones
  return recommended.slice(0, 3).map((guide) => ({
    id: guide.id,
    title: guide.title,
    concept_connection: (guide.concept_tags ?? []).filter((tag) =>
      concepts.includes(tag)
    ),
    cover_emoji: guide.cover_emoji,
    estimated_minutes: guide.estimated_minutes,
  }));
}
