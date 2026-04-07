'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface NarrativeCharacterProps {
  characterName: string
  judgment?: 'ADVANCE' | 'PAUSE' | null
  dialogue?: string
  isThinking?: boolean
  className?: string
}

const ADVANCE_REACTIONS = [
  "¡Entendido! Reserva confirmada para el 15 de marzo.",
  "Perfect! I got that. Let me help you with the next step.",
  "Great, I understand completely! Moving forward.",
  "Excellent communication! That was very clear.",
]

const PAUSE_REACTIONS = [
  "Hmm... I'm not quite sure what you mean. Could you try again?",
  "Lo siento, no entendí bien. ¿Puedes intentarlo de otra forma?",
  "I got a bit confused. Let me hear that again...",
  "Almost! I understood part of it — try once more.",
]

const CHARACTER_AVATARS: Record<string, { emoji: string; bg: string }> = {
  'Airline Agent': { emoji: '✈️', bg: 'from-sky-600 to-blue-700' },
  'Tech Support': { emoji: '💻', bg: 'from-violet-600 to-purple-700' },
  'Street Guide': { emoji: '🗺️', bg: 'from-emerald-600 to-teal-700' },
  'Market Vendor': { emoji: '🛒', bg: 'from-orange-500 to-amber-600' },
  'Doctor': { emoji: '🩺', bg: 'from-cyan-600 to-blue-700' },
  'Hotel Receptionist': { emoji: '🏨', bg: 'from-indigo-600 to-violet-700' },
  default: { emoji: '👤', bg: 'from-slate-600 to-slate-700' },
}

export function NarrativeCharacter({
  characterName,
  judgment,
  dialogue,
  isThinking,
  className,
}: NarrativeCharacterProps) {
  const [displayDialogue, setDisplayDialogue] = useState(dialogue ?? '')
  const [isAnimating, setIsAnimating] = useState(false)
  const avatar = CHARACTER_AVATARS[characterName] ?? CHARACTER_AVATARS.default

  useEffect(() => {
    if (!judgment) return
    setIsAnimating(true)
    const reactions = judgment === 'ADVANCE' ? ADVANCE_REACTIONS : PAUSE_REACTIONS
    const reaction = dialogue ?? reactions[Math.floor(Math.random() * reactions.length)]
    
    setTimeout(() => {
      setDisplayDialogue(reaction)
      setIsAnimating(false)
    }, 300)
  }, [judgment, dialogue])

  useEffect(() => {
    if (dialogue) setDisplayDialogue(dialogue)
  }, [dialogue])

  return (
    <div className={cn('flex items-start gap-4', className)}>
      {/* Character avatar */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl',
            'shadow-lg border border-white/10',
            avatar.bg,
            judgment === 'ADVANCE' && 'ring-2 ring-emerald/50 shadow-emerald/20',
            judgment === 'PAUSE' && 'ring-2 ring-amber/50 shadow-amber/20',
          )}
        >
          {avatar.emoji}
        </div>
        <p className="text-center text-[10px] text-slate-light mt-1 font-medium">
          {characterName.split(' ')[0]}
        </p>
      </div>

      {/* Dialogue bubble */}
      <div
        className={cn(
          'flex-1 glass rounded-2xl rounded-tl-sm px-4 py-3 min-h-[60px]',
          'transition-all duration-300',
          isAnimating && 'opacity-0 translate-y-1',
          !isAnimating && 'opacity-100 translate-y-0',
          judgment === 'ADVANCE' && 'border-emerald/30',
          judgment === 'PAUSE' && 'border-amber/30',
        )}
      >
        {isThinking ? (
          <div className="flex items-center gap-1.5 h-8">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-slate-light rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/90 leading-relaxed font-body">
            {displayDialogue || '...'}
          </p>
        )}
      </div>
    </div>
  )
}
