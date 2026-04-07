// ===================================================================
// STORY MODE - IMPLEMENTATION COMPONENTS
// ===================================================================

// 1. StoryModeEntry - frontend/app/(student)/story/page.tsx
// ===================================================================

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { BookOpen, Play, RotateCcw } from 'lucide-react'
import { Story, StoryProgress } from '@/lib/types'

export default function StoryModePage() {
  const { user } = useAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [progress, setProgress] = useState<Record<string, StoryProgress>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStories() {
      try {
        // Fetch stories from stories.json or API
        const storiesRes = await fetch('/api/story/list')
        const storiesData = await storiesRes.json()
        setStories(storiesData.stories)

        // Fetch student progress
        const progressRes = await fetch(
          `/api/story/progress?student_id=${user?.id}`
        )
        const progressData = await progressRes.json()
        
        // Index progress by story_id
        const indexed = progressData.reduce((acc: any, p: StoryProgress) => {
          acc[p.story_id] = p
          return acc
        }, {})
        setProgress(indexed)
      } catch (error) {
        console.error('Failed to load stories:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) loadStories()
  }, [user?.id])

  if (loading) return <div className="p-8">Cargando historias...</div>

  return (
    <div className="min-h-screen bg-black/40 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-cyan-500" />
            Story Mode
          </h1>
          <p className="text-slate-400">
            Aprende idiomas a través de historias interactivas progresivas
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => {
            const storyProgress = progress[story.id]
            const isStarted = storyProgress?.status === 'in_progress'
            const isCompleted = storyProgress?.status === 'completed'
            const scenesCompleted = storyProgress?.scenes_completed.length ?? 0

            return (
              <div
                key={story.id}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all duration-300 transform hover:scale-105"
              >
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-5xl">
                  {story.cover_emoji}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h2 className="text-lg font-bold text-white mb-1">
                    {story.title}
                  </h2>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {story.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">
                      {story.cefr_level}
                    </span>
                    <span className="text-slate-500">
                      {story.estimated_minutes} min
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {isStarted && (
                    <div className="mb-3">
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-slate-400">Progreso</span>
                        <span className="text-cyan-400">
                          {scenesCompleted}/{story.total_scenes}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all"
                          style={{
                            width: `${(scenesCompleted / story.total_scenes) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Button */}
                  <Link
                    href={`/story/${story.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    {isCompleted ? (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Repetir
                      </>
                    ) : isStarted ? (
                      <>
                        <Play className="w-4 h-4" />
                        Continuar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Iniciar
                      </>
                    )}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


// 2. PreResponseGuidanceModal - frontend/components/PreResponseGuidanceModal.tsx
// ===================================================================

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Scene } from '@/lib/types'
import { ChevronDown } from 'lucide-react'

interface PreResponseGuidanceModalProps {
  isOpen: boolean
  onClose: () => void
  scene: Scene
}

export function PreResponseGuidanceModal({
  isOpen,
  onClose,
  scene,
}: PreResponseGuidanceModalProps) {
  const [expandedVerb, setExpandedVerb] = useState<string | null>(null)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">
            💡 Ayuda para responder
          </DialogTitle>
          <p className="text-sm text-slate-400 mt-2">
            Aquí encontrarás vocabulario, conjugaciones y ejemplos para ayudarte
          </p>
        </DialogHeader>

        <Tabs defaultValue="verbs" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700">
            <TabsTrigger value="verbs">Verbos</TabsTrigger>
            <TabsTrigger value="adjectives">Adjetivos</TabsTrigger>
            <TabsTrigger value="nouns">Sustantivos</TabsTrigger>
            <TabsTrigger value="grammar">Gramática</TabsTrigger>
          </TabsList>

          {/* Verbs Tab */}
          <TabsContent value="verbs" className="space-y-3">
            {scene.guidance.key_verbs.map((verb) => (
              <div
                key={verb.base_form}
                className="border border-slate-700 rounded-lg bg-slate-800/50 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedVerb(
                      expandedVerb === verb.base_form ? null : verb.base_form
                    )
                  }
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                >
                  <div className="text-left">
                    <h4 className="font-bold text-cyan-300">{verb.base_form}</h4>
                    <p className="text-sm text-slate-400">
                      {verb.translations.en}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      expandedVerb === verb.base_form ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedVerb === verb.base_form && (
                  <div className="bg-slate-900/50 border-t border-slate-700 p-3 space-y-3">
                    {/* Tenses */}
                    <div>
                      <h5 className="font-semibold text-white mb-2 text-sm">
                        Conjugaciones:
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-slate-700/30 p-2 rounded">
                          <span className="text-slate-400">Presente:</span>
                          <p className="text-white font-mono text-xs">
                            {verb.tenses.present}
                          </p>
                        </div>
                        <div className="bg-slate-700/30 p-2 rounded">
                          <span className="text-slate-400">Pasado:</span>
                          <p className="text-white font-mono text-xs">
                            {verb.tenses.preterite}
                          </p>
                        </div>
                        <div className="bg-slate-700/30 p-2 rounded">
                          <span className="text-slate-400">Futuro:</span>
                          <p className="text-white font-mono text-xs">
                            {verb.tenses.future}
                          </p>
                        </div>
                        <div className="bg-slate-700/30 p-2 rounded">
                          <span className="text-slate-400">Condicional:</span>
                          <p className="text-white font-mono text-xs">
                            {verb.tenses.conditional}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Examples */}
                    <div>
                      <h5 className="font-semibold text-white mb-2 text-sm">
                        Ejemplos en esta escena:
                      </h5>
                      <ul className="space-y-1">
                        {verb.examples_in_context.map((example, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-cyan-400 font-serif italic"
                          >
                            "{example}"
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold text-white mb-2 text-sm">
                        Otros contextos:
                      </h5>
                      <ul className="space-y-1">
                        {verb.examples_in_other_contexts.map((example, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-slate-300 font-serif"
                          >
                            "{example}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* Adjectives Tab */}
          <TabsContent value="adjectives" className="space-y-3">
            {scene.guidance.key_adjectives.map((adj) => (
              <div
                key={adj.word}
                className="border border-slate-700 rounded-lg bg-slate-800/50 p-3"
              >
                <h4 className="font-bold text-cyan-300 mb-1">{adj.word}</h4>
                <p className="text-sm text-slate-400 mb-2">{adj.meaning}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">En esta escena:</span>
                    <p className="text-white font-serif italic">
                      "{adj.example_in_scene}"
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Otro contexto:</span>
                    <p className="text-white font-serif">
                      "{adj.example_other_context}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Nouns Tab */}
          <TabsContent value="nouns" className="space-y-3">
            {scene.guidance.key_nouns.map((noun) => (
              <div
                key={noun.word}
                className="border border-slate-700 rounded-lg bg-slate-800/50 p-3"
              >
                <h4 className="font-bold text-cyan-300 mb-1">
                  <span className="text-slate-400">{noun.article}</span>{' '}
                  {noun.word}
                </h4>
                <p className="text-sm text-slate-400 mb-2">{noun.meaning}</p>
                <div className="text-sm">
                  <span className="text-slate-500">En esta escena:</span>
                  <p className="text-white font-serif italic">
                    "{noun.example_in_scene}"
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Grammar Tab */}
          <TabsContent value="grammar" className="space-y-3">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h4 className="font-bold text-cyan-300 mb-2">
                {scene.guidance.grammar_tips.focus_structure}
              </h4>
              <p className="text-sm text-slate-300 mb-3">
                {scene.guidance.grammar_tips.explanation}
              </p>

              <div>
                <h5 className="font-semibold text-white mb-2 text-sm">
                  Ejemplos:
                </h5>
                <ul className="space-y-1">
                  {scene.guidance.grammar_tips.examples.map((ex, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-cyan-400 font-serif italic"
                    >
                      - "{ex}"
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3">
                <h5 className="font-semibold text-pink-400 mb-2 text-sm">
                  ⚠️ Errores comunes a evitar:
                </h5>
                <ul className="space-y-1">
                  {scene.guidance.grammar_tips.common_mistakes.map(
                    (mistake, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-pink-300 font-serif"
                      >
                        - {mistake}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Sentence Starters */}
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
              <h4 className="font-bold text-cyan-300 mb-2">
                💬 Formas de empezar:
              </h4>
              <div className="flex flex-wrap gap-2">
                {scene.guidance.sentence_starters.map((starter) => (
                  <div
                    key={starter}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-serif italic"
                  >
                    "{starter}..."
                  </div>
                ))}
              </div>
            </div>

            {/* Register Notes */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-bold text-blue-300 mb-2">📝 Notas sobre el tono:</h4>
              <p className="text-sm text-blue-200">{scene.guidance.register_notes}</p>
            </div>
          </TabsContent>
        </Tabs>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-cyān-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg transition-colors"
        >
          Entendido, voy a responder
        </button>
      </DialogContent>
    </Dialog>
  )
}


// 3. Story Evaluation Hook - frontend/lib/story-evaluator.ts
// ===================================================================

import { Scene } from './types'

export interface EvaluationResult {
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
  character_reaction: string
  npc_next_message: string
}

export async function evaluateStoryResponse(
  userResponse: string,
  scene: Scene,
  studentLevel: string,
  attemptNumber: number
): Promise<EvaluationResult> {
  try {
    const response = await fetch('/api/story/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_response: userResponse,
        scene_id: scene.id,
        story_id: scene.story_id,
        student_level: studentLevel,
        attempt_number: attemptNumber,
      }),
    })

    if (!response.ok) {
      throw new Error(`Evaluation failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Story evaluation error:', error)
    throw error
  }
}

// Helper to calculate if response should be approved based on rubric
export function shouldApproveResponse(
  scores: {
    grammar: number
    vocabulary: number
    naturalness: number
    context: number
  },
  studentLevel: string
): boolean {
  const rubrics: Record<string, { threshold: number; min_context: number }> = {
    A1: { threshold: 0.7, min_context: 0.5 },
    A2: { threshold: 0.75, min_context: 0.6 },
    B1: { threshold: 0.8, min_context: 0.8 },
    B2: { threshold: 0.85, min_context: 0.9 },
  }

  const rubric = rubrics[studentLevel] || rubrics.A2
  const averageScore =
    (scores.grammar + scores.vocabulary + scores.naturalness) / 3

  return (
    averageScore >= rubric.threshold && scores.context >= rubric.min_context
  )
}
