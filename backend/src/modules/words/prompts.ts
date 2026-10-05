/**
 * Prompt y esquema de la ficha de una palabra.
 *
 * La ficha se genera con salida estructurada, así que el modelo devuelve
 * siempre el mismo JSON: traducción, categoría gramatical, formas verbales y
 * ejemplos de uso.
 */
import type { JsonSchema } from '../../lib/ai.ts'

export const WORD_SYSTEM_PROMPT = `Eres un diccionario inglés-español para estudiantes hispanohablantes.

Recibes una palabra en inglés y la frase donde aparece. Devuelve su ficha:

- translation: la traducción al español de la palabra TAL COMO SE USA en esa frase.
- part_of_speech: la categoría en inglés, una de: verb, noun, adjective, adverb, pronoun, preposition, conjunction, interjection, phrase.
- present, past, past_participle: las formas verbales en inglés. Si la palabra no es un verbo, los tres van en null.
- examples: 2 o 3 frases en inglés que usen la palabra en ese sentido, cada una con su traducción al español. Frases naturales y útiles para un estudiante.

Responde siempre en JSON válido, sin texto adicional.`

export const WORD_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    translation: {
      type: 'string',
      description: 'Traducción al español según el uso en la frase.',
    },
    part_of_speech: {
      type: 'string',
      description: 'Categoría gramatical en inglés, p. ej. verb o noun.',
    },
    present: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      description: 'Forma en presente (infinitivo sin "to"); null si no es verbo.',
    },
    past: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      description: 'Pasado simple; null si no es verbo.',
    },
    past_participle: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      description: 'Pasado participio; null si no es verbo.',
    },
    examples: {
      type: 'array',
      // Sin minItems/maxItems: la salida estructurada de Anthropic sólo admite
      // 0 o 1, y rechaza la petición entera con un 400. La cantidad se pide en
      // la descripción y el servicio recorta a 3 por si acaso.
      items: {
        type: 'object',
        properties: {
          en: { type: 'string', description: 'Frase en inglés.' },
          es: { type: 'string', description: 'Su traducción al español.' },
        },
        required: ['en', 'es'],
        additionalProperties: false,
      },
      description: 'Dos o tres frases de ejemplo con su traducción.',
    },
  },
  required: ['translation', 'part_of_speech', 'present', 'past', 'past_participle', 'examples'],
  additionalProperties: false,
}
