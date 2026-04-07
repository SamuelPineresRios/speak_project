import re

file_path = 'frontend/app/(student)/story/[id]/scene/[sceneId]/page.tsx'
content = open(file_path, 'r', encoding='utf-8').read()

# Add Rating and Analysis message to Analysis Module section
analysis_module_injection = """
          {/* Analysis Module */}
          {feedback.evaluation.rating_1_to_5 && (
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl overflow-hidden mb-6">
                <div className="bg-black/40 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
                        Evaluación de Contexto (IA)
                    </h3>
                    <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                            <span key={star} className={`text-lg ${star <= feedback.evaluation.rating_1_to_5 ? 'text-yellow-400' : 'text-slate-700'}`}>★</span>
                        ))}
                    </div>
                </div>
                {feedback.evaluation.analysis_message && (
                    <div className="p-6 font-mono text-sm text-slate-300">
                        <p className="leading-relaxed">{feedback.evaluation.analysis_message}</p>
                    </div>
                )}
            </div>
          )}

          {/* Grammar Context */}
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl overflow-hidden">
"""

content = content.replace('          {/* Analysis Module */}\n          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl overflow-hidden">', analysis_module_injection)


# Add Alternatives before Recommendations
alternatives_injection = """          {/* Alternatives Grid */}
          {Array.isArray(feedback.evaluation.alternatives) && feedback.evaluation.alternatives.length > 0 && (
             <div className="grid gap-4 md:grid-cols-2 mb-6 mt-6">
                {feedback.evaluation.alternatives.map((alt: any, i: number) => (
                    <div key={i} className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-lg relative overflow-hidden group hover:bg-indigo-950/30 transition-colors">
                        <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mb-2 block border-b border-indigo-500/10 pb-2">Variante {alt.type === 'native' ? 'Nativa' : 'Técnica'}</span>
                        <div className="relative z-10">
                            <p className="text-indigo-100 text-sm mb-1 font-medium">"{alt.phrase}"</p>
                        </div>
                    </div>
                ))}
             </div>
          )}

          {/* Recommendations Grid */}"""

content = content.replace('          {/* Recommendations Grid */}', alternatives_injection)

open(file_path, 'w', encoding='utf-8').write(content)
print("UI updated successfully")
