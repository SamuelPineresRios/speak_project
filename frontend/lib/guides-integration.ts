import { readDB} from "@/lib/db";

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

export function getRecommendedGuides(
  concepts: string[],
  cefrLevel?: string
): any[] {
  if (concepts.length === 0) return [];

  const db = readDB();
  const guides = db.guides || [];

  // Filtrar guías que coincidan con los conceptos detectados
  let recommended = guides.filter((guide: any) => {
    const hasRelevantConcept = guide.concept_tags.some((tag: string) =>
      concepts.includes(tag)
    );

    const matchesCefr = cefrLevel
      ? guide.cefr_level === cefrLevel ||
      (guide.cefr_level <= cefrLevel && cefrLevel >= "A2")
      : true;

    return hasRelevantConcept && matchesCefr;
  });

  // Limitar a 3 recomendaciones
  return recommended.slice(0, 3).map((guide: any) => ({
    id: guide.id,
    title: guide.title,
    concept_connection: guide.concept_tags.filter((tag: string) =>
      concepts.includes(tag)
    ),
    cover_emoji: guide.cover_emoji,
    estimated_minutes: guide.estimated_minutes,
  }));
}
