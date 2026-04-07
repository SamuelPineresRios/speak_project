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
  rating_1_to_5?: number;
  analysis_message?: string;
  alternatives?: { type: string; phrase: string }[];
  // Story Mode extensions
  phrase_correction?: {
    original: string
    corrected: string
    explanation: string
    is_correct: boolean
  }
  recommendations?: {
    type: 'vocabulary' | 'grammar' | 'register' | 'naturalness'
    original_phrase: string
    suggestion: string
    reason: string
  }[]
  evaluated_at: string
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
  state: 'not_started' | 'in_progress' | 'completed' | 'paused'
  character_reaction: string | null
  scene_position: number
  updated_at: string
}

export interface GrammarConjugation {
  base_form: string
  translations: { en: string; pt?: string }
  tenses: {
    present: string
    preterite: string
    imperfect: string
    future: string
    conditional: string
  }
  examples_in_context: string[]
  examples_in_other_contexts: string[]
}

export interface Story {
  id: string
  title: string
  description: string
  cover_emoji: string
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2'
  total_scenes: number
  estimated_minutes: number
  backdrop_url?: string
  characters: Array<{
    name: string
    role: string
    personality_traits: string[]
    background: string
  }>
  narrative_theme: string
  learning_objectives: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Scene {
  id: string
  story_id: string
  order: number
  title: string
  narrative_context: string
  situation: string
  objective: string
  character_name: string
  character_role: string
  character_personality: string[]
  character_opening_dialogue: string
  character_advance_dialogue: string
  character_pause_dialogue: string
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2'
  evaluation_criteria: {
    vocabulary_complexity: 'basic' | 'intermediate' | 'advanced'
    grammar_structures: string[]
    naturalness_factor: number
    context_relevance: 'strict' | 'moderate' | 'flexible'
    min_tokens: number
  }
  guidance: {
    key_verbs: GrammarConjugation[]
    key_adjectives: Array<{
      word: string
      meaning: string
      example_in_scene: string
      example_other_context: string
    }>
    key_nouns: Array<{
      word: string
      meaning: string
      article: string
      example_in_scene: string
    }>
    grammar_tips: {
      focus_structure: string
      explanation: string
      examples: string[]
      common_mistakes: string[]
    }
    sentence_starters: string[]
    register_notes: string
  }
  expected_responses: {
    high_quality: string[]
    acceptable: string[]
    common_mistakes: Array<{
      pattern: string
      correction: string
      explanation: string
    }>
  }
  character_reactions: {
    advance: string
    pause: string
    confusion: string
  }
  base_duration_seconds: number
  atmosphere: 'neutral' | 'tense' | 'dark' | 'warm' | 'urgent' | 'mysterious' | 'happy' | 'danger'
  background_description: string
  is_final_scene: boolean
  created_at: string
}

export interface StoryProgress {
  id: string
  student_id: string
  story_id: string
  current_scene_id: string
  current_scene_order: number
  status: 'not_started' | 'in_progress' | 'completed'
  scenes_completed: number[]
  total_attempts: number
  successful_attempts: number
  average_quality_score: number
  started_at: string
  completed_at: string | null
  last_accessed_at: string
  updated_at: string
}
