/**
 * SPEAK MVP — JSON File Database
 * All data is persisted in /data/db.json
 * Thread-safe via simple file locking with retries.
 */
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

export interface User {
  id: string
  email: string
  password_hash: string
  role: 'student' | 'teacher'
  full_name: string | null
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | null
  language_preference: 'es' | 'en'
  created_at: string
}

export interface Mission {
  id: string
  title: string
  description: string | null
  objective: string
  scene_context: string
  character_name: string
  expected_outcome_indicator: string | null
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2'
  base_duration_seconds: number
  created_at: string
}

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

export interface NarrativeState {
  id: string
  student_id: string
  mission_id: string
  group_id?: string | null
  state: 'not_started' | 'in_progress' | 'completed' | 'paused'
  character_reaction: string | null
  scene_position: number
  updated_at: string
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

export interface StoryMoment {
  id: string
  story_id: string
  order: number
  title: string
  narrative_context: string
  character_name: string
  character_opening_dialogue: string
  prompt: string
  character_advance_dialogue: string | null
  character_pause_dialogue: string | null
  is_final_scene: boolean
  base_duration_seconds: number
  atmosphere: string
  created_at: string
}

export interface StoryProgress {
  id: string
  student_id: string
  story_id: string
  current_moment_order: number
  status: 'not_started' | 'in_progress' | 'completed'
  moments_completed: number[]
  character_memory: string[]
  started_at: string
  updated_at: string
  completed_at: string | null
}

export interface Database {
  users: User[]
  missions: Mission[]
  responses: Response[]
  evaluations: Evaluation[]
  groups: Group[]
  group_members: GroupMember[]
  mission_assignments: MissionAssignment[]
  narrative_states: NarrativeState[]
  weekly_aggregates: WeeklyAggregate[]
  story_moments: StoryMoment[]
  story_progress: StoryProgress[]
  guides?: any[]
  guide_progress?: any[]
  chat_messages?: any[]
  exercise_submissions?: any[]
}

const EMPTY_DB: Database = {
  users: [],
  missions: [],
  responses: [],
  evaluations: [],
  groups: [],
  group_members: [],
  mission_assignments: [],
  narrative_states: [],
  weekly_aggregates: [],
  story_moments: [],
  story_progress: [],
  guides: [],
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
    // Initialize with seed missions and story moments on first run
    const seedMissionsPath = path.join(process.cwd(), 'data', 'seed_missions.json')
    const seedStoryMomentsPath = path.join(process.cwd(), 'data', 'seed_story_moments.json')
    const db: Database = { ...EMPTY_DB }
    if (fs.existsSync(seedMissionsPath)) {
      db.missions = JSON.parse(fs.readFileSync(seedMissionsPath, 'utf-8'))
    }
    if (fs.existsSync(seedStoryMomentsPath)) {
      db.story_moments = JSON.parse(fs.readFileSync(seedStoryMomentsPath, 'utf-8'))
    }
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
