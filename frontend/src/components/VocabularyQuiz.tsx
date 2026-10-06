/**
 * Vocabulario clave: la actividad entre la escena narrativa y la misión.
 *
 * Primero se estudian las 7 palabras (traducción y frase de ejemplo) y después
 * se emparejan: todas las palabras inglesas en la columna izquierda y todas las
 * traducciones barajadas en la derecha. La evaluación es local.
 */
import { useEffect, useState } from 'react'
import { ArrowRight, Check, Eye, Loader2, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { readJson } from '@/lib/api'

interface VocabularyWord {
  word: string
  translation: string
  example: string
  example_translation: string
}

type Phase = 'study' | 'match' | 'summary'

interface VocabularyQuizProps {
  missionId: string
  cefrLevel: string
  onFinish: () => void
}

/** Baraja la columna de traducciones (y la rebaraja al repetir). */
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

/** Mensaje final según los fallos. */
function closingMessage(mistakes: number): string {
  if (mistakes === 0) return 'Los 7 pares a la primera. A por la conversación.'
  if (mistakes <= 3) return 'Buen trabajo: un par de fallos que ya conoces.'
  return 'Vuelve a leer la lista si quieres y entra a la misión: estas palabras saldrán en la conversación.'
}

export function VocabularyQuiz({ missionId, cefrLevel, onFinish }: VocabularyQuizProps) {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [phase, setPhase] = useState<Phase>('study')
  const [rightColumn, setRightColumn] = useState<string[]>([])
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null)
  /** Palabras ya emparejadas (el par se pinta en verde). */
  const [matched, setMatched] = useState<string[]>([])
  /** Par fallado, para el destello rojo antes de soltarlo. */
  const [wrong, setWrong] = useState<{ word: string; translation: string } | null>(null)
  const [mistakes, setMistakes] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/missions/${missionId}/vocabulary`)
      .then(readJson)
      .then(data => {
        if (cancelled) return
        const list: VocabularyWord[] = data?.vocabulary?.words ?? []
        if (list.length === 0) throw new Error('La actividad llegó vacía')
        setWords(list)
        setPhase('study')
        setMatched([])
        setMistakes(0)
        setSelectedWord(null)
        setSelectedTranslation(null)
        setWrong(null)
        setRightColumn(shuffled(list.map(entry => entry.translation)))
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

  const matchedTranslations = new Set(
    words.filter(entry => matched.includes(entry.word)).map(entry => entry.translation),
  )

  const isMatchedWord = (word: string) => matched.includes(word)

  const evaluate = (word: string, translation: string) => {
    const entry = words.find(item => item.word === word)
    if (entry?.translation === translation) {
      const pairs = [...matched, word]
      setMatched(pairs)
      setSelectedWord(null)
      setSelectedTranslation(null)
      if (pairs.length === words.length) {
        setTimeout(() => setPhase('summary'), 450)
      }
      return
    }

    setMistakes(value => value + 1)
    setWrong({ word, translation })
    // El destello rojo se suelta solo y deja elegir otra pareja.
    setTimeout(() => {
      setWrong(null)
      setSelectedWord(null)
      setSelectedTranslation(null)
    }, 650)
  }

  const pickWord = (word: string) => {
    if (isMatchedWord(word) || wrong) return
    if (selectedTranslation) {
      evaluate(word, selectedTranslation)
      return
    }
    setSelectedWord(current => (current === word ? null : word))
  }

  const pickTranslation = (translation: string) => {
    if (matchedTranslations.has(translation) || wrong) return
    if (selectedWord) {
      evaluate(selectedWord, translation)
      return
    }
    setSelectedTranslation(current => (current === translation ? null : translation))
  }

  const startMatching = () => {
    setPhase('match')
    setMatched([])
    setMistakes(0)
    setSelectedWord(null)
    setSelectedTranslation(null)
    setWrong(null)
    setRightColumn(shuffled(words.map(entry => entry.translation)))
  }

  const retryMatching = () => {
    startMatching()
  }

  const backToStudy = () => {
    setPhase('study')
    setSelectedWord(null)
    setSelectedTranslation(null)
    setWrong(null)
  }

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

        {/* Fase 1: estudiar las palabras con su ejemplo */}
        {!loading && !error && phase === 'study' && (
          <div className="w-full max-w-2xl">
            <header className="flex items-center justify-between gap-4 mb-2">
              <div>
                <p className="text-[10px] text-cyan uppercase tracking-[0.25em]">Antes de la conversación</p>
                <h2 className="text-xl font-bold text-white">Palabras clave</h2>
              </div>
              <span className="text-xs px-2 py-1 rounded border font-bold border-cyan/50 bg-cyan/10 text-cyan">
                {cefrLevel}
              </span>
            </header>
            <p className="text-[12px] text-slate-400 mb-4">
              Estas son las 7 palabras de la escena, con su traducción y un ejemplo. Después las emparejarás.
            </p>

            <ul className="space-y-2 mb-5">
              {words.map(entry => (
                <li
                  key={entry.word}
                  className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm px-4 py-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-base font-bold text-white">{entry.word}</p>
                    <p className="text-sm text-cyan">{entry.translation}</p>
                  </div>
                  <p className="mt-1 text-[13px] text-slate-200">{entry.example}</p>
                  <p className="text-[12px] text-slate-500 italic">{entry.example_translation}</p>
                </li>
              ))}
            </ul>

            <button
              onClick={startMatching}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan text-black font-bold text-xs uppercase tracking-widest py-3 transition-colors hover:bg-cyan-400"
            >
              Practicar el emparejamiento <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Fase 2: emparejar palabra con traducción */}
        {!loading && !error && phase === 'match' && (
          <div className="w-full max-w-3xl">
            <header className="flex items-center justify-between gap-4 mb-2">
              <div>
                <p className="text-[10px] text-cyan uppercase tracking-[0.25em]">Palabras clave</p>
                <h2 className="text-xl font-bold text-white">Empareja cada palabra</h2>
              </div>
              <span className="text-xs px-2 py-1 rounded border font-bold border-cyan/50 bg-cyan/10 text-cyan">
                {cefrLevel}
              </span>
            </header>
            <p className="text-[12px] text-slate-400 mb-4">
              Toca una palabra y luego su traducción. Vas {matched.length} de {words.length}
              {mistakes > 0 && <> · {mistakes} fallo{mistakes === 1 ? '' : 's'}</>}.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="space-y-2">
                {words.map(entry => {
                  const done = isMatchedWord(entry.word)
                  const failed = wrong?.word === entry.word
                  const selected = selectedWord === entry.word
                  return (
                    <button
                      key={entry.word}
                      onClick={() => pickWord(entry.word)}
                      disabled={done || wrong !== null}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left text-sm font-bold transition-colors',
                        done && 'border-emerald/50 bg-emerald/10 text-emerald-200',
                        failed && 'border-coral/60 bg-coral/10 text-red-100',
                        !done && !failed && selected && 'border-cyan/60 bg-cyan/10 text-cyan-100',
                        !done && !failed && !selected && 'border-white/10 bg-white/5 text-white hover:border-cyan/40',
                      )}
                    >
                      {entry.word}
                      {done && <Check className="h-4 w-4 text-emerald shrink-0" />}
                      {failed && <X className="h-4 w-4 text-coral shrink-0" />}
                    </button>
                  )
                })}
              </div>

              <div className="space-y-2">
                {rightColumn.map(translation => {
                  const done = matchedTranslations.has(translation)
                  const failed = wrong?.translation === translation
                  const selected = selectedTranslation === translation
                  return (
                    <button
                      key={translation}
                      onClick={() => pickTranslation(translation)}
                      disabled={done || wrong !== null}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left text-sm transition-colors',
                        done && 'border-emerald/50 bg-emerald/10 text-emerald-200',
                        failed && 'border-coral/60 bg-coral/10 text-red-100',
                        !done && !failed && selected && 'border-cyan/60 bg-cyan/10 text-cyan-100',
                        !done && !failed && !selected && 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan/40',
                      )}
                    >
                      {translation}
                      {done && <Check className="h-4 w-4 text-emerald shrink-0" />}
                      {failed && <X className="h-4 w-4 text-coral shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={backToStudy}
              className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-slate-400 hover:text-cyan transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> Ver las palabras otra vez
            </button>
          </div>
        )}

        {/* Fase 3: resumen */}
        {!loading && !error && phase === 'summary' && (
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-8 text-center space-y-4">
            <p className="text-4xl">🏅</p>
            <h2 className="text-xl font-bold text-white">¡Vocabulario listo!</h2>
            <p className="text-sm text-slate-300">
              {words.length} pares emparejados{mistakes > 0 && ` · ${mistakes} fallo${mistakes === 1 ? '' : 's'}`}
            </p>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-full bg-cyan shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
            </div>
            <p className="text-[12px] text-slate-400">{closingMessage(mistakes)}</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={onFinish}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-cyan-900 font-black text-sm uppercase tracking-wider py-3 transition-transform hover:scale-[1.02] active:scale-95"
              >
                Ir a la misión <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={retryMatching}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-300 hover:border-white/30 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Repetir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
