'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const PHRASES = [
  "Can I help you today?",
  "I'd like to book a flight.",
  "My computer won't start.",
  "Where is the train station?",
  "Table for two, please.",
  "Nice to meet you!",
  "Is there a discount?",
  "I have a reservation.",
  "Just looking, thanks.",
  "How much is this?",
  "Excuse me, officer.",
]

const LANES = [20, 45, 70, 95] // Percentages from top

interface Sprite {
  id: number
  x: number // percent
  laneIndex: number
  seed: string
  phrase: string
  direction: 'left' | 'right'
  speed: number
  opacity: number
}

export function BackgroundSprites() {
  const [sprites, setSprites] = useState<Sprite[]>([])

  useEffect(() => {
    // Helper function to create a sprite
    const createRandomSprite = (id: number): Sprite => {
      const isRight = Math.random() > 0.5
      const laneIndex = Math.floor(Math.random() * LANES.length)
      return {
        id,
        x: Math.random() * 100,
        laneIndex, // Assign to a specific lane
        seed: Math.random().toString(36).substring(7),
        phrase: PHRASES[Math.floor(Math.random() * PHRASES.length)],
        direction: isRight ? 'right' : 'left',
        speed: 0.04 + Math.random() * 0.06,
        opacity: 0.7 + Math.random() * 0.3
      }
    }

    // Initialize 
    setSprites(Array.from({ length: 5 }).map((_, i) => createRandomSprite(i)))

    const interval = setInterval(() => {
      setSprites(current => 
        current.map(sprite => {
          let newX = sprite.x + (sprite.direction === 'right' ? sprite.speed : -sprite.speed)
          let updatedSprite = { ...sprite, x: newX }

          if (newX > 115 || newX < -15) {
            const isRight = Math.random() > 0.5
            updatedSprite = {
              ...sprite,
              x: isRight ? -15 : 115,
              laneIndex: Math.floor(Math.random() * LANES.length), // Pick new lane
              direction: isRight ? 'right' : 'left',
              seed: Math.random().toString(36).substring(7),
              phrase: PHRASES[Math.floor(Math.random() * PHRASES.length)],
              speed: 0.04 + Math.random() * 0.06
            }
          }
          return updatedSprite
        })
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Draw "Paths" (Lanes) */}
      {LANES.map((top, i) => (
        <div 
          key={i} 
          className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan/10 to-transparent" 
          style={{ top: `${top + 8}%` }} // Offset to be under feet
        />
      ))}

      {sprites.map(sprite => (
        <div 
          key={sprite.id}
          className="absolute transition-transform will-change-transform ease-linear"
          style={{ 
            left: `${sprite.x}%`, 
            top: `${LANES[sprite.laneIndex]}%`,
            opacity: sprite.opacity,
            zIndex: LANES[sprite.laneIndex], // Lower lanes overlap higher ones correctly
            transitionDuration: '50ms',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="relative group flex flex-col items-center">
            {/* Speech Bubble */}
            <div className={`
              mb-1 px-3 py-2 bg-slate-900/90 backdrop-blur-sm border border-cyan/30 
              text-[10px] text-cyan-200 font-mono rounded-lg whitespace-nowrap
              relative shadow-[0_0_15px_rgba(6,182,212,0.2)]
              transition-opacity duration-300
              ${sprite.x > 90 || sprite.x < 10 ? 'opacity-0' : 'opacity-100'}
            `}>
              {sprite.phrase}
              {/* Bubble Tail */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 border-r border-b border-cyan/30 rotate-45"></div>
            </div>

            {/* Constructed Full-Body Agent Sprite */}
            <div className={`transform transition-transform ${sprite.direction === 'left' ? 'scale-x-[-1]' : ''}`}>
              <div className="relative flex flex-col items-center">
                {/* 1. Head (Pixel Art API) */}
                <img 
                  src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${sprite.seed}`} 
                  alt="Head"
                  className="w-12 h-12 z-10 relative drop-shadow-sm" 
                  style={{ imageRendering: 'pixelated' }}
                />
                
                {/* 2. Audio/Tech Headset (CSS) */}
                <div className="absolute top-4 -right-1 w-2 h-4 bg-cyan-400 rounded-full z-20 shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                
                {/* 3. Torso (Uniform) */}
                <div className="w-8 h-9 bg-slate-800 rounded-sm relative z-0 -mt-2 border-t border-white/10 flex justify-center">
                    {/* Vest Detail */}
                    <div className="w-4 h-full bg-slate-700/50" />
                    {/* Agent Badge */}
                    <div className="absolute top-2 right-1.5 w-2 h-1.5 bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.6)]" />
                    
                    {/* Arm Left (Swinging) */}
                    <div className="absolute -left-2 top-0 w-2.5 h-8 bg-slate-800 rounded-sm origin-top animate-[arm-swing_1s_infinite_ease-in-out]" 
                         style={{ animationDelay: '0.5s' }} />
                    {/* Arm Right (Swinging) */}
                    <div className="absolute -right-2 top-0 w-2.5 h-8 bg-slate-800 rounded-sm origin-top animate-[arm-swing_1s_infinite_ease-in-out]" />
                </div>

                {/* 4. Legs (Walking Animation) */}
                <div className="flex gap-1 -mt-1 relative z-0">
                    {/* Leg Left */}
                    <div className="w-3 h-8 bg-slate-900 rounded-b-sm origin-top" style={{ animation: 'leg-walk 0.8s infinite alternate ease-in-out' }}>
                      <div className="absolute bottom-0 w-full h-2 bg-black opacity-60" />
                    </div>
                    {/* Leg Right */}
                    <div className="w-3 h-8 bg-slate-900 rounded-b-sm origin-top" style={{ animation: 'leg-walk 0.8s infinite alternate-reverse ease-in-out' }}>
                      <div className="absolute bottom-0 w-full h-2 bg-black opacity-60" />
                    </div>
                </div>
              </div>
            </div>

            {/* Shadow */}
            <div className="w-10 h-1.5 bg-black/40 blur-sm rounded-full mt-[-2px]" />

            {/* Inline Styles for Custom Walk Animations */}
            <style jsx>{`
              @keyframes leg-walk {
                0% { transform: rotate(-15deg); }
                100% { transform: rotate(15deg); }
              }
              @keyframes arm-swing {
                0%, 100% { transform: rotate(10deg); }
                50% { transform: rotate(-10deg); }
              }
            `}</style>
          </div>
        </div>
      ))}
    </div>
  )
}
