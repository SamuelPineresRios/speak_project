'use client'

interface CharacterDisplayProps {
  character: 'alex' | 'dubois' | 'sophie' | 'comte'
  position?: 'left' | 'right' | 'center'
  isRevealed?: boolean
  mood?: 'neutral' | 'angry' | 'nervous' | 'confident' | 'revealed'
}

export function CharacterDisplay({ character, position = 'right', isRevealed = false, mood = 'neutral' }: CharacterDisplayProps) {
  const getCharacterSVG = () => {
    switch (character) {
      case 'alex':
        return (
          <svg viewBox="0 0 100 140" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle cx="50" cy="25" r="18" fill="#d4a574" stroke="#000" strokeWidth="2" />
            {/* Hair - stern */}
            <rect x="32" y="8" width="36" height="18" rx="8" fill="#3d2817" stroke="#000" strokeWidth="2" />
            {/* Eyes - serious */}
            <rect x="40" y="20" width="4" height="6" fill="#000" />
            <rect x="56" y="20" width="4" height="6" fill="#000" />
            {/* Mouth - stern line when not revealed */}
            {isRevealed && mood === 'revealed' ? (
              <>
                <path d="M 45 34 Q 50 36 55 34" stroke="#000" strokeWidth="2" fill="none" />
              </>
            ) : (
              <line x1="43" y1="32" x2="57" y2="32" stroke="#000" strokeWidth="2" />
            )}
            {/* Uniform - Guard outfit */}
            <rect x="32" y="45" width="36" height="50" fill="#1a1a2e" stroke="#000" strokeWidth="2" rx="4" />
            {/* Badge */}
            <rect x="45" y="55" width="10" height="12" fill="#ffd700" stroke="#000" strokeWidth="1" rx="2" />
            {/* Arms */}
            <rect x="20" y="50" width="12" height="35" fill="#d4a574" stroke="#000" strokeWidth="2" rx="4" />
            <rect x="68" y="50" width="12" height="35" fill="#d4a574" stroke="#000" strokeWidth="2" rx="4" />
            {/* Legs */}
            <rect x="35" y="100" width="10" height="35" fill="#2d2d2d" stroke="#000" strokeWidth="2" rx="3" />
            <rect x="55" y="100" width="10" height="35" fill="#2d2d2d" stroke="#000" strokeWidth="2" rx="3" />
          </svg>
        )
      case 'dubois':
        return (
          <svg viewBox="0 0 100 140" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle cx="50" cy="25" r="18" fill="#c9a876" stroke="#000" strokeWidth="2" />
            {/* Hair - white/grey */}
            <path d="M 32 18 Q 50 5 68 18 Q 68 20 32 20 Z" fill="#e0e0e0" stroke="#000" strokeWidth="2" />
            {/* Eye wrinkles */}
            <line x1="38" y1="22" x2="35" y2="25" stroke="#888" strokeWidth="1" />
            <line x1="62" y1="22" x2="65" y2="25" stroke="#888" strokeWidth="1" />
            {/* Eyes - wise */}
            <circle cx="42" cy="23" r="2" fill="#000" />
            <circle cx="58" cy="23" r="2" fill="#000" />
            {/* Smile - knowing */}
            <path d="M 45 32 Q 50 35 55 32" stroke="#000" strokeWidth="2" fill="none" />
            {/* Dress - elegant */}
            <polygon points="32,45 68,45 65,100 35,100" fill="#4a3728" stroke="#000" strokeWidth="2" />
            {/* Brooch */}
            <circle cx="50" cy="50" r="4" fill="#ffd700" stroke="#000" strokeWidth="1" />
            {/* Shawl/Scarf */}
            <path d="M 32 48 Q 20 50 25 65" fill="none" stroke="#8b7355" strokeWidth="3" />
            <path d="M 68 48 Q 80 50 75 65" fill="none" stroke="#8b7355" strokeWidth="3" />
            {/* Legs */}
            <rect x="38" y="100" width="8" height="35" fill="#2d2d2d" stroke="#000" strokeWidth="2" rx="2" />
            <rect x="54" y="100" width="8" height="35" fill="#2d2d2d" stroke="#000" strokeWidth="2" rx="2" />
          </svg>
        )
      case 'sophie':
        return (
          <svg viewBox="0 0 100 140" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle cx="50" cy="25" r="16" fill="#d9b895" stroke="#000" strokeWidth="2" />
            {/* Hair - long brown */}
            <path d="M 34 20 Q 34 8 50 6 Q 66 8 66 20" fill="#6b4423" stroke="#000" strokeWidth="2" />
            {/* Eyes - nervous */}
            <circle cx="44" cy="22" r="2.5" fill="#000" />
            <circle cx="56" cy="22" r="2.5" fill="#000" />
            {/* Worried eyebrows */}
            <path d="M 42 18 Q 44 16 46 18" stroke="#000" strokeWidth="1.5" fill="none" />
            <path d="M 54 18 Q 56 16 58 18" stroke="#000" strokeWidth="1.5" fill="none" />
            {/* Mouth - uncertain */}
            <path d="M 45 30 Q 50 28 55 30" stroke="#000" strokeWidth="1.5" fill="none" />
            {/* Dress - simple, pink undertone */}
            <polygon points="32,42 68,42 62,100 38,100" fill="#e8b4c8" stroke="#000" strokeWidth="2" />
            {/* Hair flow down */}
            <path d="M 36 35 Q 32 50 35 75" fill="none" stroke="#6b4423" strokeWidth="2.5" />
            <path d="M 64 35 Q 68 50 65 75" fill="none" stroke="#6b4423" strokeWidth="2.5" />
            {/* Legs */}
            <rect x="40" y="100" width="7" height="35" fill="#dda0b7" stroke="#000" strokeWidth="2" rx="2" />
            <rect x="53" y="100" width="7" height="35" fill="#dda0b7" stroke="#000" strokeWidth="2" rx="2" />
          </svg>
        )
      case 'comte':
        return (
          <svg viewBox="0 0 100 140" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle cx="50" cy="25" r="17" fill="#d4a574" stroke="#000" strokeWidth="2" />
            {/* Hair - styled */}
            <path d="M 33 15 Q 50 6 67 15 L 65 28 Q 50 25 35 28 Z" fill="#3d2817" stroke="#000" strokeWidth="2" />
            {/* Monocle */}
            <circle cx="62" cy="23" r="3.5" fill="none" stroke="#000" strokeWidth="2" />
            <line x1="65" y1="23" x2="68" y2="23" stroke="#000" strokeWidth="1" />
            {/* Eyes - suspicious */}
            <circle cx="44" cy="23" r="2" fill="#000" />
            <circle cx="56" cy="23" r="2" fill="#000" />
            {/* Mouth - refined but tense */}
            <path d="M 44 32 Q 50 33 56 32" stroke="#000" strokeWidth="1.5" fill="none" />
            {/* Coat - aristocratic */}
            <polygon points="28,42 72,42 68,105 32,105" fill="#2c1810" stroke="#000" strokeWidth="2" />
            {/* Vest inside */}
            <polygon points="38,48 62,48 60,85 40,85" fill="#8b6914" stroke="#000" strokeWidth="1.5" />
            {/* Cravat */}
            <polygon points="46,42 54,42 50,50" fill="#d4af37" stroke="#000" strokeWidth="1" />
            {/* Legs - formal */}
            <rect x="36" y="105" width="9" height="30" fill="#1a1a1a" stroke="#000" strokeWidth="2" rx="2" />
            <rect x="55" y="105" width="9" height="30" fill="#1a1a1a" stroke="#000" strokeWidth="2" rx="2" />
          </svg>
        )
    }
  }

  const positionClass = {
    'left': 'absolute left-0 top-1/2 -translate-y-1/2',
    'right': 'absolute right-0 top-1/2 -translate-y-1/2',
    'center': 'relative mx-auto'
  }[position]

  return (
    <div className={`${positionClass} w-32 h-auto pointer-events-none animate-in fade-in duration-500`}>
      {getCharacterSVG()}
    </div>
  )
}
