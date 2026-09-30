/**
 * Registro de la sesión: las frases que ha usado el alumno.
 *
 * Viven a la derecha del chat de misión. Cada frase llega con su valoración y,
 * si estuvo mal, con la corrección que dio el coach; es la lista que el alumno
 * repasa al terminar para ver qué ha de pulir.
 */
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PhraseEntry {
  /** La frase tal y como la escribió el alumno. */
  content: string
  /** 1-5 si el coach la valoró. */
  rating?: number
  /** La forma correcta, presente cuando rating <= 3. */
  correctedText?: string
}

const RATING_STARS = 5

export function ConversationLog({ entries }: { entries: PhraseEntry[] }) {
  const corrections = entries.filter(
    entry => entry.rating !== undefined && entry.rating <= 3,
  ).length

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-cyan-900/40 bg-slate-900/40 backdrop-blur-sm">
      <header className="shrink-0 border-b border-white/5 px-4 py-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-cyan">
          📊 Tus frases
        </h2>
        <p className="mt-0.5 text-[10px] text-slate-400">
          {entries.length} enviadas · {corrections} con corrección
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto space-y-2 p-3">
        {entries.length === 0 ? (
          <p className="p-3 text-center text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Envía tu primera frase para verla aquí.
          </p>
        ) : (
          // La más reciente arriba: es la que el alumno acaba de escribir.
          [...entries].reverse().map((entry, index) => {
            const failed = entry.rating !== undefined && entry.rating <= 3
            const hasCorrection = failed && Boolean(entry.correctedText)

            return (
              <div
                key={`${entry.content}-${entries.length - index}`}
                className={cn(
                  'rounded-lg border p-2.5',
                  failed
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-emerald-500/20 bg-emerald-500/5',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs leading-relaxed text-slate-200">
                    {entry.content}
                  </p>
                  <span
                    className="shrink-0 text-[10px] text-amber-400"
                    title={entry.rating === undefined ? 'Sin evaluar' : `${entry.rating}/${RATING_STARS}`}
                    aria-label={`${entry.rating ?? 0} de ${RATING_STARS}`}
                  >
                    {'★'.repeat(entry.rating ?? 0)}
                    {'☆'.repeat(RATING_STARS - (entry.rating ?? 0))}
                  </span>
                </div>

                {hasCorrection && (
                  <p className="mt-2 flex items-start gap-1.5 rounded-md bg-emerald-950/30 px-2 py-1.5 text-[11px] font-semibold italic text-emerald-300">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
                    {entry.correctedText}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
