'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface EvaluationPayload {
  comprehensibility_score: number
  grammar_score: number
  lexical_richness_score: number
  judgment: 'ADVANCE' | 'PAUSE'
  feedback_text: string
  detected_structures: string[]
}

interface FeedbackScreenProps {
  evaluation: EvaluationPayload
  missionTitle: string
  studentResponse: string
  onTryAgain?: () => void
  onNextMission?: () => void
}

export function FeedbackScreen({
  evaluation,
  missionTitle,
  studentResponse,
  onTryAgain,
  onNextMission,
}: FeedbackScreenProps) {
  const [visible, setVisible] = useState(false)
  const router = useRouter()
  const isAdvance = evaluation.judgment === 'ADVANCE'

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  // Parse feedback text
  const feedbackParts = evaluation.feedback_text.split('\n\n').filter(Boolean)

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm font-mono text-cyan-50 flex flex-col items-center justify-center p-6 selection:bg-cyan/30 selection:text-cyan-200 animate-in fade-in duration-500">
      
      {/* 🌌 Animated Background - Reduced opacity for overlay effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.5)_0%,rgba(2,6,23,0.8)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div 
        className={cn(
          "relative z-10 w-full max-w-lg flex flex-col gap-6 transition-all duration-1000 ease-out max-h-[90vh] overflow-y-auto custom-scrollbar",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        
        {/* Header Badge */}
        <div className="flex justify-center">
            <div className={cn(
                "px-6 py-2 rounded-lg border-2 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-in zoom-in duration-500",
                isAdvance 
                    ? "bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-emerald-900/40" 
                    : "bg-amber-950/50 border-amber-500 text-amber-400 shadow-amber-900/40"
            )}>
                <span className="text-2xl">{isAdvance ? '🏆' : '⚠️'}</span>
                <div>
                    <h1 className="text-xl font-black uppercase tracking-widest leading-none">
                        {isAdvance ? 'Misión Completada' : 'Misión Fallida'}
                    </h1>
                    <p className="text-[10px] font-mono opacity-80 uppercase tracking-widest mt-1">
                        {isAdvance ? 'Objetivo Logrado' : 'Reintentá'}
                    </p>
                </div>
            </div>
        </div>

        {/* Mission Info */}
        <div className="text-center space-y-3 mb-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Debriefing Report // ID-2039</p>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300 tracking-[0.15em] uppercase font-mono drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                {missionTitle}
              </h2>
              <span className={cn(
                "text-xs px-2 py-1 rounded border font-bold uppercase tracking-widest",
                "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
              )}>
                📝 Text
              </span>
            </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-3 gap-2">
            {[
                { label: 'Comunicación', score: evaluation.comprehensibility_score, color: 'text-cyan-400', stroke: 'stroke-cyan-500' },
                { label: 'Gramática', score: evaluation.grammar_score, color: 'text-violet-400', stroke: 'stroke-violet-500' },
                { label: 'Vocabulario', score: evaluation.lexical_richness_score, color: 'text-amber-400', stroke: 'stroke-amber-500' }
            ].map((metric, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="4" fill="none" />
                            <circle 
                                cx="32" cy="32" r="28" 
                                className={cn("transition-all duration-1000 ease-out", metric.stroke)}
                                strokeWidth="4" 
                                fill="none" 
                                strokeDasharray={175}
                                strokeDashoffset={visible ? 175 - (175 * metric.score) / 100 : 175}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={cn("absolute text-sm font-bold", metric.color)}>{metric.score}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{metric.label}</span>
                </div>
            ))}
        </div>

        {/* System Logs (Feedback) */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 bg-cyan rounded-full animate-pulse" />
                <h3 className="text-xs font-bold text-cyan uppercase tracking-widest">Performance Analysis</h3>
                <div className="h-[1px] bg-cyan/20 flex-1" />
            </div>

            {feedbackParts.map((part, idx) => {
               // Determine part type based on index or content if structured
               // Assuming API returns: Context, Strength, Improvement order
               const type = idx === 0 ? 'context' : idx === 1 ? 'strength' : 'improvement';
               const colors = {
                 context: 'bg-blue-500',
                 strength: 'bg-emerald-500',
                 improvement: 'bg-amber-500'
               };
               
               return (
                <div 
                    key={idx}
                    className={cn(
                        "p-4 pl-5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm relative overflow-hidden transition-all duration-500",
                        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}
                    style={{ transitionDelay: `${idx * 150}ms` }}
                >
                    <div className={cn("absolute top-0 left-0 w-1 h-full", colors[type as keyof typeof colors])} />
                    
                    <p className="text-[10px] uppercase tracking-widest mb-1 opacity-60 font-bold">
                        {type}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-300">
                        {part.replace(/(CONTEXT|ACHIEVEMENT|IMPROVEMENT):/i, '').trim()}
                    </p>
                </div>
            )})}
        </div>

        {/* Transcript Log */}
        {studentResponse && (
             <div className="mt-2 bg-black/40 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-400 overflow-hidden relative">
                 <div className="absolute top-2 right-2 text-[8px] uppercase border border-slate-700 px-1 rounded text-slate-600">Encrypted Log</div>
                      <p className="line-clamp-3 italic opacity-60">
                          &quot;{studentResponse}&quot;
                      </p>
             </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-4 pb-8">
            {isAdvance ? (
                <button
                    onClick={onNextMission ?? (() => router.push('/missions'))}
                    className="w-full py-4 bg-cyan hover:bg-cyan-400 text-black font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 group"
                >
                    <span>Next Mission</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            ) : (
                <button
                    onClick={onTryAgain}
                    className="w-full py-4 bg-amber hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 group"
                >
                    <span>Re-Initialize</span>
                    <span className="group-hover:rotate-180 transition-transform">↻</span>
                </button>
            )}
            
            <button
                onClick={() => router.push('/missions')}
                className="w-full py-3 bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white uppercase text-xs tracking-widest rounded-xl transition-colors"
            >
                Return to Base
            </button>
        </div>

      </div>
    </div>
  )
}
