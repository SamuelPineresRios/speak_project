/**
 * Etiquetas en español de la categoría gramatical que devuelve la IA.
 *
 * La ficha guarda la categoría en inglés (`verb`, `noun`...) porque es la
 * clave con la que trabaja el modelo; aquí se traduce para mostrarla.
 */
const POS_LABELS: Record<string, { singular: string; plural: string }> = {
  verb: { singular: 'Verbo', plural: 'Verbos' },
  noun: { singular: 'Sustantivo', plural: 'Sustantivos' },
  adjective: { singular: 'Adjetivo', plural: 'Adjetivos' },
  adverb: { singular: 'Adverbio', plural: 'Adverbios' },
  pronoun: { singular: 'Pronombre', plural: 'Pronombres' },
  preposition: { singular: 'Preposición', plural: 'Preposiciones' },
  conjunction: { singular: 'Conjunción', plural: 'Conjunciones' },
  interjection: { singular: 'Interjección', plural: 'Interjecciones' },
  phrase: { singular: 'Frase', plural: 'Frases' },
}

/** Etiqueta legible de una categoría; si es desconocida, se capitaliza tal cual. */
export function posLabel(partOfSpeech: string, plural = true): string {
  const entry = POS_LABELS[partOfSpeech.toLowerCase()]
  if (entry) return plural ? entry.plural : entry.singular
  const fallback = partOfSpeech.replace(/_/g, ' ')
  return fallback.charAt(0).toUpperCase() + fallback.slice(1)
}
