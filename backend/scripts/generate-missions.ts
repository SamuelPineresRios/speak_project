/**
 * Genera misiones nuevas para un nivel CEFR y las inserta en PostgreSQL.
 *
 *   npm run missions:generate -w @vox/backend -- --level A1 --count 11
 *   npm run missions:generate -w @vox/backend -- --level A1 --count 4 --dry
 *
 * Es reutilizable para cualquier nivel: el modelo recibe las misiones que ya
 * existen (para no repetir situaciones) y el formato exacto del proyecto.
 * La salida va con esquema JSON, así que llega siempre parseable; lo que el
 * esquema no garantiza (campos vacíos, diálogo sin turnos, títulos repetidos)
 * se valida aquí antes de insertar.
 */
import { eq } from 'drizzle-orm'
import { completeChat, type JsonSchema } from '../src/lib/ai.ts'
import { db, sql } from '../src/db/client.ts'
import { missions } from '../src/db/schema.ts'
import type { CefrLevel } from '@vox/shared'

/** Duración por nivel, en segundos (la misma que usan las misiones actuales). */
const DURATION_BY_LEVEL: Record<CefrLevel, number> = { A1: 180, A2: 150, B1: 120, B2: 90 }

/** Cuántas misiones se piden al modelo por llamada; lotes pequeños evitan truncados. */
const BATCH_SIZE = 4

const MISSION_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    missions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Título corto en ESPAÑOL.' },
          description: { type: 'string', description: 'Una frase en ESPAÑOL.' },
          objective: {
            type: 'string',
            description:
              'Qué debe lograr el alumno, en ESPAÑOL, con detalles concretos (nombres, horas, precios, cantidades).',
          },
          scene_context: {
            type: 'string',
            description: 'Dónde está y con quién habla, en ESPAÑOL, 1-2 frases.',
          },
          character_name: {
            type: 'string',
            description: 'Nombre del personaje que interpreta la IA, en INGLÉS (p. ej. "Barista").',
          },
          expected_outcome_indicator: {
            type: 'string',
            description: 'Resumen del logro en INGLÉS, muy corto.',
          },
          example_conversation: {
            type: 'string',
            description:
              'Diálogo de ejemplo en INGLÉS, 4-6 líneas, alternando "Person:" y "User:".',
          },
        },
        required: [
          'title',
          'description',
          'objective',
          'scene_context',
          'character_name',
          'expected_outcome_indicator',
          'example_conversation',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['missions'],
  additionalProperties: false,
}

interface GeneratedMission {
  title: string
  description: string
  objective: string
  scene_context: string
  character_name: string
  expected_outcome_indicator: string
  example_conversation: string
}

/** Dificultad y temas que debe seguir el modelo según el nivel. */
const LEVEL_GUIDANCE: Record<CefrLevel, string> = {
  A1: 'Very simple: present simple, basic questions, everyday vocabulary, short sentences. The student only has to say 2-4 short sentences in total.',
  A2: 'Simple past and future, common expressions, slightly longer answers.',
  B1: 'Varied tenses, opinions and explanations, natural conversation.',
  B2: 'Nuanced arguments, idioms, more complex situations.',
}

function buildPrompt(level: CefrLevel, count: number, existing: string[]): string {
  return `Create ${count} NEW English-learning missions for a CEFR ${level} student.

Each mission is a short real-life situation the student will play as a spoken/written roleplay with an AI character.

${LEVEL_GUIDANCE[level]}

FORMAT (respect it exactly):
- title, description, objective and scene_context: in SPANISH.
- character_name and example_conversation: in ENGLISH.
- objective must be concrete: include names, times, prices or quantities the student has to mention.
- example_conversation: 4-6 lines alternating "Person:" (the AI character) and "User:" (the student), in English.
- character_name: the person the AI plays (waiter, clerk, neighbour, nurse...), never "Assistant".

ALREADY USED SITUATIONS (do NOT repeat these or close variants):
${existing.map(title => `- ${title}`).join('\n')}

Pick ${count} DIFFERENT everyday situations that an ${level} student would face (shops, transport, home, health, social, services, food, plans...). Vary the places and the people.

Return ONLY the JSON.`
}

/** Comprueba lo que el esquema no garantiza antes de tocar la base de datos. */
function validate(missionsToCheck: GeneratedMission[], usedTitles: Set<string>): GeneratedMission[] {
  const valid: GeneratedMission[] = []

  for (const mission of missionsToCheck) {
    const fields = [
      mission.title,
      mission.description,
      mission.objective,
      mission.scene_context,
      mission.character_name,
      mission.expected_outcome_indicator,
      mission.example_conversation,
    ]
    if (fields.some(field => !field?.trim())) {
      console.warn(`  descartada "${mission.title ?? '?'}": tiene campos vacíos`)
      continue
    }

    const key = mission.title.trim().toLowerCase()
    if (usedTitles.has(key)) {
      console.warn(`  descartada "${mission.title}": título repetido`)
      continue
    }

    const lines = mission.example_conversation.split('\n').filter(line => line.trim())
    const hasUser = lines.some(line => /^user:/i.test(line.trim()))
    const hasOther = lines.some(line => !/^user:/i.test(line.trim()))
    if (lines.length < 4 || !hasUser || !hasOther) {
      console.warn(`  descartada "${mission.title}": diálogo de ejemplo incompleto`)
      continue
    }

    usedTitles.add(key)
    valid.push(mission)
  }

  return valid
}

function parseArgs(): { level: CefrLevel; count: number; dry: boolean } {
  const args = process.argv.slice(2)
  const level = (args[args.indexOf('--level') + 1] ?? 'A1').toUpperCase() as CefrLevel
  const count = Number(args[args.indexOf('--count') + 1] ?? 4)
  const dry = args.includes('--dry')

  if (!(level in DURATION_BY_LEVEL)) throw new Error(`Nivel no válido: ${level}`)
  if (!Number.isInteger(count) || count < 1 || count > 20) throw new Error(`Cantidad no válida: ${count}`)

  return { level, count, dry }
}

/** Siguiente id libre con el formato m-0NN del proyecto. */
function nextMissionId(existingIds: string[], offset: number): string {
  const numbers = existingIds
    .map(id => /^m-(\d+)$/.exec(id)?.[1])
    .filter((value): value is string => Boolean(value))
    .map(Number)
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1 + offset
  return `m-${String(next).padStart(3, '0')}`
}

async function main() {
  const { level, count, dry } = parseArgs()

  const existingRows = await db.select().from(missions).where(eq(missions.cefr_level, level))
  const allIds = (await db.select({ id: missions.id }).from(missions)).map(row => row.id)
  const usedTitles = new Set(existingRows.map(row => row.title.trim().toLowerCase()))

  console.log(`Nivel ${level}: ${existingRows.length} misiones actuales. Se piden ${count} nuevas.`)

  const created: GeneratedMission[] = []
  let remaining = count

  while (remaining > 0) {
    const batch = Math.min(BATCH_SIZE, remaining)
    console.log(`\nGenerando lote de ${batch}...`)

    const content = await completeChat({
      messages: [
        {
          role: 'user',
          // Se incluyen las ya creadas en esta ejecución: si no, cada lote
          // repite las situaciones de los anteriores.
          content: buildPrompt(level, batch, [
            ...existingRows.map(row => row.title),
            ...created.map(mission => mission.title),
          ]),
        },
      ],
      schema: MISSION_SCHEMA,
      maxTokens: 2600,
    })

    const parsed = JSON.parse(content) as { missions?: GeneratedMission[] }
    const valid = validate(parsed.missions ?? [], usedTitles)
    created.push(...valid)
    remaining -= valid.length

    if (valid.length === 0) {
      throw new Error('El modelo no devolvió ninguna misión utilizable')
    }
  }

  if (dry) {
    console.log('\n--- SIMULACRO (no se inserta nada) ---')
    for (const mission of created) {
      console.log(`\n${mission.title} [${level}]`)
      console.log(`  descripción: ${mission.description}`)
      console.log(`  objetivo:    ${mission.objective}`)
      console.log(`  escena:      ${mission.scene_context}`)
      console.log(`  personaje:   ${mission.character_name}`)
      console.log(`  logro:       ${mission.expected_outcome_indicator}`)
      console.log(`  diálogo:\n${mission.example_conversation.split('\n').map(l => '    ' + l).join('\n')}`)
    }
    return
  }

  const rows = created.map((mission, index) => ({
    id: nextMissionId(allIds, index),
    title: mission.title.trim(),
    description: mission.description.trim(),
    objective: mission.objective.trim(),
    scene_context: mission.scene_context.trim(),
    character_name: mission.character_name.trim(),
    expected_outcome_indicator: mission.expected_outcome_indicator.trim(),
    example_conversation: mission.example_conversation.trim(),
    cefr_level: level,
    base_duration_seconds: DURATION_BY_LEVEL[level],
  }))

  await db.insert(missions).values(rows)

  console.log(`\n${rows.length} misiones insertadas:`)
  for (const row of rows) console.log(`  ${row.id}  ${row.title}`)
}

main()
  .catch(error => {
    console.error('Error generando misiones:', error)
    process.exitCode = 1
  })
  .finally(() => sql.end({ timeout: 5 }))
