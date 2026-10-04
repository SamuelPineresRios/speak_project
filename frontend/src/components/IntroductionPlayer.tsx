/**
 * Escena narrativa de la misión (fase 2 del flujo).
 *
 * Planteada como una conversación de lado a lado: los dos personajes se
 * enfrentan en bustos grandes y la burbuja aparece del lado del que habla.
 * El texto se revela palabra a palabra y cada frase se puede escuchar.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Volume2, X, Languages, SkipForward } from 'lucide-react'
import type { IntroductionCharacter, MissionIntroduction } from '@vox/shared'
import { cn } from '@/lib/utils'
import { TypewriterMessage } from './TypewriterMessage'

/** Milisegundos que espera el modo automático tras terminar la frase. */
const AUTOPLAY_NEXT_DELAY_MS = 2400

function avatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(name)}`
}

/** URL del MP3 sintetizado por el backend (voz natural y cacheada). */
function speechUrl(text: string, role: 'A' | 'B'): string {
  return `/api/tts?voice=${role.toLowerCase()}&text=${encodeURIComponent(text)}`
}

/**
 * Identidad visual de cada rol: color del nombre, del texto y de la burbuja.
 * Son clases completas porque Tailwind no genera nombres construidos.
 */
const ROLE_THEME: Record<'A' | 'B', { label: string; text: string; bubble: string; ring: string; dot: string }> = {
  A: {
    label: 'text-cyan',
    text: 'text-cyan-50',
    bubble: 'border-cyan/40',
    ring: 'border-cyan/70 shadow-[0_0_45px_-8px_rgba(6,182,212,0.75)]',
    dot: 'bg-cyan',
  },
  B: {
    label: 'text-violet',
    text: 'text-violet-50',
    bubble: 'border-violet/40',
    ring: 'border-violet/70 shadow-[0_0_45px_-8px_rgba(139,92,246,0.75)]',
    dot: 'bg-violet',
  },
}

/** Color del badge por nivel, para que el nivel se lea de un vistazo. */
const CEFR_BADGE: Record<string, string> = {
  A1: 'border-emerald/50 bg-emerald/10 text-emerald',
  A2: 'border-cyan/50 bg-cyan/10 text-cyan',
  B1: 'border-amber/50 bg-amber/10 text-amber',
  B2: 'border-violet/50 bg-violet/10 text-violet',
  C1: 'border-coral/50 bg-coral/10 text-coral',
}

interface IntroductionPlayerProps {
  introduction: MissionIntroduction
  cefrLevel: string
  onFinish: () => void
  onSkip: () => void
}

/** Busto grande de un personaje, resaltado cuando le toca hablar. */
function CharacterStage({
  character,
  speaking,
  finished,
}: {
  character: IntroductionCharacter
  speaking: boolean
  finished: boolean
}) {
  const theme = ROLE_THEME[character.id]
  return (
    <div className={cn('flex flex-col items-center justify-end transition-all duration-500', speaking ? 'scale-100' : 'scale-95')}>
      <div
        className={cn(
          // El ancho responde al viewport: en móvil manda el ancho de la
          // columna, en escritorio el alto de la pantalla (para que el busto
          // nunca desplace la burbuja ni el pie en portátiles bajos).
          'relative aspect-square w-[min(45vw,12rem,38vh)] sm:w-[min(30vw,24rem,40vh)] overflow-hidden rounded-2xl border-2 transition-all duration-500',
          speaking ? theme.ring : 'border-white/10 opacity-55 grayscale',
        )}
      >
        {/* El sprite de dicebear ya es un busto (cabeza grande y camiseta):
            se muestra entero y a buen tamaño, sin recortes. */}
        <img
          src={avatarUrl(character.name)}
          alt={character.name}
          className="h-full w-full p-2"
        />
        {speaking && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            <span className={cn('w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]', theme.dot)} />
            <span className={cn('w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]', theme.dot)} />
            <span className={cn('w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]', theme.dot)} />
          </span>
        )}
      </div>

      <div className="mt-2 text-center">
        <p className={cn('text-base font-bold transition-colors', speaking ? 'text-white' : 'text-slate-400')}>
          {character.name}
        </p>
        <p className="text-[11px] text-slate-500">{character.role}</p>
        <p className={cn('text-[9px] font-mono uppercase tracking-widest mt-0.5', speaking ? theme.label : 'text-slate-600')}>
          {finished ? '—' : speaking ? '● hablando' : character.played_by === 'ai' ? 'lo interpreta la IA' : 'tu papel'}
        </p>
      </div>
    </div>
  )
}

export function IntroductionPlayer({ introduction, cefrLevel, onFinish, onSkip }: IntroductionPlayerProps) {
  const [index, setIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [showTranslations, setShowTranslations] = useState(false)
  /**
   * La narración empieza sonando: la primera frase se lee nada más montar la
   * escena. El clic que abrió la misión da la activación que exige el
   * navegador para reproducir audio.
   */
  const [voice, setVoice] = useState(true)
  const [finished, setFinished] = useState(false)
  /** Se pone a true cuando la frase actual termina de escribirse. */
  const [lineComplete, setLineComplete] = useState(false)
  const voiceRef = useRef(voice)
  voiceRef.current = voice
  /** Audio en curso del backend; se corta al cambiar de frase. */
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const total = introduction.lines.length
  const line = introduction.lines[Math.min(index, total - 1)]
  const nextLine = introduction.lines[index + 1]
  const lineText = line?.text
  const lineSpeaker = line?.speaker
  const speaker = introduction.characters.find(character => character.id === line?.speaker)
  const isLastLine = index >= total - 1

  /** Corta la voz actual (la del backend o la nativa). */
  const stopVoice = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
  }, [])

  /** Reserva: la voz nativa del navegador, para móviles y equipos sin clave. */
  const speakNative = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }, [])

  /**
   * Lee una frase con la voz natural del backend. Si no hay clave, cuota o
   * red, cae a la voz nativa del navegador (si la tiene).
   */
  const speak = useCallback(
    (text: string, role: 'A' | 'B') => {
      stopVoice()
      const audio = new Audio(speechUrl(text, role))
      audioRef.current = audio
      audio.play().catch(() => {
        if (audioRef.current === audio) speakNative(text)
      })
    },
    [stopVoice, speakNative],
  )

  // Al cambiar de frase: se marca como no escrita y se lee si la voz está activa.
  // Las dependencias son el texto y el hablante, no el objeto `line`: si el
  // padre vuelve a entregar la introducción (nuevo objeto con el mismo
  // contenido), no debe repetirse la frase ni cortarse la que suena.
  useEffect(() => {
    if (!lineText || !lineSpeaker) return
    setLineComplete(false)
    if (voiceRef.current) speak(lineText, lineSpeaker)
    return stopVoice
  }, [lineText, lineSpeaker, speak, stopVoice])

  // Precalienta el MP3 de la siguiente frase: al llegar, suena sin espera.
  useEffect(() => {
    if (!voice || !nextLine) return
    fetch(speechUrl(nextLine.text, nextLine.speaker)).catch(() => {})
  }, [voice, nextLine])

  const advance = useCallback(() => {
    if (finished) return
    if (isLastLine) {
      stopVoice()
      setFinished(true)
      return
    }
    setIndex(value => value + 1)
  }, [finished, isLastLine, stopVoice])

  // Modo automático: espera a que la frase termine de escribirse y deja un
  // margen de lectura antes de pasar a la siguiente.
  useEffect(() => {
    if (!autoPlay || finished || !lineComplete) return
    const timer = setTimeout(advance, AUTOPLAY_NEXT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [autoPlay, finished, lineComplete, index, advance])

  // Espacio o flecha derecha avanzan, como en una novela visual.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  const replay = () => {
    stopVoice()
    setIndex(0)
    setFinished(false)
    setAutoPlay(false)
  }

  const toggleVoice = () => {
    const next = !voice
    setVoice(next)
    if (next && line) speak(line.text, line.speaker)
    else stopVoice()
  }

  const readAloud = () => {
    if (!line) return
    speak(line.text, line.speaker)
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 font-body relative overflow-hidden">
      {/* Fondo del escenario */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(8,51,68,0.6)_0%,rgba(2,6,23,0.97)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e2a38_1px,transparent_1px),linear-gradient(to_bottom,#0e2a38_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

      {/* Cabecera */}
      <header className="relative z-10 shrink-0 flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <span className="text-[10px] text-cyan uppercase tracking-[0.25em] block">Escena narrativa</span>
          <h2 className="font-body text-xl sm:text-2xl font-bold text-white truncate">{introduction.scene_title}</h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={cn('text-xs px-2 py-1 rounded border font-bold', CEFR_BADGE[cefrLevel] ?? CEFR_BADGE.B1)}>
            {cefrLevel}
          </span>
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-white text-[11px] font-mono uppercase tracking-widest flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Saltar
          </button>
        </div>
      </header>

      {/* Escenario + personajes */}
      <div className="relative z-10 shrink-0 px-6">
        <p className="text-[13px] text-cyan-50/75 leading-relaxed border-l-2 border-cyan/40 pl-3">
          {introduction.scene_description}
        </p>
      </div>

      {/* Personajes: centrados verticalmente en el escenario, por encima de la
          burbuja (que vive en su propio bloque al pie). */}
      <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-3 sm:px-6 py-4">
        <div className="grid w-full grid-cols-2 gap-2 sm:gap-16 items-end justify-items-center">
          {introduction.characters.map(character => (
            <CharacterStage
              key={character.id}
              character={character}
              speaking={!finished && speaker?.id === character.id}
              finished={finished}
            />
          ))}
        </div>
      </div>

      {/* Burbuja: aparece del lado del personaje que habla */}
      <div className="relative z-10 shrink-0 px-6 pb-2">
        <div
          className={cn(
            'w-full max-w-2xl transition-all duration-300',
            speaker?.id === 'A' ? 'mr-auto' : 'ml-auto',
          )}
        >
          <div
            className={cn(
              'relative rounded-2xl border bg-slate-900/95 p-5 min-h-[132px] flex flex-col justify-center transition-colors duration-500',
              finished
                ? 'border-emerald/40'
                : speaker
                  ? ROLE_THEME[speaker.id].bubble
                  : 'border-cyan/30',
            )}
          >
            {line && !finished && (
              <>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className={cn('text-[10px] font-mono uppercase tracking-widest', speaker ? ROLE_THEME[speaker.id].label : 'text-cyan')}>
                    {speaker?.emoji} {speaker?.name}
                  </p>
                  <div className="flex items-center gap-3">
                    {!lineComplete && (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 animate-pulse">
                        escribiendo…
                      </span>
                    )}
                    <button
                      onClick={readAloud}
                      title="Escuchar esta frase"
                      aria-label="Escuchar esta frase"
                      className={cn(
                        'transition-colors hover:text-white',
                        speaker ? ROLE_THEME[speaker.id].label : 'text-cyan',
                      )}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className={cn('text-lg leading-relaxed', speaker ? ROLE_THEME[speaker.id].text : 'text-slate-100')}>
                  <TypewriterMessage text={line.text} isActive speed={26} onComplete={() => setLineComplete(true)} />
                </p>

                {showTranslations && lineComplete && (
                  <p className="mt-3 pt-3 border-t border-white/10 text-[14px] italic text-emerald-300/85 animate-in fade-in duration-500">
                    {line.translation}
                  </p>
                )}
              </>
            )}

            {finished && (
              <div className="text-center space-y-2">
                <p className="text-3xl">🏅</p>
                <p className="text-emerald font-mono uppercase tracking-widest text-sm">Escena completada</p>
                <p className="text-[12px] text-slate-400">
                  Desbloqueaste {introduction.useful_expressions.length} expresiones para la misión
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progreso y controles */}
      <footer className="relative z-10 shrink-0 px-6 pb-5 space-y-3">
        {/* Un punto por frase: se encienden al avanzar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Diálogo</span>
          <div className="flex-1 flex items-center gap-1.5">
            {introduction.lines.map((_, lineIndex) => (
              <span
                key={lineIndex}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all duration-500',
                  lineIndex < index || finished
                    ? 'bg-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                    : lineIndex === index
                      ? 'bg-cyan/60 animate-pulse'
                      : 'bg-slate-800',
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{finished ? total : index + 1}/{total}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAutoPlay(value => !value)}
              disabled={finished}
              className={cn(
                'px-3 py-2 rounded-lg border text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors disabled:opacity-40',
                autoPlay ? 'border-amber/50 bg-amber/10 text-amber' : 'border-white/10 text-slate-300 hover:border-white/30',
              )}
            >
              {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {autoPlay ? 'Pausar' : 'Automático'}
            </button>
            <button
              onClick={advance}
              disabled={finished}
              className="px-5 py-2 rounded-lg bg-cyan text-black text-[11px] font-mono font-bold uppercase tracking-widest transition-colors hover:bg-cyan-400 disabled:opacity-40 flex items-center gap-1.5"
            >
              Siguiente <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowTranslations(value => !value)}
              className={cn(
                'px-3 py-2 rounded-lg border text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors',
                showTranslations ? 'border-emerald/50 bg-emerald/10 text-emerald' : 'border-white/10 text-slate-300 hover:border-white/30',
              )}
            >
              <Languages className="h-3.5 w-3.5" /> Traducción
            </button>
            <button
              onClick={toggleVoice}
              className={cn(
                'px-3 py-2 rounded-lg border text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors',
                voice ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-white/10 text-slate-300 hover:border-white/30',
              )}
            >
              <Volume2 className="h-3.5 w-3.5" /> Voz {voice ? 'on' : 'off'}
            </button>
            <button
              onClick={replay}
              className="px-3 py-2 rounded-lg border border-white/10 text-slate-300 hover:border-white/30 text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Repetir
            </button>
          </div>
        </div>

        {finished && (
          <button
            onClick={onFinish}
            className="w-full py-4 rounded-xl bg-white text-cyan-900 font-black text-lg uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95"
          >
            Preparar la misión →
          </button>
        )}
      </footer>
    </div>
  )
}
