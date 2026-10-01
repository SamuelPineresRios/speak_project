/**
 * Reproductor de la escena narrativa (fase 2 del flujo de misión).
 *
 * Visual-novel a lo videojuego: dos avatares, burbuja del personaje que
 * habla y controles. El alumno puede avanzar a mano, dejar que se
 * reproduzca sola, repetirla y consultar la traducción de cada frase.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Volume2, X, Languages } from 'lucide-react'
import type { MissionIntroduction } from '@vox/shared'
import { cn } from '@/lib/utils'
import { TypewriterMessage } from './TypewriterMessage'

/** Milisegundos que espera el modo automático tras terminar la frase. */
const AUTOPLAY_NEXT_DELAY_MS = 2200

function avatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(name)}`
}

interface IntroductionPlayerProps {
  introduction: MissionIntroduction
  onFinish: () => void
  onSkip: () => void
}

export function IntroductionPlayer({ introduction, onFinish, onSkip }: IntroductionPlayerProps) {
  const [index, setIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [showTranslations, setShowTranslations] = useState(false)
  const [voice, setVoice] = useState(false)
  const [finished, setFinished] = useState(false)
  const [typeActive, setTypeActive] = useState(true)
  const voiceRef = useRef(voice)
  voiceRef.current = voice

  const total = introduction.lines.length
  const line = introduction.lines[Math.min(index, total - 1)]
  const speaker = introduction.characters.find(character => character.id === line?.speaker)
  const isLastLine = index >= total - 1

  /** Habla la frase en inglés con la voz del navegador, si está activada. */
  const speak = useCallback((text: string) => {
    if (!voiceRef.current || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }, [])

  useEffect(() => {
    if (!line) return
    setTypeActive(true)
    speak(line.text)
    return () => window.speechSynthesis?.cancel()
  }, [line, speak])

  const advance = useCallback(() => {
    if (finished) return
    if (isLastLine) {
      setFinished(true)
      return
    }
    setIndex(value => value + 1)
  }, [finished, isLastLine])

  // Modo automático: avanza cuando la frase termina de escribirse.
  useEffect(() => {
    if (!autoPlay || finished) return
    const timer = setTimeout(advance, AUTOPLAY_NEXT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [autoPlay, finished, index, advance])

  const replay = () => {
    setIndex(0)
    setFinished(false)
    setAutoPlay(false)
  }

  const toggleVoice = () => {
    setVoice(value => {
      const next = !value
      if (!next) window.speechSynthesis?.cancel()
      return next
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950 font-body">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,51,68,0.55)_0%,rgba(2,6,23,0.95)_100%)]" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col gap-4">
        {/* Cabecera de la escena */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cyan uppercase tracking-[0.2em] block">Escena narrativa</span>
            <h2 className="font-body text-2xl font-bold text-white">{introduction.scene_title}</h2>
          </div>
          <button onClick={onSkip} className="text-slate-400 hover:text-white text-[11px] font-mono uppercase tracking-widest flex items-center gap-1">
            <X className="h-4 w-4" /> Saltar
          </button>
        </div>

        {/* Escenario */}
        <div className="bg-slate-900/70 border border-cyan/25 rounded-xl p-3 text-[13px] text-cyan-50/80 leading-relaxed border-l-2 border-cyan/40">
          {introduction.scene_description}
        </div>

        {/* Personajes */}
        <div className="grid grid-cols-2 gap-3">
          {introduction.characters.map(character => {
            const isSpeaking = speaker?.id === character.id && !finished
            return (
              <div
                key={character.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 transition-all duration-500',
                  isSpeaking
                    ? 'border-cyan/60 bg-cyan/10 shadow-[0_0_20px_-5px_rgba(6,182,212,0.45)]'
                    : 'border-white/10 bg-slate-900/70 opacity-60',
                )}
              >
                <img
                  src={avatarUrl(character.name)}
                  alt={character.name}
                  className={cn('h-14 w-14 rounded-lg border transition-all', isSpeaking ? 'border-cyan/50 scale-105' : 'border-white/10 grayscale')}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{character.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{character.role}</p>
                  <p className="text-[9px] font-mono uppercase tracking-widest mt-0.5" style={{ color: isSpeaking ? '#06b6d4' : '#64748B' }}>
                    {isSpeaking ? '● hablando' : character.played_by === 'ai' ? 'lo interpreta la IA' : 'tu papel'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Burbuja del diálogo */}
        <div className="bg-slate-900/95 border border-white/10 rounded-xl p-5 min-h-[130px] flex flex-col justify-center">
          {line && (
            <>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#06b6d4' }}>
                {speaker?.emoji} {speaker?.name}:
              </p>
              <p className="text-slate-100 text-base leading-relaxed">
                <TypewriterMessage text={line.text} isActive={typeActive} speed={22} />
              </p>
              {showTranslations && (
                <p className="mt-3 pt-3 border-t border-white/10 text-[14px] italic text-emerald-300/85">
                  {line.translation}
                </p>
              )}
            </>
          )}
          {finished && (
            <p className="text-center text-emerald font-mono uppercase tracking-widest text-[12px]">
              ✅ Escena completada
            </p>
          )}
        </div>

        {/* Progreso */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{index + 1} / {total}</span>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAutoPlay(value => !value)}
              disabled={finished}
              className={cn(
                'px-3 py-2 rounded-lg border text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors',
                autoPlay ? 'border-amber/50 bg-amber/10 text-amber' : 'border-white/10 text-slate-300 hover:border-white/30',
              )}
            >
              {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {autoPlay ? 'Pausar' : 'Automático'}
            </button>
            <button
              onClick={advance}
              disabled={finished}
              className="px-4 py-2 rounded-lg bg-cyan text-black text-[11px] font-mono font-bold uppercase tracking-widest transition-colors hover:bg-cyan-400 disabled:opacity-40"
            >
              Siguiente ▸
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
            {typeof window !== 'undefined' && window.speechSynthesis && (
              <button
                onClick={toggleVoice}
                className={cn(
                  'px-3 py-2 rounded-lg border text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors',
                  voice ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-white/10 text-slate-300 hover:border-white/30',
                )}
              >
                <Volume2 className="h-3.5 w-3.5" /> Voz
              </button>
            )}
            <button onClick={replay} className="px-3 py-2 rounded-lg border border-white/10 text-slate-300 hover:border-white/30 text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Repetir
            </button>
          </div>
        </div>

        {finished && (
          <button
            onClick={onFinish}
            className="w-full py-4 rounded-xl bg-white text-cyan-900 font-black text-lg uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95"
          >
            Preparar la misión →
          </button>
        )}
      </div>
    </div>
  )
}
