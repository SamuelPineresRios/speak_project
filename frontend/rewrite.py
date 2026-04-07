# -*- coding: utf-8 -*-
import codecs

with codecs.open('components/StoryDialogueIntro.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

index = text.find('export function StoryDialogueIntro')
header = text[:index]

new_component = '''export function StoryDialogueIntro({ storyId, dialogueLines, onStoryStart }: { storyId: string; onStoryStart?: () => void; dialogueLines?: DialogueLine[] }) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [forceComplete, setForceComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const dialogue = dialogueLines || getDialogueForStory(storyId)
  const currentLine = dialogue[currentDialogueIndex]
  const isPlayerTalking = currentDialogueIndex % 2 !== 0

  const renderTextWithInteractiveWords = (text: string) => {
    const words = text.split(/(\\\\s+)/)
    return words.map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '')
      const definition = VOCABULARY_DB[cleanWord]

      if (definition) {
        return (
          <span
            key={idx}
            className="relative group cursor-help"
            onClick={(e) => { e.stopPropagation(); setHoveredWord(hoveredWord === cleanWord ? null : cleanWord); }}
            onMouseEnter={() => setHoveredWord(cleanWord)}
            onMouseLeave={() => setHoveredWord(null)}
          >
            <span className={"underline decoration-dashed decoration-[2px] transition-all duration-300 font-bold " + (isPlayerTalking ? "text-red-400 decoration-red-500/50 hover:text-red-200 hover:bg-red-500/20" : "text-blue-400 decoration-blue-500/50 hover:text-blue-200 hover:bg-blue-500/20")}>
              {word}
            </span>

            {/* Tech Datapad Tooltip */}
            {hoveredWord === cleanWord && (
              <div className={"absolute left-1/2 -translate-x-1/2 bottom-[130%] z-[100] w-80 p-5 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-sm pointer-events-none transition-all " + (isPlayerTalking ? "shadow-[0_0_40px_rgba(220,38,38,0.3)] border-t-red-500/50" : "shadow-[0_0_40px_rgba(6,182,212,0.3)] border-t-blue-500/50")}>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
                
                <div className="space-y-4">
                  {/* Tooltip Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.3em] block mb-1">TARGET_DATA</span>
                      <p className={"font-mono font-black text-xl tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] " + (isPlayerTalking ? "text-red-400" : "text-blue-400")}>{definition.word}</p>
                    </div>
                    <span className={"mt-1 text-[10px] px-2 py-0.5 border rounded-sm font-mono tracking-widest uppercase shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] " + (isPlayerTalking ? "bg-red-950/40 border-red-500/30 text-red-300" : "bg-blue-950/40 border-blue-500/30 text-blue-300")}>
                      {definition.partOfSpeech}
                    </span>
                  </div>
                  
                  {/* Tooltip Body */}
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-slate-500 rotate-45 inline-block"></span> SYS.DEF:
                    </p>
                    <p className="text-slate-200 text-sm leading-relaxed">{definition.definition}</p>
                  </div>
                  
                  {/* Tooltip Example */}
                  <div className="bg-white/5 p-3 rounded-sm border border-white/5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/20" />
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">SYS.EXAMPLE:</p>
                    <p className="text-slate-300 text-xs italic font-mono leading-relaxed">\\"{definition.example}\\"</p>
                  </div>
                </div>

                {/* Decorative Tech Corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/30" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/30" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/30" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/30" />
                
                {/* Pointer arrow down */}
                <div className="absolute left-1/2 -ml-2 -bottom-2 w-4 h-4 bg-[#0a0a0a] border-b border-r border-white/10 transform rotate-45" />
              </div>
            )}
          </span>
        )
      }

      return <span key={idx}>{word}</span>
    })
  }

  const handleContainerClick = () => {
    if (completed) return;

    if (isTyping) {
      setForceComplete(true);
    } else {
      if (currentDialogueIndex < dialogue.length - 1) {
        setCurrentDialogueIndex(currentDialogueIndex + 1);
        setIsTyping(true);
        setForceComplete(false);
      } else {
        setCompleted(true);
      }
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans">
      {/* Tech HUD Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
            <svg className="w-7 h-7 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-sm animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="text-[10px] font-mono text-emerald-400 tracking-[0.3em] uppercase">Conexion Cifrada / ACTIVA</span>
            </div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Briefing [Mision]
            </h2>
          </div>
        </div>
        
        {/* Progress Tracker Widget */}
        <div className="flex flex-col md:items-end">
           <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Bloque de Datos: {currentDialogueIndex + 1}/{dialogue.length}</div>
           <div className="flex items-center gap-1.5">
             {dialogue.map((_, i) => (
                <div key={i} className={"h-1.5 transition-all duration-500 rounded-full " + (i === currentDialogueIndex ? (isPlayerTalking ? "w-8 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : "w-8 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]") : i < currentDialogueIndex ? "w-2 bg-slate-500" : "w-2 bg-slate-800")}></div>
             ))}
           </div>
        </div>
      </div>

      {/* Warning Box */}
      <div className="text-[11px] md:text-xs font-mono text-slate-400 bg-black/40 p-3 rounded-md border-l-2 border-amber-500/50 flex items-start gap-3 backdrop-blur-sm">
        <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="leading-relaxed">
          <strong className="text-amber-400 mr-2">INFO_SYS:</strong> 
          Interaccion requerida. Pulse en el panel para decodificar la transmision. Los identificadores <span className="text-white underline decoration-dashed decoration-white/50 cursor-help">subrayados</span> permiten extraer metadatos del vocabulario.
        </span>
      </div>

      {/* Main HUD Container */}
      <div className="relative">
        <div
          onClick={handleContainerClick}
          className={"relative w-full h-[400px] md:h-[500px] bg-[#030712] border rounded-lg cursor-pointer group transition-all duration-500 overflow-hidden shadow-2xl " + (isPlayerTalking ? "border-red-900/30 shadow-[0_10px_50px_rgba(220,38,38,0.08)] hover:border-red-500/50" : "border-blue-900/30 shadow-[0_10px_50px_rgba(6,182,212,0.08)] hover:border-blue-500/50")}
        >
          {/* Tech Pattern Grid */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black via-[#030712]/90 to-transparent pointer-events-none" />

          {/* HUD Target Brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-white/20 pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-white/20 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-white/20 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-white/20 pointer-events-none" />

          {/* Center Holo-Avatar */}
          {currentLine && (
            <div className={"absolute inset-0 flex items-center justify-center pointer-events-none pb-28 md:pb-20 transition-transform duration-700 ease-in-out " + (isPlayerTalking ? "-translate-x-16 md:-translate-x-44" : "translate-x-16 md:translate-x-44")}>
              
              <div className={"relative w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center text-7xl font-black bg-black transition-all duration-700 " + (isPlayerTalking ? "text-red-500 shadow-[0_0_60px_rgba(220,38,38,0.3)]" : "text-blue-400 shadow-[0_0_60px_rgba(6,182,212,0.3)]")}>
                
                {/* Core Avatar Initial */}
                <span className="opacity-90 drop-shadow-[0_0_30px_currentColor] z-10 font-body relative uppercase">
                  {currentLine.character[0]}
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-black/50 mix-blend-overlay z-20 pointer-events-none" />
                
                {/* Tactical Rings */}
                <div className={"absolute inset-[-4px] rounded-full border border-white/10"} />
                <div className={"absolute inset-[-15px] rounded-full border-t-[2px] border-r-[2px] border-transparent animate-[spin_3s_linear_infinite] " + (isPlayerTalking ? "border-t-red-500 border-r-red-500/20" : "border-t-blue-400 border-r-blue-400/20")} />
                <div className={"absolute inset-[-25px] rounded-full border border-dotted opacity-60 animate-[spin_10s_linear_infinite_reverse] " + (isPlayerTalking ? "border-red-400/50" : "border-blue-400/50")} />
                
                {/* Scanners */}
                <div className={"absolute w-[150%] h-[1px] opacity-30 transition-transform duration-1000 " + (isPlayerTalking ? "bg-red-500" : "bg-blue-400")} />
                <div className={"absolute h-[150%] w-[1px] opacity-30 transition-transform duration-1000 " + (isPlayerTalking ? "bg-red-500" : "bg-blue-400")} />
              </div>
            </div>
          )}

          {/* Dialogue Monitor Console */}
          <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 shrink-0 z-20 transition-transform transform duration-150 group-active:scale-[0.995]">
             <div className={"relative bg-black/85 backdrop-blur-xl border border-white/10 rounded-sm p-5 md:p-8 shadow-2xl " + (isPlayerTalking ? "border-t-red-500/80 shadow-[0_-10px_40px_rgba(220,38,38,0.15)]" : "border-t-blue-500/80 shadow-[0_-10px_40px_rgba(6,182,212,0.15)]")}>
                 
                 {/* Internal console decorations */}
                 <div className="absolute top-0 left-0 w-16 h-[2px] bg-white/30" />
                 <div className={"absolute top-0 right-0 w-32 h-[2px] " + (isPlayerTalking ? "bg-red-500" : "bg-blue-500")} />
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20" />

                 <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                   <div className="flex items-center gap-3">
                     {/* Role Tag */}
                     <div className={"px-2.5 py-0.5 font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase rounded-sm border " + (isPlayerTalking ? "bg-red-950/40 text-red-400 border-red-900/50" : "bg-blue-950/40 text-blue-400 border-blue-900/50")}>
                        &gt;&gt; {currentLine?.role}
                     </div>
                     {/* Character Name */}
                     <div className="text-xl md:text-2xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {currentLine?.character}
                     </div>
                   </div>
                   
                   <div className={"hidden md:block text-[10px] font-mono tracking-widest ml-4 " + (isPlayerTalking ? "text-red-500/60" : "text-blue-500/60")}>
                        [T-HASH: D_{currentDialogueIndex}X9]
                   </div>
                 </div>

                 {/* Text Viewport */}
                 <div className="min-h-[90px] relative z-10 pl-3 md:pl-5 border-l-2 border-white/10">
                    <p className="text-lg md:text-2xl text-slate-100 font-medium leading-relaxed drop-shadow-md">
                        {currentLine && isTyping ? (
                          <>
                            <TypewriterText
                              text={currentLine.text}
                              speed={15}
                              forceComplete={forceComplete}
                              onComplete={() => setIsTyping(false)}
                            />
                            <span className={"inline-block w-2.5 h-5 md:h-6 ml-1.5 animate-pulse align-middle " + (isPlayerTalking ? "bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.8)]" : "bg-blue-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]")} />
                          </>
                        ) : (
                          currentLine ? renderTextWithInteractiveWords(currentLine.text) : null
                        )}
                    </p>
                 </div>

                 {/* Action Request Indicator */}
                 {!completed && (
                   <div className={"absolute bottom-4 right-4 md:bottom-6 md:right-6 transition-all duration-500 " + (!isTyping ? "opacity-100" : "opacity-0 translate-y-2 pointer-events-none")}>
                      <div className={"flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] animate-pulse hover:bg-white/10 transition-colors " + (isPlayerTalking ? "text-red-300" : "text-blue-300")}>
                         <div className={"w-1.5 h-1.5 rounded-full animate-ping " + (isPlayerTalking ? "bg-red-400" : "bg-blue-400")}></div>
                         <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em]">Siguiente</span>
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                         </svg>
                      </div>
                   </div>
                 )}
             </div>
          </div>
        </div>

        {/* Global Action Terminal */}
        {completed && (
          <div className="mt-8 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 relative z-30">
            <div className="h-6 w-px bg-white/20 mb-4" />
            <button
              onClick={(e) => { e.stopPropagation(); setCompleted(true); if (onStoryStart) onStoryStart(); }}
              className="relative px-10 py-4 font-mono font-black uppercase tracking-[0.3em] transition-all duration-300 text-sm md:text-base text-black bg-emerald-400 hover:bg-emerald-300 active:scale-95 shadow-[0_0_40px_rgba(52,211,153,0.4)] hover:shadow-[0_0_60px_rgba(52,211,153,0.6)] group overflow-hidden rounded-sm"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-black/50" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-black/50" />

              <div className="relative z-10 flex items-center gap-3">
                <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                INICIAR _ SIMULACION
              </div>
            </button>
          </div>
        )}
      </div>

      {completed && <div className="sr-only">Dialogue completed</div>}
    </div>
  )
}
'''

with codecs.open('components/StoryDialogueIntro.tsx', 'w', encoding='utf-8') as f:
    f.write(header + new_component)

print('Success rewriting component')
