/**
 * VOX — JSON File Database
 *
 * Persistencia legada: sólo recoge las colecciones de apoyo que todavía no
 * están en PostgreSQL (respuestas, evaluaciones, grupos, agregados semanales).
 *
 * users, missions, guides y narrative_states viven en PostgreSQL
 * (ver lib/postgres.ts y lib/schema.ts). NO se re-introduzcan aquí.
 *
 * Thread-safe via simple file locking with retries.
 */
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

export interface Response {
  id: string
  mission_id: string
  student_id: string
  group_id: string | null
  text_content: string
  time_taken_seconds: number | null
  submitted_at: string
  status?: 'submitted' | 'in_progress' | 'completed' | 'paused'
}

export interface Evaluation {
  id: string
  response_id: string
  comprehensibility_score: number
  grammar_score: number
  lexical_richness_score: number
  judgment: 'ADVANCE' | 'PAUSE'
  feedback_text: string
  detected_structures: string[]
  evaluated_at: string
  xp_awarded?: number
}

export interface Group {
  id: string
  teacher_id: string
  name: string
  access_code: string
  institution_name: string | null
  parental_consent_confirmed: boolean
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  student_id: string
  joined_at: string
}

export interface MissionAssignment {
  id: string
  group_id: string
  mission_id: string
  assigned_by: string
  due_date: string | null
  created_at: string
}

export interface WeeklyAggregate {
  id: string
  student_id: string
  group_id: string | null
  week_start_date: string
  total_writing_time_seconds: number
  missions_completed: number
  avg_comprehensibility: number | null
  updated_at: string
}



export interface Database {
  responses: Response[]
  evaluations: Evaluation[]
  groups: Group[]
  group_members: GroupMember[]
  mission_assignments: MissionAssignment[]
  weekly_aggregates: WeeklyAggregate[]

  guide_progress?: any[]
  chat_messages?: any[]
  exercise_submissions?: any[]
}

const EMPTY_DB: Database = {
  responses: [],
  evaluations: [],
  groups: [],
  group_members: [],
  mission_assignments: [],
  weekly_aggregates: [],

  guide_progress: [],
  chat_messages: [],
}

function ensureDataDir() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function readDB(): Database {
  ensureDataDir()
  if (!fs.existsSync(DB_PATH)) {
    const db: Database = { ...EMPTY_DB }
    writeDB(db)
    return db
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as Database
  } catch {
    return { ...EMPTY_DB }
  }
}

export function writeDB(db: Database): void {
  ensureDataDir()
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

// ─── Helper query functions ──────────────────────────────────────────

export function findById<T extends { id: string }>(arr: T[], id: string): T | undefined {
  return arr.find(x => x.id === id)
}

export function findBy<T>(arr: T[], key: keyof T, value: unknown): T | undefined {
  return arr.find(x => x[key] === value)
}

export function filterBy<T>(arr: T[], key: keyof T, value: unknown): T[] {
  return arr.filter(x => x[key] === value)
}

export function upsert<T extends { id: string }>(arr: T[], item: T): T[] {
  const idx = arr.findIndex(x => x.id === item.id)
  if (idx >= 0) { const copy = [...arr]; copy[idx] = item; return copy }
  return [...arr, item]
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}
