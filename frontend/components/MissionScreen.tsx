'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Timer } from './Timer'
import { NarrativeCharacter } from './NarrativeCharacter'
import { TypewriterMessage } from './TypewriterMessage'
import { ResponsiveBackgroundSprites } from './ResponsiveBackgroundSprites'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'

interface Mission {
  id: string; title: string; objective: string; scene_context: string
  character_name: string; cefr_level: string; base_duration_seconds: number
  key_verbs?: string[]
  useful_phrases?: string[]
  grammar_tips?: string
}
interface MissionScreenProps {
  mission: Mission; studentId: string; groupId?: string
}
    type MissionState = 'briefing' | 'active' | 'submitting'

interface BriefingData {
  key_verbs: string[]
  useful_phrases: string[]
  grammar_tips: string
  estimated_duration_minutes: number
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  feedback?: string
  rating?: number // 1-5
}

export function MissionScreen({ mission, studentId, groupId }: MissionScreenProps) {
  const { user } = useAuth()
  const [state, setState] = useState<MissionState>('briefing')
  
  // Generate briefing data immediately from mission
  const briefing: BriefingData = {
    key_verbs: mission.key_verbs || ['learn', 'practice', 'communicate'],
    useful_phrases: mission.useful_phrases || ['Let me practice', 'I understand', 'Can you repeat?'],
    grammar_tips: mission.grammar_tips || 'Focus on correct grammar and clear pronunciation',
    estimated_duration_minutes: Math.ceil(mission.base_duration_seconds / 60),
  }
  
  const [missionMode, setMissionMode] = useState<'free' | 'evaluation'>('free')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isLastMessageTyping, setIsLastMessageTyping] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [dynamicHints, setDynamicHints] = useState<BriefingData | null>(null)
  const [loadingHints, setLoadingHints] = useState(false)
  const [showCompletionNotification, setShowCompletionNotification] = useState(false)
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false)
  const [missionProgress, setMissionProgress] = useState(0)
  const [timerDuration, setTimerDuration] = useState(mission.base_duration_seconds)
  const [timerKey, setTimerKey] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // Initial bot message on start (when button clicked)
  const startMission = useCallback(async (mode: 'free' | 'evaluation') => {
    setMissionMode(mode)
    setState('active'); setStartTime(Date.now())
    setIsThinking(true)
    
    // Initial system prompt + optional fake first message or trigger API
    // Let's trigger the API to get the first greeting based on context
    try {
        const initialMessages: Message[] = []
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                mode: 'chat',
                missionMode: mode,
                messages: initialMessages, 
                mission, 
                userLevel: user?.cefr_level || mission.cefr_level 
            })
        })
        const data = await res.json()
        if (data.message) {
            setMessages([data.message])
            setIsLastMessageTyping(true)
            if (mode === 'evaluation' && data.estimated_time) {
                setTimerDuration(data.estimated_time)
                setTimerKey(prev => prev + 1)
                setTimedOut(false)
            }
        } else {
            console.error('No message in start response', data)
            // Fallback message if API fails
            setMessages([{ role: 'assistant', content: "System: Connection established. Please initiate the conversation." }])
            setIsLastMessageTyping(true)
        }
    } catch (e) {
        console.error(e)
        // Fallback message if API fails
        setMessages([{ role: 'assistant', content: "System: Connection error. Please try refreshing." }])
        setIsLastMessageTyping(true)
    } finally {
        setIsThinking(false)
        setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [mission, user])

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isThinking) return;
    
    const userMsg: Message = { role: 'user', content: currentInput.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setCurrentInput('')
    setIsThinking(true)
    setIsLastMessageTyping(false)
    setTimedOut(false) // Reset timeout state on user action

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                mode: 'chat',
                missionMode,
                messages: newMessages, 
                mission, 
                userLevel: user?.cefr_level || mission.cefr_level 
            })
        })
        const data = await res.json()
        if (data.message) {
            // Store the rating on the *User's* message (the one we just sent)
            // But the API returns the rating for the *User's* message in the *Assistant's* payload usually.
            // Wait, the API returns { message: { role: 'assistant', ... }, feedback: ..., rating: ... }
            // Let's attach the rating to the ASSISTANT message for easier rendering, 
            // OR update the previous user message. Updating state array is harder.
            // Let's attach it to the incoming message object as metadata about the *previous* turn.
            
            const newAssistantMsg = { 
                ...data.message, 
                // feedback: data.feedback, // DON'T attach feedback to assistant message 
                rating: undefined 
            }
            // Update the LAST user message with the feedback and rating
             setMessages(current => {
                const updated = [...current]
                const lastUserIdx = updated.findLastIndex(m => m.role === 'user')
                if (lastUserIdx !== -1) {
                    updated[lastUserIdx] = { 
                        ...updated[lastUserIdx], 
                        rating: data.message.rating,
                        feedback: data.feedback // Attach feedback here!
                    }
                }
                return [...updated, newAssistantMsg]
             })
            
            // Enable typewriter effect for the new assistant message
            setIsLastMessageTyping(true)

            if (missionMode === 'evaluation' && data.estimated_time) {
                setTimerDuration(data.estimated_time)
                setTimerKey(prev => prev + 1)
            }
            
            // Update Mission Progress from API
            if (data.progress !== undefined) {
                setMissionProgress(data.progress)
            }

            // Auto-complete if mission passed
            const isComplete = data.mission_completed || (data.progress && data.progress >= 100);
            if (isComplete) {
                setMissionProgress(100)
                
                // Show completion modal ONLY if we haven't already notified the user
                if (!hasNotifiedCompletion) {
                    setShowCompletionNotification(true)
                    setHasNotifiedCompletion(true)
                }
            } else {
                 // Check if progress reached 100 without explicit completion flag, just in case
                 if (missionProgress >= 100 && !hasNotifiedCompletion) {
                    setShowCompletionNotification(true)
                    setHasNotifiedCompletion(true)
                 }
            }
        } else {
            console.error("API Error", data)
            setMessages(prev => [...prev, { role: 'system', content: `⚠️ Transmission Error: ${data.error || 'No signal'}` }])
        }
    } catch (e) {
        console.error("Failed to send message", e)
        setMessages(prev => [...prev, { role: 'system', content: "⚠️ System Failure: Unable to reach mission command." }])
    } finally {
        setIsThinking(false)
    }
  }

  const handleCompleteMission = async () => {
    if (state !== 'active') return
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : null
    setState('submitting'); setIsThinking(true)
    
    // Compile transcript
    const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')

        try {
            const res = await fetch(`/api/missions/${mission.id}/submit`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response_text: transcript, student_id: studentId, group_id: groupId, time_taken_seconds: timeTaken }),
            })
            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                console.error('Submission error', data)
                // Revert UI state and show brief alert to user
                setState('active'); setIsThinking(false)
                alert('Submission failed: ' + (data?.error || 'Unknown error'))
                return
            }

                        // Mark progress locally so UI reflects completion immediately
                        setMissionProgress(100)

                        // Also request server to explicitly persist narrative_state as completed
                        try {
                            await fetch(`/api/missions/${mission.id}/mark-completed`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ group_id: groupId ?? null }),
                            })
                        } catch (e) {
                            console.warn('mark-completed failed', e)
                        }

                        // Build query and navigate. Use full navigation fallback to ensure server data is loaded.
                        const p = new URLSearchParams({ mission_id: mission.id, response_id: data.response_id, evaluation_id: data.evaluation_id })
                        try {
                                await router.push(`/feedback?${p}`)
                        } catch (e) {
                                // Fallback to full navigation
                                window.location.href = `/feedback?${p}`
                        }
        } catch (err) {
            console.error('Submit exception', err)
            setState('active'); setIsThinking(false)
            alert('Submission failed due to network error')
        }
  }

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [currentInput])

  const handleKeyDown = (e: React.KeyboardEvent) => { 
      if (e.key === 'Enter' && !e.shiftKey) { 
          e.preventDefault(); 
          handleSendMessage() 
      } 
  }

  // Load dynamic hints based on the last assistant message
  const handleOpenHints = async () => {
    setShowHelp(true)
    setLoadingHints(true)
    
    const lastAssistantMessage = messages.findLast(m => m.role === 'assistant')
    if (!lastAssistantMessage) {
      setLoadingHints(false)
      return
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'hints',
          lastMessage: lastAssistantMessage.content,
          mission,
          userLevel: user?.cefr_level || mission.cefr_level 
        })
      })
      const data = await res.json()
      if (data.key_verbs || data.useful_phrases || data.grammar_tips) {
        setDynamicHints(data)
      }
    } catch (err) {
      console.error("Failed to fetch dynamic hints", err)
    } finally {
      setLoadingHints(false)
    }
  }

  if (state === 'briefing') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950 font-body">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.2]" />
        
        {/* 👾 Pixel Sprites Layer - Desktop Only */}
        <div className="absolute inset-0 z-0 opacity-70">
            <ResponsiveBackgroundSprites />
        </div>

        <div className="w-full max-w-lg space-y-6 relative z-10 animate-fade-in-up">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan/20 pb-4">
                <div>
                    <span className="text-[10px] text-cyan uppercase tracking-[0.2em] block mb-1">Mission Briefing</span>
                    <h1 className="font-body text-5xl font-bold text-white uppercase tracking-tight">{mission.title}</h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[40px] bg-cyan/10 border border-cyan/20 text-cyan px-2 py-0.5 rounded font-bold">{mission.cefr_level}</span>
                </div>
            </div>
            
            <div className="grid gap-4">
                {/* Context Card */}
                <div className="relative group bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl p-5 hover:border-cyan/30 transition-colors">
                    <p className="text-[14px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Contexto del escenario
                    </p>
                    <p className="text-slate-300 text-md leading-relaxed border-l-2 border-blue-500/30 pl-3">
                        {mission.scene_context}
                    </p>
                </div>

                {/* Objective Card */}
                <div className="relative group bg-cyan/65 border border-cyan/30 rounded-xl p-5 hover:border-cyan/50 transition-colors">
                    <p className="text-[14px] text-cyan uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span> Objetivo principal
                    </p>
                    <p className="text-cyan-50 font-medium text-md leading-relaxed border-l-2 border-cyan/30 pl-3">
                        {mission.objective}
                    </p>
                </div>
            </div>
            
            {/* Intel / Briefing Data */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/85 border border-slate-800 rounded-xl p-4">
                        <p className="text-[12px] text-cyan uppercase tracking-widest mb-3">Verbos clave</p>
                        <div className="flex flex-wrap gap-2">
                            {briefing.key_verbs.map((v, i) => (
                                <span key={i} className="text-[18px] font-body text-cyan bg-cyan/10 border border-cyan/20 px-2 py-1 rounded">{v}</span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900/85 border border-slate-800 rounded-xl p-4">
                        <p className="text-[12px] text-emerald uppercase tracking-widest mb-3">Frases cotidianas</p>
                        <ul className="space-y-2">
                            {briefing.useful_phrases.slice(0, 3).map((p, i) => (
                                <li key={i} className="text-[15px] text-emerald-50/70 border-l border-emerald/20 pl-2 leading-tight">{p}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="bg-slate-900/85 border border-amber-700/40 rounded-xl p-4">
                    <p className="text-[12px] text-amber-400 uppercase tracking-widest mb-2">💡 Consejo gramatical</p>
                    <p className="text-[14px] text-amber-50/80 leading-relaxed">{briefing.grammar_tips}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="grid grid-cols-2 gap-3">
                     <button 
                        onClick={() => startMission('free')} 
                        disabled={isThinking}
                        className={cn(
                            "group relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden",
                            !isThinking
                                ? "bg-slate-900/95 border-slate-700 hover:border-cyan hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]" 
                                : "bg-white/10 border-transparent opacity-50 cursor-not-allowed"
                        )}
                     >
                       <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                       <span className="text-[20px] text-cyan font-bold uppercase tracking-widest mb-1 group-hover:text-cyan-400">Realizar mision</span>
                       <span className="text-xs text-slate-400 group-hover:text-slate-300">Tiempo ilimitado</span>
                     </button>

                     <button 
                        onClick={() => startMission('evaluation')} 
                        disabled={isThinking}
                        className={cn(
                            "group relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden",
                            !isThinking
                                ? "bg-slate-900/95 border-amber/30 hover:bg-amber/10 hover:border-amber hover:shadow-[0_0_20px_-5px_rgba(251,191,36,0.2)]" 
                                : "bg-white/10 border-transparent opacity-50 cursor-not-allowed"
                        )}
                     >
                       <div className="absolute inset-0 bg-gradient-to-br from-amber/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                       <span className="text-[20px] text-amber font-bold uppercase tracking-widest mb-1 group-hover:text-amber-400">Desafio</span>
                       <span className="text-xs text-amber/60 group-hover:text-amber/80">Tiempo ajustado por respuesta..</span>
                     </button>
                </div>
            </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto pt-4 pb-4">
      <div className="px-4 shrink-0 space-y-2">
        <div className="flex items-center gap-3 py-2">
          <button onClick={() => router.back()} className="text-slate-light hover:text-foreground transition-colors">←</button>
          <div className="flex-1 text-center font-body text-cyan text-xs uppercase tracking-widest">{mission.title}</div>
          <div className="flex gap-2">
            {state === 'active' && (
              <button 
                onClick={handleOpenHints}
                className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/50 px-2 py-1 rounded bg-blue-500/10 uppercase tracking-wide transition-colors"
                title="Get help with grammar and vocabulary hints"
              >
                💡 Hint
              </button>
            )}
            <button onClick={handleCompleteMission} className="text-xs text-emerald hover:text-emerald-400 border border-emerald/50 px-2 py-1 rounded bg-emerald/10 uppercase tracking-wide">
               Complete
            </button>
          </div>
        </div>
        
        {/* Mission Progress Bar & Status */}
        <div className="relative pt-1">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-slate-400 font-body uppercase tracking-widest">
                    Mission Progress
                </span>
                <span className={cn(
                    "text-[9px] font-bold font-body",
                    missionProgress >= 100 ? "text-emerald animate-pulse" : "text-cyan"
                )}>
                    {missionProgress}%
                </span>
            </div>
            <div className="overflow-hidden h-1.5 mb-2 text-xs flex rounded bg-slate-800 border border-slate-700">
                <div 
                    style={{ width: `${missionProgress}%` }}
                    className={cn(
                        "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ease-out",
                        missionProgress >= 100 ? "bg-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-cyan shadow-[0_0_5px_rgba(6,182,212,0.5)]"
                    )}
                ></div>
            </div>
        </div>

        <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
           <span className="text-[10px] text-slate-500 uppercase tracking-wider line-clamp-1 flex-1 mr-4">{mission.objective}</span>
           {missionMode === 'evaluation' && (
              <Timer key={timerKey} durationSeconds={timerDuration} onTimeout={() => setTimedOut(true)} />
           )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="mission-screen-messages px-4 py-2 space-y-4 scrollbar-hide" ref={scrollRef}>
          {/* Messages */}
          {messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              const isLastMessage = i === messages.length - 1
              const isLastAssistantMessageTyping = isLastMessage && !isUser && isLastMessageTyping
              
              return (
                  <div key={i} className={cn("flex gap-2 mb-4", isUser ? "flex-row-reverse items-end" : "items-end")}>
                      <span className="text-xl flex-shrink-0">
                          {isUser ? "👤" : "🤖"}
                      </span>
                      <div className="flex flex-col gap-1">
                          <span className={cn("text-[9px] uppercase tracking-wider opacity-60", isUser ? "text-emerald text-right" : "text-cyan")}>
                              {isUser ? 'YOU' : mission.character_name}
                              {isUser && msg.rating && (
                                  <span className="text-amber-400 ml-2">{'★'.repeat(msg.rating)}</span>
                              )}
                          </span>
                          <div className={cn(
                              "max-w-[85%] p-3 text-sm leading-relaxed rounded-2xl",
                              isUser 
                                ? "bg-emerald/10 border border-emerald/20 text-emerald-50 rounded-tr-none shadow-[0_0_10px_-5px_rgba(16,185,129,0.2)]" 
                                : "bg-cyan/10 border border-cyan/20 text-cyan-50 rounded-tl-none shadow-[0_0_10px_-5px_rgba(6,182,212,0.2)]"
                          )}>
                              {isUser ? (
                                  msg.content
                              ) : (
                                  <TypewriterMessage 
                                      text={msg.content} 
                                      isActive={isLastAssistantMessageTyping}
                                      speed={30}
                                  />
                              )}
                          </div>

                          {/* Coach Feedback for this turn - moved to bottom of user message */}
                          {isUser && msg.feedback && (
                             <div className="mt-1 mr-1 max-w-full text-right flex flex-col items-end gap-1 animate-in fade-in slide-in-from-top-1">
                            <div className="text-[10px] uppercase font-bold text-amber tracking-widest flex items-center gap-1">
                                <span>AI Coach</span>
                            </div>
                            <div className="text-xs text-amber/80 bg-amber/5 px-3 py-2 rounded-lg rounded-tr-none border border-amber/10 backdrop-blur-sm">
                                {msg.feedback}
                            </div>
                         </div>
                          )}
                      </div>
                  </div>
              )
          })}
          
          {isThinking && (
              <div className="flex flex-col gap-1 items-start animate-pulse">
                  <span className="text-[9px] uppercase tracking-wider opacity-60 text-cyan">{mission.character_name}</span>
                  <div className="bg-cyan/5 border border-cyan/10 text-cyan px-3 py-2 rounded-2xl rounded-tl-none text-xs">
                      Thinking...
                  </div>
              </div>
          )}
      </div>

      {/* Input Area */}
      <div className="mission-screen-input px-4 pt-2">
        <div className={cn('relative rounded-xl border transition-all duration-200 bg-white/5 border-white/10 flex items-end gap-2 p-2', currentInput.trim() && 'border-cyan/40 bg-cyan/5')}>
          <textarea 
             ref={textareaRef} 
             value={currentInput} 
             onChange={e => setCurrentInput(e.target.value)} 
             onKeyDown={handleKeyDown} 
             placeholder={timedOut ? "Mission time ended. Finish up!" : "Type your message..."}
             disabled={state === 'submitting' || isThinking} 
             rows={1} 
             className="flex-1 bg-transparent resize-none p-2 text-foreground placeholder:text-slate/40 focus:outline-none font-body text-sm leading-relaxed disabled:opacity-50 max-h-32" 
          />
          <button 
             onClick={handleSendMessage} 
             disabled={!currentInput.trim() || state === 'submitting' || isThinking} 
             className={cn('p-2 rounded-lg transition-all duration-200 active:scale-95 shrink-0', currentInput.trim() ? 'bg-cyan text-black hover:bg-cyan-400' : 'bg-white/10 text-slate-500 cursor-not-allowed')}
          >
             <span className="text-xs font-bold uppercase">Send</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate/30 mt-2 font-body pb-safe">Enter to send • Shift+Enter for new line</p>
      </div>
      {/* Full Screen Completion Overlay */}
      {showCompletionNotification && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cyan-950/90 backdrop-blur-md animate-in fade-in duration-500">
           {/* Animated Background Rays */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,cyan_20deg,transparent_40deg)] opacity-10 animate-[spin_8s_linear_infinite]" />
           </div>

           <div className="relative z-10 text-center space-y-8 p-8 max-w-md w-full">
               
               {/* Big Icon */}
               <div className="mx-auto w-24 h-24 bg-cyan-400/20 rounded-full flex items-center justify-center border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-bounce">
                  <span className="text-5xl">🏆</span>
               </div>
               
               {/* Main Title */}
               <div className="space-y-2">
                 <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200 uppercase tracking-tighter drop-shadow-lg animate-in zoom-in duration-500 delay-100">
                    Mission<br/>Completed!
                 </h2>
                 <p className="text-cyan-200 font-body text-sm tracking-[0.2em] animate-pulse">
                    OBJECTIVES 100% MET
                 </p>
               </div>

               {/* Description */}
               <p className="text-cyan-100/80 text-lg font-light leading-relaxed max-w-xs mx-auto">
                 Excellent performance, Agent. The simulation was a success.
               </p>

               {/* Actions */}
               <div className="flex flex-col gap-4 w-full pt-4">
                  <button 
                     onClick={handleCompleteMission}
                     className="w-full py-4 rounded-xl bg-white text-cyan-900 font-black text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all active:scale-95"
                  >
                     Submit Report
                  </button>
                  
                  <button 
                     onClick={() => setShowCompletionNotification(false)}
                     className="w-full py-3 text-cyan-200/60 font-body text-xs uppercase tracking-widest hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                     [ Continue Simulation ]
                  </button>
               </div>
           </div>
        </div>
      )}

      {/* Help Modal - Grammar & Vocabulary Hints */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-950 border border-blue-500/30 w-full max-w-md rounded-xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
                <button 
                    onClick={() => setShowHelp(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-blue-400 transition-colors font-body text-xs uppercase"
                >
                    [Close]
                </button>
                <div className="border-b border-blue-500/20 pb-4 mb-6">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <span>💡</span> Grammar & Vocabulary Hints
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">No answers - just guidance!</p>
                </div>

                {loadingHints ? (
                  <div className="text-center py-8">
                    <div className="inline-block">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-2"></div>
                    </div>
                    <p className="text-sm text-slate-300">Loading contextual hints...</p>
                  </div>
                ) : (() => {
                  const hints = dynamicHints || briefing
                  return hints ? (
                    <>
                      {/* Show what the AI asked for context */}
                      {dynamicHints && messages.length > 0 && (() => {
                        const lastAssistantMsg = messages.findLast(m => m.role === 'assistant')
                        return lastAssistantMsg ? (
                          <div className="mb-4 p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">AI Asked:</p>
                            <p className="text-xs text-slate-200 leading-relaxed italic">&quot;{lastAssistantMsg.content}&quot;</p>
                          </div>
                        ) : null
                      })()}

                      {/* Key Verbs */}
                      <div className="mb-6 space-y-2">
                          <h4 className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2">
                              <span>📝</span> Key Verbs to Use
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {hints.key_verbs && hints.key_verbs.map((verb, i) => (
                                  <span 
                                      key={i} 
                                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-body font-medium hover:bg-blue-500/20 transition-colors cursor-default"
                                      title="Try using this verb in your response"
                                  >
                                      {verb}
                                  </span>
                              ))}
                          </div>
                      </div>

                      {/* Useful Phrases */}
                      {hints.useful_phrases && hints.useful_phrases.length > 0 && (
                          <div className="mb-6 space-y-2">
                              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-2">
                                  <span>💬</span> Useful Phrases
                              </h4>
                              <div className="space-y-2">
                                  {hints.useful_phrases.map((phrase, i) => (
                                      <div 
                                          key={i}
                                          className="p-2 bg-emerald-500/5 border-l-2 border-emerald-500/30 text-sm text-emerald-100 rounded text-left font-light"
                                      >
                                          &quot;{phrase}&quot;
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* Grammar Tips */}
                      {hints.grammar_tips && (
                          <div className="space-y-2 pt-4 border-t border-slate-700">
                              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
                                  <span>⚡</span> Grammar Tip
                              </h4>
                              <p className="text-xs text-amber-100 leading-relaxed bg-amber-500/5 p-3 rounded border border-amber-500/20">
                                  {hints.grammar_tips}
                              </p>
                          </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No hints available</p>
                    </div>
                  )
                })()}

                <button 
                    onClick={() => setShowHelp(false)}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-500/20 text-xs uppercase tracking-wider"
                >
                    Got it, back to mission
                </button>
            </div>
        </div>
      )}
    </div>
  )
}
