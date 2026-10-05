/**
 * Vocabulario clave: la actividad entre la escena narrativa y la misión.
 *
 * Siete palabras de la escena en selección múltiple. Cada respuesta se corrige
 * al momento (con explicación cuando falla) y al final se ve el marcador antes
 * de pasar a la conversación. La evaluación es local: la opción correcta viene
 * en el payload para poder dar feedback sin ida y vuelta.
 */
import { useEffect, useState } from 'react'
import { ArrowRight, Check, Loader2, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { readJson } from '@/lib/api'

interface VocabularyWord {
  word: string
  translation: string
  distractors: string[]
  explanation: string
  options: string[]
}

interface VocabularyQuizProps {
  missionId: string
  cefrLevel: string
  onFinish: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

/** Rebaraja para el reintento: el orden del servidor ya se memorizó. */
function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]!
    copy[i] = copy[j]!
    copy[j] = tmp
  }
  return copy
}

/** Mensaje final según los aciertos. */
function closingMessage(hits: number, total: number): string {
  if (hits === total) return 'Perfecto: te las sabes todas. A por la conversación.'
  if (hits >= total - 2) return 'Muy bien: repasa las que fallaron y entra a la misión.'
  return 'Buen intento: las palabras volverán a aparecer en la conversación.'
}

export function VocabularyQuiz({ missionId, cefrLevel, onFinish }: VocabularyQuizProps) {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [hits, setHits] = useState(0)
  const [finished, setFinished] = useState(false)

  /** Sube para volver a pedir el vocabulario tras un fallo. */
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/missions/${missionId}/vocabulary`)
      .then(readJson)
      .then(data => {
        if (cancelled) return
        const list: VocabularyWord[] = data?.vocabulary?.words ?? []
        if (list.length === 0) throw new Error('La actividad llegó vacía')
        setWords(list)
        setIndex(0)
        setPicked(null)
        setHits(0)
        setFinished(false)
      })
      .catch(err => {
        if (!cancelled) setError((err as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [missionId, reloadKey])

  /** Reintento del botón: el estado visual se marca aquí, no en el efecto. */
  const retryLoad = () => {
    setLoading(true)
    setError(null)
    setReloadKey(key => key + 1)
  }

  const word = words[index]
  const isCorrect = picked !== null && picked === word?.translation
  const isLast = index >= words.length - 1

  const choose = (option: string) => {
    if (picked !== null) return
    setPicked(option)
    if (option === word.translation) setHits(value => value + 1)
  }

  const next = () => {
    if (isLast) {
      setFinished(true)
      return
    }
    setPicked(null)
    setIndex(value => value + 1)
  }

  const retry = () => {
    setWords(current => current.map(entry => ({ ...entry, options: shuffled(entry.options) })))
    setIndex(0)
    setPicked(null)
    setHits(0)
    setFinished(false)
  }

  // Atajos de teclado: 1-4 eligen, Enter continúa.
  useEffect(() => {
    if (loading || error || finished || !word) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && picked !== null) {
        event.preventDefault()
        next()
        return
      }
      const position = Number.parseInt(event.key, 10) - 1
      if (position >= 0 && position < word.options.length) {
        choose(word.options[position]!)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="relative min-h-screen w-full bg-slate-950 font-body overflow-hidden flex flex-col">
      {/* Mismo fondo que la escena, para no romper la continuidad */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(8,51,68,0.6)_0%,rgba(2,6,23,0.97)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e2a38_1px,transparent_1px),linear-gradient(to_bottom,#0e2a38_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-cyan animate-spin" />
            <p className="text-cyan text-xs font-bold uppercase tracking-[0.25em] animate-pulse">
              Preparando el vocabulario
            </p>
            <p className="text-[11px] text-slate-400 text-center max-w-xs">
              Es la primera vez que se abre esta misión: el coach está eligiendo las palabras clave de la escena.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-coral font-bold">No se pudo cargar el vocabulario</p>
            <p className="text-xs text-slate-400 max-w-xs">{error}</p>
            <div className="flex gap-2">
              <button
                onClick={retryLoad}
                className="px-4 py-2 rounded-lg bg-cyan text-black text-xs font-bold uppercase tracking-widest"
              >
                Reintentar
              </button>
              <button
                onClick={onFinish}
                className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 text-xs uppercase tracking-widest"
              >
                Continuar sin la actividad
              </button>
            </div>
          </div>
        )}

        {!loading && !error && finished && (
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-8 text-center space-y-4">
            <p className="text-4xl">🏅</p>
            <h2 className="text-xl font-bold text-white">¡Vocabulario listo!</h2>
            <p className="text-sm text-slate-300">
              {hits} de {words.length} aciertos
            </p>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-cyan shadow-[0_0_10px_rgba(6,182,212,0.6)] transition-all duration-700"
                style={{ width: `${Math.round((hits / words.length) * 100)}%` }}
              />
            </div>
            <p className="text-[12px] text-slate-400">{closingMessage(hits, words.length)}</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={onFinish}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-cyan-900 font-black text-sm uppercase tracking-wider py-3 transition-transform hover:scale-[1.02] active:scale-95"
              >
                Ir a la misión <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={retry}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-300 hover:border-white/30 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Repetir
              </button>
            </div>
          </div>
        )}

        {!loading && !error && !finished && word && (
          <div className="w-full max-w-xl">
            <header className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] text-cyan uppercase tracking-[0.25em]">Antes de la conversación</p>
                <h2 className="text-xl font-bold text-white">Palabras clave</h2>
              </div>
              <span className="text-xs px-2 py-1 rounded border font-bold border-cyan/50 bg-cyan/10 text-cyan">
                {cefrLevel}
              </span>
            </header>

            {/* Progreso: un punto por palabra y el marcador de aciertos */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Palabra</span>
              <div className="flex-1 flex items-center gap-1.5">
                {words.map((_, position) => (
                  <span
                    key={position}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-all duration-500',
                      position < index
                        ? 'bg-emerald'
                        : position === index
                          ? 'bg-cyan animate-pulse'
                          : 'bg-slate-800',
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {index + 1}/{words.length} · {hits} ✓
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6">
              <p className="text-center text-[11px] uppercase tracking-widest text-slate-400 mb-2">
                ¿Qué significa…?
              </p>
              <p className="text-center text-3xl font-bold text-white mb-1">{word.word}</p>
              <p className="text-center text-[11px] text-slate-500 mb-6">
                Elige la traducción correcta ({LETTERS.slice(0, word.options.length).join(', ')} o 1-
                {word.options.length})
              </p>

              <div className="space-y-2">
                {word.options.map((option, position) => {
                  const isRight = option === word.translation
                  const isPicked = picked === option
                  const answered = picked !== null
                  return (
                    <button
                      key={option}
                      onClick={() => choose(option)}
                      disabled={answered}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                        !answered && 'border-white/10 hover:border-cyan/40 hover:bg-white/5',
                        answered && isRight && 'border-emerald/60 bg-emerald/10',
                        answered && isPicked && !isRight && 'border-coral/60 bg-coral/10',
                        answered && !isRight && !isPicked && 'border-white/5 opacity-50',
                      )}
                    >
                      <span
                        className={cn(
                          'w-6 h-6 rounded-md border flex items-center justify-center text-[11px] font-bold shrink-0',
                          answered && isRight
                            ? 'border-emerald text-emerald'
                            : answered && isPicked
                              ? 'border-coral text-coral'
                              : 'border-white/20 text-slate-400',
                        )}
                      >
                        {LETTERS[position]}
                      </span>
                      <span className="text-sm text-white">{option}</span>
                      {answered && isRight && <Check className="h-4 w-4 text-emerald ml-auto shrink-0" />}
                      {answered && isPicked && !isRight && <X className="h-4 w-4 text-coral ml-auto shrink-0" />}
                    </button>
                  )
                })}
              </div>

              {picked !== null && (
                <div
                  role="status"
                  className={cn(
                    'mt-5 rounded-xl border px-4 py-3 text-[13px] leading-relaxed',
                    isCorrect
                      ? 'border-emerald/40 bg-emerald/10 text-emerald-100'
                      : 'border-coral/40 bg-coral/10 text-red-100',
                  )}
                >
                  <p className="font-bold mb-0.5">{isCorrect ? '¡Correcto!' : 'No exactamente'}</p>
                  {isCorrect ? (
                    <p className="opacity-90">
                      <span className="font-bold">{word.word}</span> = «{word.translation}».
                    </p>
                  ) : (
                    <p className="opacity-90">
                      <span className="font-bold">{word.word}</span> significa «{word.translation}».{' '}
                      {word.explanation}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={next}
                disabled={picked === null}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-cyan text-black font-bold text-xs uppercase tracking-widest py-3 transition-colors hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLast ? 'Ver resultado' : 'Siguiente'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
