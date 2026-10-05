/**
 * Mi vocabulario: las palabras que el alumno guardó desde la escena o el chat.
 *
 * La lista ya llega con la ficha completa (traducción, formas verbales y
 * ejemplos), así que el detalle se pinta sin pedir nada más.
 */
import { useEffect, useMemo, useState } from 'react'
import { BookMarked, Loader2, Search, Trash2, Volume2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Canvas3DBackground } from '@/components/Canvas3DBackground'
import { readJson } from '@/lib/api'
import { posLabel } from '@/lib/part-of-speech'
import { type WordCard } from '@/lib/word-cache'
import { speakText } from '@/lib/speech'

/** Ficha del vocabulario: la misma tarjeta más los datos de guardado. */
interface SavedWord extends WordCard {
  saved_id: string
  saved_at: string
  context: string | null
}

const DATE_FMT = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

/** Búsqueda sin tildes ni mayúsculas: "preposicion" encuentra "preposición". */
function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

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
  const [words, setWords] = useState<SavedWord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [posFilter, setPosFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  /** Aviso cuando el equipo no tiene ninguna voz disponible. */
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)

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

  /** Categorías presentes con su recuento, de la más frecuente a la menos. */
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const word of words) {
      counts.set(word.part_of_speech, (counts.get(word.part_of_speech) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [words])

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query.trim())
    return words.filter(word => {
      if (posFilter !== 'all' && word.part_of_speech !== posFilter) return false
      if (!needle) return true
      return [word.word, word.translation, word.part_of_speech].some(field =>
        normalizeSearch(field).includes(needle),
      )
    })
  }, [words, query, posFilter])

  // El aviso de «sin voz» se va solo a los pocos segundos.
  useEffect(() => {
    if (!voiceNotice) return
    const timer = setTimeout(() => setVoiceNotice(null), 9000)
    return () => clearTimeout(timer)
  }, [voiceNotice])

  /**
   * Reproduce un texto y, si el equipo no tiene ninguna voz disponible (ni
   * grabación, ni TTS, ni voces del sistema), lo dice en vez de callarse.
   */
  const pronounce = async (text: string) => {
    const sounded = await speakText(text)
    setVoiceNotice(
      sounded
        ? null
        : 'Este equipo no tiene ninguna voz disponible. En Linux: sudo apt install espeak-ng speech-dispatcher; o configura el TTS del backend.',
    )
  }

  const selected = useMemo(
    () => filtered.find(word => word.saved_id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
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
    <div className="relative min-h-[100vh] w-full bg-black/90">
      <Canvas3DBackground className="opacity-60" />

      {voiceNotice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md rounded-xl border border-amber/40 bg-slate-950/95 px-4 py-3 text-[11px] text-amber shadow-[0_0_25px_-8px_rgba(245,158,11,0.6)]"
        >
          {voiceNotice}
        </div>
      )}

      {/* Contenido */}
      <div className="relative z-10 min-h-screen p-8 font-mono max-w-6xl mx-auto space-y-8 animate-fade-in pt-16 lg:pt-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-body text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
              MI VOCABULARIO
            </h1>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-2">
              {filtered.length === words.length
                ? words.length === 1
                  ? '1 palabra guardada'
                  : `${words.length} palabras guardadas`
                : `${filtered.length} de ${words.length} palabras`}
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
            <div className="space-y-3">
              {/* Buscador: filtra por palabra, traducción o categoría */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Buscar palabra o traducción…"
                  aria-label="Buscar en el vocabulario"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan/50 transition-colors"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Categorías gramaticales con recuento */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setPosFilter('all')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors',
                    posFilter === 'all'
                      ? 'border-cyan/50 bg-cyan/10 text-cyan'
                      : 'border-white/10 text-slate-400 hover:text-white hover:border-white/25',
                  )}
                >
                  Todas ({words.length})
                </button>
                {categories.map(([part, count]) => (
                  <button
                    key={part}
                    onClick={() => setPosFilter(part)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors',
                      posFilter === part
                        ? 'border-cyan/50 bg-cyan/10 text-cyan'
                        : 'border-white/10 text-slate-400 hover:text-white hover:border-white/25',
                    )}
                  >
                    {posLabel(part)} ({count})
                  </button>
                ))}
              </div>

              <div className="space-y-2 lg:max-h-[58vh] lg:overflow-y-auto lg:pr-1">
                {filtered.map(word => {
                  const isActive = selected?.saved_id === word.saved_id
                  return (
                    <div
                      key={word.saved_id}
                      className={cn(
                        'w-full rounded-xl border px-3 py-3 transition-colors flex items-center gap-2',
                        isActive
                          ? 'border-cyan/50 bg-cyan/10 shadow-[0_0_15px_-6px_rgba(6,182,212,0.6)]'
                          : 'border-white/10 bg-white/5 hover:border-white/25',
                      )}
                    >
                      <button
                        onClick={() => setSelectedId(word.saved_id)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className="text-sm font-bold text-white">{word.word}</p>
                        <p className="text-xs text-slate-400 truncate">{word.translation}</p>
                        <p className="text-[9px] uppercase tracking-widest text-slate-600 mt-1">
                          {posLabel(word.part_of_speech)} · {formatSavedAt(word.saved_at)}
                        </p>
                      </button>
                      <button
                        onClick={() => void pronounce(word.word)}
                        aria-label={`Escuchar ${word.word}`}
                        title="Escuchar cómo suena"
                        className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-500 hover:text-cyan hover:border-cyan/40 transition-colors"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}

                {filtered.length === 0 && (
                  <p className="text-[11px] text-slate-500 text-center py-8 border border-dashed border-white/10 rounded-xl">
                    No hay palabras que coincidan con el filtro.
                  </p>
                )}
              </div>
            </div>

            {/* Detalle */}
            {selected && (
              <section className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-white break-words">{selected.word}</h2>
                    <p className="text-[10px] uppercase tracking-widest text-cyan mt-1">
                      {posLabel(selected.part_of_speech, false)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => void pronounce(selected.word)}
                      aria-label={`Escuchar ${selected.word}`}
                      title="Escuchar cómo suena"
                      className="flex items-center gap-1.5 rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-cyan hover:bg-cyan/20 transition-colors"
                    >
                      <Volume2 className="h-4 w-4" /> Escuchar
                    </button>
                    <button
                      onClick={() => remove(selected.saved_id)}
                      disabled={deleting}
                      aria-label="Quitar del vocabulario"
                      className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-500 hover:text-coral hover:border-coral/40 transition-colors disabled:opacity-40"
                    >
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
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
                        <li
                          key={index}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-start gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{example.en}</p>
                            <p className="text-xs text-slate-400 italic">{example.es}</p>
                          </div>
                          <button
                            onClick={() => void pronounce(example.en)}
                            aria-label={`Escuchar: ${example.en}`}
                            title="Escuchar la frase"
                            className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-500 hover:text-cyan hover:border-cyan/40 transition-colors"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
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

                {/* Atribución de las grabaciones (Wikimedia Commons es libre,
                    pero pide citar la fuente). */}
                <p className="text-[10px] text-slate-600">
                  Palabras: grabaciones libres de{' '}
                  <a
                    href="https://commons.wikimedia.org"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-dotted hover:text-cyan transition-colors"
                  >
                    Wikimedia Commons
                  </a>
                  . Frases: voz del navegador (o el TTS configurado).
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
