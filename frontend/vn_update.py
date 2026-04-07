import re

filepath = 'components/StoryDialogueIntro.tsx'
content = open(filepath, 'r', encoding='utf-8').read()

new_component_code = '''  const handleContainerClick = () => {
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

  const currentLine = dialogue[currentDialogueIndex];
  const isPlayerTalking = currentLine?.role !== 'Interviewer' && currentLine?.role !== 'Teacher' && currentLine?.role !== 'Manager' && !currentLine?.role?.toLowerCase().includes('agent');

  return (
    <div className="w-full space-y-6">
      <div className="relative">
        {/* Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-body font-black text-cyan-300 mb-2 tracking-wide uppercase">Briefing de la Misión</h2>
            <p className="text-slate-300 text-sm font-mono opacity-80">
              <span className="text-cyan-400 font-bold">INFO:</span> Haz clic en palabras <span className="underline decoration-dotted">subrayadas</span> para analizar vocabulario.
            </p>
          </div>
          <div className="text-right">
             <div className="text-cyan-500 font-mono text-xl font-bold">{currentDialogueIndex + 1} / {dialogue.length}</div>
             <div className="text-[10px] uppercase tracking-widest text-slate-500">Transmisión</div>
          </div>
        </div>

        {/* Visual Novel Container */}
        <div
          onClick={handleContainerClick}
          className="relative w-full h-[500px] md:h-[600px] bg-slate-950 border-2 border-cyan-900 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] cursor-pointer group transition-all duration-300 hover:border-cyan-500/80"
        >
          {/* Background FX */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.slate.800),theme(colors.slate.950))] opacity-60" />
          <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-slate-900/80 to-transparent z-0" />

          {/* Center Stage Character Avatar */}
          {currentLine && (
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none pb-20 transition-all duration-700 ease-out transform ${isPlayerTalking ? '-translate-x-24 md:-translate-x-48 scale-105' : 'translate-x-24 md:translate-x-48 scale-105'}`}>
              <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center text-8xl md:text-9xl font-black bg-slate-950 border-4 shadow-2xl transition-all duration-700 ${isPlayerTalking ? 'border-cyan-500 text-cyan-400 shadow-cyan-500/20' : 'border-purple-500 text-purple-400 shadow-purple-500/20'}`}>
                {/* Simulated character silhouette / initial */}
                <span className="opacity-80 drop-shadow-[0_0_30px_currentColor]">{currentLine.character[0]}</span>
                
                {/* Decorative Rings */}
                <div className={`absolute inset-[-10px] rounded-full border border-dashed animate-[spin_10s_linear_infinite] ${isPlayerTalking ? 'border-cyan-500/50' : 'border-purple-500/50'}`} />
                <div className={`absolute inset-[-20px] rounded-full border border-dotted opacity-30 animate-[spin_15s_linear_infinite_reverse] ${isPlayerTalking ? 'border-cyan-400' : 'border-purple-400'}`} />
              </div>
            </div>
          )}

          {/* Dialogue Box (Bottom Docked) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 shrink-0 transition-transform duration-300 transform group-active:scale-[0.99]">
             <div className="relative bg-slate-900/80 backdrop-blur-xl border-t border-cyan-500/50 rounded-xl p-8 pt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
                 
                 {/* Name Plate */}
                 <div className={`absolute -top-5 left-8 px-6 py-1.5 rounded-sm border font-body font-black tracking-widest text-lg shadow-lg ${isPlayerTalking ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-purple-900 border-purple-500 text-purple-100'}`}>
                    {currentLine?.character}
                 </div>

                 {/* Role Label */}
                 <div className="absolute top-4 right-8">
                    <span className={`text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${isPlayerTalking ? 'bg-cyan-950/50 text-cyan-400 border-cyan-900' : 'bg-purple-950/50 text-purple-400 border-purple-900'}`}>
                      {currentLine?.role}
                    </span>
                 </div>
                 
                 {/* Text Area */}
                 <div className="min-h-[90px] relative z-10 mt-2">
                    <p className="text-2xl md:text-3xl text-slate-100 font-light leading-relaxed drop-shadow-md">
                        {currentLine && isTyping ? (
                          <>
                            <TypewriterText
                              text={currentLine.text}
                              speed={15}
                              forceComplete={forceComplete}
                              onComplete={() => setIsTyping(false)}
                            />
                            <span className="inline-block w-3 h-7 bg-cyan-400 ml-1 animate-pulse align-middle" />
                          </>
                        ) : (
                          currentLine ? renderTextWithInteractiveWords(currentLine.text) : null
                        )}
                    </p>
                 </div>

                 {/* Next Indicator */}
                 {!completed && (
                   <div className={`absolute bottom-6 right-6 transition-opacity duration-300 ${!isTyping ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="animate-bounce flex items-center gap-2 text-cyan-400 bg-cyan-950/50 px-4 py-1.5 rounded-full border border-cyan-900/80">
                         <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Haz clic para avanzar</span>
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                         </svg>
                      </div>
                   </div>
                 )}
             </div>
          </div>
        </div>

        {/* Completion Action */}
        {completed && (
          <div className="mt-8 flex flex-col items-center justify-center animate-in slide-in-from-bottom-4 duration-500">
            <div className="h-12 w-px bg-gradient-to-b from-cyan-500/50 to-transparent mb-4" />
            <button
              onClick={(e) => { e.stopPropagation(); setCompleted(true); if (onStoryStart) onStoryStart(); }}
              className="px-16 py-5 rounded-2xl font-body font-black uppercase tracking-[0.2em] transition-all duration-300 text-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:-translate-y-1 active:scale-95 border border-emerald-400 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Iniciar Simulación
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Return value for parent component */}
      {completed && <div className="sr-only">Dialogue completed</div>}
    </div>
  )
}'''

# use regex to replace from handleContainerClick to the end of the file.
pattern = re.compile(r'  const handleContainerClick = \(\) => \{.+', re.DOTALL)
result = pattern.sub(new_component_code, content)

open(filepath, 'w', encoding='utf-8').write(result)
print('Updated with Visual Novel design')
