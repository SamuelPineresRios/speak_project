import re

filepath = 'frontend/components/StoryDialogueIntro.tsx'
content = open(filepath, 'r', encoding='utf-8').read()

old_container = """        {/* Dialogue Container */}
        <div className="relative space-y-8 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60 border-2 border-cyan-500/30 rounded-2xl p-12 backdrop-blur-md shadow-2xl">"""

new_container = """        {/* Dialogue Container */}
        <div 
          onClick={handleContainerClick}
          className="relative space-y-8 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60 border-2 border-cyan-500/30 rounded-2xl p-6 md:p-12 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.15)] cursor-pointer hover:border-cyan-400/50 transition-all duration-300 group">"""

content = content.replace(old_container, new_container)

old_typewriter_usage = """                  {idx === currentDialogueIndex ? (
                    <>
                      <TypewriterText text={line.text} speed={30} />
                      <span className="animate-pulse text-cyan-400 ml-1">│</span>
                    </>
                  ) : (
                    renderTextWithInteractiveWords(line.text)
                  )}"""

new_typewriter_usage = """                  {idx === currentDialogueIndex && isTyping ? (
                    <>
                      <TypewriterText 
                        text={line.text} 
                        speed={15} 
                        forceComplete={forceComplete} 
                        onComplete={() => setIsTyping(false)} 
                      />
                      <span className="animate-pulse text-cyan-400 ml-1">│</span>
                    </>
                  ) : (
                    renderTextWithInteractiveWords(line.text)
                  )}"""

content = content.replace(old_typewriter_usage, new_typewriter_usage)

old_next_btn = """          {/* Next Button */}
          {!completed && (
            <div className="relative z-10 flex justify-end pt-6 mt-8 border-t border-slate-700">
              <button
                onClick={handleNextLine}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold uppercase tracking-widest rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95 text-sm"
              >
                {currentDialogueIndex === dialogue.length - 1 ? 'Continuar →' : 'Siguiente →'}
              </button>
            </div>
          )}"""

new_next_btn = """          {/* Continuation Prompt */}
          {!completed && (
            <div className={`absolute bottom-4 right-8 z-10 transition-opacity duration-300 ${!isTyping ? 'opacity-100' : 'opacity-0'}`}>
               <p className="text-cyan-400/80 text-xs md:text-sm font-mono tracking-widest uppercase flex items-center gap-2 animate-bounce">
                  Haz clic para avanzar <span className="text-lg">»</span>
               </p>
            </div>
          )}"""

content = content.replace(old_next_btn, new_next_btn)

content = content.replace('onMouseEnter={() => setHoveredWord(cleanWord)}', 'onClick={(e) => { e.stopPropagation(); setHoveredWord(hoveredWord === cleanWord ? null : cleanWord); }}\n            onMouseEnter={() => setHoveredWord(cleanWord)}')

old_dialog_box = """              <div className="ml-20 bg-slate-800/50 border-l-4 border-cyan-400 pl-6 py-5 rounded-lg">"""
new_dialog_box = """              {/* Animated Dialogue Bubble */}
              <div className="ml-20 bg-slate-800/50 border-l-4 border-cyan-400 pl-6 py-5 rounded-lg transform transition-all duration-500 hover:bg-slate-800/70 hover:shadow-md">"""

content = content.replace(old_dialog_box, new_dialog_box)

open(filepath, 'w', encoding='utf-8').write(content)
print("Updated interactively")
