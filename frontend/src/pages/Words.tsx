/**
 * Mi vocabulario: las palabras que el alumno guardó desde la escena o el chat.
 *
 * La lista ya llega con la ficha completa (traducción, formas verbales y
 * ejemplos), así que el detalle se pinta sin pedir nada más.
 */
import { useEffect, useMemo, useState } from 'react'
import { BookMarked, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { readJson } from '@/lib/api'

interface WordCard {
  id: string
  word: string
  translation: string
  part_of_speech: string
  present: string | null
  past: string | null
  past_participle: string | null
  examples: Array<{ en: string; es: string }>
  saved_id: string
  saved_at: string
  context: string | null
}

const DATE_FMT = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

function formatSavedAt(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : DATE_FMT.format(date)
}

/** Una forma verbal con su etiqueta; guion si el modelo no la dio. */
function VerbForm({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-white">{value ?? '—'}</p>
    </div>
  )
}

export default function Words() {
  const [words, setWords] = useState<WordCard[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/words')
      .then(readJson)
      .then(data => {
        if (!cancelled) setWords(data?.words ?? [])
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar tu vocabulario.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selected = useMemo(
    () => words.find(word => word.saved_id === selectedId) ?? words[0] ?? null,
    [words, selectedId],
  )

  const remove = async (id: string) => {
    if (deleting) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/words/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error')
      setWords(current => current.filter(word => word.saved_id !== id))
      setSelectedId(null)
    } catch {
      setError('No se pudo borrar la palabra.')
    } finally {
      setDeleting(false)
    }
  }

  const hasForms = Boolean(selected && (selected.present || selected.past || selected.past_participle))

  return (
    <div className="min-h-screen p-8 font-mono max-w-6xl mx-auto space-y-8 animate-fade-in pt-16 lg:pt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-body text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
            MI VOCABULARIO
          </h1>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-2">
            {words.length === 1 ? '1 palabra guardada' : `${words.length} palabras guardadas`}
          </p>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-500 gap-2 text-xs uppercase tracking-widest">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
        </div>
      )}

      {!loading && error && <p className="text-coral text-sm">{error}</p>}

      {!loading && !error && words.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
          <BookMarked className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Todavía no guardaste palabras</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            En la escena narrativa y en el chat, pasa el cursor por una palabra en inglés y pulsa
            «Guardar palabra» para verla aquí con sus formas verbales y ejemplos.
          </p>
        </div>
      )}

      {!loading && !error && words.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Lista */}
          <div className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
            {words.map(word => {
              const isActive = selected?.saved_id === word.saved_id
              return (
                <button
                  key={word.saved_id}
                  onClick={() => setSelectedId(word.saved_id)}
                  className={cn(
                    'w-full text-left rounded-xl border px-4 py-3 transition-colors',
                    isActive
                      ? 'border-cyan/50 bg-cyan/10 shadow-[0_0_15px_-6px_rgba(6,182,212,0.6)]'
                      : 'border-white/10 bg-white/5 hover:border-white/25',
                  )}
                >
                  <p className="text-sm font-bold text-white">{word.word}</p>
                  <p className="text-xs text-slate-400 truncate">{word.translation}</p>
                  <p className="text-[9px] uppercase tracking-widest text-slate-600 mt-1">
                    {word.part_of_speech} · {formatSavedAt(word.saved_at)}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Detalle */}
          {selected && (
            <section className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-white break-words">{selected.word}</h2>
                  <p className="text-[10px] uppercase tracking-widest text-cyan mt-1">
                    {selected.part_of_speech}
                  </p>
                </div>
                <button
                  onClick={() => remove(selected.saved_id)}
                  disabled={deleting}
                  aria-label="Quitar del vocabulario"
                  className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-500 hover:text-coral hover:border-coral/40 transition-colors disabled:opacity-40"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>

              <div className="rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3">
                <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Traducción</p>
                <p className="text-lg text-cyan-100">{selected.translation}</p>
              </div>

              {hasForms && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Formas verbales</p>
                  <div className="grid grid-cols-3 gap-2">
                    <VerbForm label="Presente" value={selected.present} />
                    <VerbForm label="Pasado" value={selected.past} />
                    <VerbForm label="Participio" value={selected.past_participle} />
                  </div>
                </div>
              )}

              {selected.examples.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Ejemplos de uso</p>
                  <ul className="space-y-2">
                    {selected.examples.map((example, index) => (
                      <li key={index} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-sm text-white">{example.en}</p>
                        <p className="text-xs text-slate-400 italic">{example.es}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.context && (
                <p className="text-[11px] text-slate-500 border-l-2 border-white/10 pl-3">
                  La guardaste en: <span className="text-slate-400 italic">“{selected.context}”</span>
                </p>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
