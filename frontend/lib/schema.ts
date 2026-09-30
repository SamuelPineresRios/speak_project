/**
 * Esquema PostgreSQL (Drizzle) de las 4 tablas que estaban en Supabase.
 *
 * El resto de colecciones (responses, evaluations, groups, ...) siguen en
 * `data/db.json` y se acceden desde `lib/db.ts`. Cada tabla tiene exactamente
 * una fuente de verdad: aquí no hay escrituras en JSON para estas 4.
 *
 * Las propiedades usan snake_case a propósito: es el nombre de columna real y
 * también el contrato JSON que ya consumen las rutas y el frontend
 * (`user.cefr_level`, `mission.scene_context`, `guide.cover_emoji`). Así las
 * filas devueltas por Drizzle se pueden devolver tal cual sin capa de
 * traducción, que es donde suelen aparecer los campos olvidados.
 *
 * Los datos se migraron desde db.json, por lo que los tipos reflejan lo que
 * ese fichero contiene, no una reforma del modelo.
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export type UserRole = 'student' | 'teacher'
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2'

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    password_hash: text('password_hash').notNull(),
    role: text('role').notNull().$type<UserRole>(),
    full_name: text('full_name'),
    cefr_level: text('cefr_level').$type<CefrLevel | null>(),
    language_preference: text('language_preference').notNull().default('es'),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex('users_email_key').on(t.email)],
)

export const missions = pgTable('missions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  objective: text('objective'),
  scene_context: text('scene_context'),
  character_name: text('character_name'),
  expected_outcome_indicator: text('expected_outcome_indicator'),
  example_conversation: text('example_conversation'),
  cefr_level: text('cefr_level').notNull().$type<CefrLevel>(),
  base_duration_seconds: integer('base_duration_seconds'),
})

export const guides = pgTable(
  'guides',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    cover_emoji: text('cover_emoji'),
    cefr_level: text('cefr_level').$type<CefrLevel | null>(),
    /** Etiquetas cortas ("present-perfect"): filtrado y detalle de guía. */
    concept_tags: jsonb('concept_tags').$type<string[]>(),
    /** Etiquetas largas de las guías g-005..g-009; alternativa a concept_tags. */
    concepts: jsonb('concepts').$type<string[]>(),
    /** Contenido pedagógico: introduction, definition, exercises, ... */
    content: jsonb('content').$type<GuideContent>(),
    difficulty: text('difficulty'),
    theme: text('theme'),
    unlock_level: integer('unlock_level'),
    interactive_elements: jsonb('interactive_elements').$type<string[]>(),
    mission_connection: text('mission_connection'),
    story_connection: text('story_connection'),
    scene_concepts: jsonb('scene_concepts').$type<string[]>(),
    progress: jsonb('progress').$type<GuideProgress>(),
    xp_reward: integer('xp_reward'),
    estimated_minutes: integer('estimated_minutes'),
    enable_chat_assistant: boolean('enable_chat_assistant'),
    is_published: boolean('is_published'),
    created_at: timestamp('created_at', { withTimezone: true }),
  },
  (t) => [index('guides_cefr_level_idx').on(t.cefr_level)],
)

export const narrative_states = pgTable(
  'narrative_states',
  {
    id: text('id').primaryKey(),
    // Sin estas FK los endpoints de estado narrativo aceptaban cualquier
    // string y dejaban filas huérfanas (se detectaron 2 antes de añadirlas).
    student_id: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mission_id: text('mission_id')
      .notNull()
      .references(() => missions.id, { onDelete: 'cascade' }),
    // `groups` sigue en db.json: este apuntador NO puede ser FK (ver README).
    group_id: text('group_id'),
    state: text('state').notNull(),
    character_reaction: text('character_reaction'),
    scene_position: integer('scene_position'),
    updated_at: timestamp('updated_at', { withTimezone: true }),
  },
  // submit() localiza el registro por (student_id, mission_id) y lo inserta si
  // no existe: sin esta restricción las escrituras concurrentes duplicarían filas.
  (t) => [
    uniqueIndex('narrative_states_student_mission_key').on(t.student_id, t.mission_id),
    index('narrative_states_student_idx').on(t.student_id, t.state),
  ],
)

export interface GuideProgress {
  status?: string
  score?: number
  exercises_completed?: number
  exercises_total?: number
  current_streak?: number
  max_streak?: number
}

export interface GuideExercise {
  id?: string
  type?: string
  question: string
  correct_answer?: string
  answer?: string
  alternatives?: string[]
}

export interface GuideContent {
  introduction?: string
  definition?: string
  explanation?: string
  formula?: string
  key_structures?: unknown[]
  common_expressions?: unknown[]
  real_life_examples?: unknown[]
  exercises?: GuideExercise[]
  [key: string]: unknown
}
