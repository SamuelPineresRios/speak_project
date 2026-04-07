// Tipos TypeScript para Story Mode
// Agregar a: frontend/lib/types.ts

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

export interface Scene {
  id: string
  story_id: string
  order: number
  title: string
  
  // CONTEXTO NARRATIVO
  narrative_context: string
  situation: string
  objective: string
  
  // PERSONAJE NPC
  character_name: string
  character_role: string
  character_personality: string[]
  character_opening_dialogue: string
  
  // PROGRESIÓN DE DIFICULTAD
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2'
  
  // CRITERIOS DE EVALUACIÓN
  evaluation_criteria: {
    vocabulary_complexity: 'basic' | 'intermediate' | 'advanced'
    grammar_structures: string[]
    naturalness_factor: number
    context_relevance: 'strict' | 'moderate' | 'flexible'
    min_tokens: number
  }
  
  // ORIENTACIÓN EDUCATIVA (Pre-Response Modal)
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
  
  // RESPUESTAS ESPERADAS
  expected_responses: {
    high_quality: string[]
    acceptable: string[]
    common_mistakes: Array<{
      pattern: string
      correction: string
      explanation: string
    }>
  }
  
  // REACCIONES DEL PERSONAJE
  character_reactions: {
    advance: string
    pause: string
    confusion: string
  }
  
  // METADATOS
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

export interface SceneResponse {
  id: string
  student_id: string
  scene_id: string
  story_id: string
  
  attempt_number: number
  user_text: string
  
  evaluation: {
    is_approved: boolean
    quality_score: number
    context_relevance: number
    grammar_score: number
    vocabulary_score: number
    naturalness_score: number
    
    feedback: {
      positive_aspects: string[]
      areas_to_improve: string[]
      specific_corrections: Array<{
        original: string
        corrected: string
        reason: string
        alternative_options: string[]
      }>
      nativelike_suggestions: Array<{
        current_phrase: string
        native_alternative: string
        explanation: string
      }>
    }
    
    context_validation: {
      is_contextually_appropriate: boolean
      relevance_explanation: string
    }
  }
  
  submitted_at: string
  evaluated_at: string
}
