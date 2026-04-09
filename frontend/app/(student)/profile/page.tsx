/* eslint-disable react/jsx-no-comment-textnodes */
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend, ResponsiveContainer } from 'recharts'
import { Camera, Edit2, Shield, Award, Zap, Brain, Target, CheckCircle2, BookOpen, Hourglass, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ResponsiveBackgroundSprites } from '@/components/ResponsiveBackgroundSprites'
import { Canvas3DBackground } from '@/components/Canvas3DBackground'

interface Mission { id:string; title:string; description:string|null; cefr_level:string; status:string }

interface StoryProgress {
   story_id: string
   story_title: string
   completed_scenes: number
   total_scenes: number
   progress_pct: number
   status: 'not_started' | 'in_progress' | 'completed'
   is_completed: boolean
   updated_at: string
}

interface ProfileData {
   full_name: string | null
   email: string
   cefr_level: string | null
   missions_completed: number
   writing_time_seconds: number
   avg_comprehensibility: number | null
   top_structures: { structure: string; count: number }[]
   weekly_stats: { week_start_date: string; missions_completed: number; writing_time_seconds: number; avg_comprehensibility: number | null }[]
   stories_progress: StoryProgress[]
   guides_completed: number
   story_totals: {
      completedStories: number
      inProgressStories: number
      completedScenes: number
      totalScenes: number
      overall_progress_pct: number
   }
}

// Mock data for skills since backend doesn't provide it yet
const SKILLS_DATA = [
  { subject: 'Vocabulary', A: 120, fullMark: 150 },
  { subject: 'Grammar', A: 98, fullMark: 150 },
  { subject: 'Reading', A: 86, fullMark: 150 },
  { subject: 'Writing', A: 99, fullMark: 150 },
  { subject: 'Comp.', A: 85, fullMark: 150 },
  { subject: 'Speed', A: 65, fullMark: 150 },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [missions, setMissions] = useState<Mission[]>([])
   const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')

  const saveName = async () => {
    setIsEditing(false)
    if (name.trim() === '' || name.trim() === user?.full_name) return
    try {
       await fetch(`/api/students/${user?.id}/profile`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ full_name: name })
       })
    } catch (e) { console.error('Error updating name') }
  }

  useEffect(() => {
      if (!user?.id) return

      setName(user.full_name || 'Agent')

      Promise.all([
         fetch('/api/missions').then(res => res.json()),
         fetch(`/api/students/${user.id}/profile`).then(res => res.json()),
      ])
         .then(([missionsData, profileData]) => {
            setMissions(missionsData.missions ?? [])
            setProfile(profileData)
            setLoading(false)
         })
         .catch(() => {
            setLoading(false)
         })
  }, [user])

  const completedMissions = missions.filter(m => m.status === 'completed')
  const completionRate = missions.length > 0 ? Math.round((completedMissions.length / missions.length) * 100) : 0
   const storyTotals = profile?.story_totals
   const storyItems = profile?.stories_progress ?? []
   const nextStory = storyItems.find(s => s.status === 'in_progress')

   const todayLabel = new Date().toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()

  return (
    <div className="relative min-h-[100vh] w-full bg-black/90">
      <Canvas3DBackground className="opacity-60" />
      <ResponsiveBackgroundSprites />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-8 font-mono max-w-6xl mx-auto space-y-8 animate-fade-in pt-16">
      {/* Header / Agent ID Card */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        
        {/* Profile Card */}
        <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 via-transparent to-blue-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
           <div className="relative bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
              
              <div className="relative mb-4">
                 <div className="w-32 h-32 rounded-full border-2 border-dashed border-cyan/30 p-1 group-hover:border-cyan transition-colors relative overflow-hidden">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                       {/* Placeholder for user photo or actual photo */}
                       <UserAvatar name={name} />
                    </div>
                    <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                       <Camera className="w-6 h-6 text-white" />
                    </button>
                 </div>
                 <div className="absolute bottom-0 right-0 bg-black rounded-full p-1 border border-cyan shadow-[0_0_10px_cyan]">
                    <Shield className="w-4 h-4 text-cyan fill-cyan/20" />
                 </div>
              </div>

              {isEditing ? (
                  <div className="flex items-center gap-2 mb-1 w-full max-w-[200px]">
                      <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black/50 border border-cyan/50 rounded px-2 py-1 text-center w-full focus:outline-none focus:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        autoFocus
                        onBlur={saveName}
                        onKeyDown={(e) => e.key === 'Enter' && saveName()}
                      />
                  </div>
              ) : (
                  <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2 group-hover:text-cyan transition-colors cursor-pointer" onClick={() => setIsEditing(true)}>
                    {name}
                    <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                  </h2>
              )}
              
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Level {user?.cefr_level || 'N/A'} Operative</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full p-4 bg-white/5 rounded-xl border border-white/5">
                 <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase">Missions</p>
                    <p className="text-lg font-bold text-white">{completedMissions.length}</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase">Rate</p>
                    <p className="text-lg font-bold text-emerald-400">{completionRate}%</p>
                 </div>
                 <div className="text-center border-l border-white/5 pl-4 hidden md:block">
                    <p className="text-[10px] text-slate-400 uppercase">Historias</p>
                    <p className="text-lg font-bold text-cyan-400">{profile?.story_totals?.completedScenes || 0}</p>
                 </div>
                 <div className="text-center border-l border-white/5 pl-4 hidden md:block">
                    <p className="text-[10px] text-slate-400 uppercase">Guías</p>
                    <p className="text-lg font-bold text-purple-400">{profile?.guides_completed || 0}</p>
                 </div>
                 <div className="text-center col-span-2 md:hidden flex justify-around border-t border-white/5 pt-4 mt-2">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase">Historias</p>
                        <p className="text-lg font-bold text-cyan-400">{profile?.story_totals?.completedScenes || 0}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase">Guías</p>
                        <p className="text-lg font-bold text-purple-400">{profile?.guides_completed || 0}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Skills Radar */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                 <Brain className="w-4 h-4 text-purple-400" />
                 Neural_Sync_Status
               </h3>
               <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">
                  OPTIMAL
               </span>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILLS_DATA}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="#06b6d4"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Story Mode + Missions + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Recent Activity */}
         <div className="lg:col-span-2 bg-black/20 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Target className="w-4 h-4 text-emerald-400" />
               Mission_Log
            </h3>
            
            <div className="space-y-4">
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                           <div className="flex items-center justify-between gap-3 mb-2">
                              <h4 className="text-xs font-bold text-cyan uppercase tracking-wider flex items-center gap-2">
                                 <BookOpen className="w-4 h-4" />
                                 Story_Mode_Progress
                              </h4>
                              <span className="text-[10px] text-cyan/80 border border-cyan/30 px-2 py-0.5 rounded">{todayLabel}</span>
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              <MiniStat label="Completed Stories" value={storyTotals?.completedStories ?? 0} tone="emerald" />
                              <MiniStat label="In Progress" value={storyTotals?.inProgressStories ?? 0} tone="cyan" />
                              <MiniStat label="Scenes Done" value={storyTotals ? `${storyTotals.completedScenes}/${storyTotals.totalScenes}` : '0/0'} tone="amber" />
                              <MiniStat label="Global Progress" value={`${storyTotals?.overall_progress_pct ?? 0}%`} tone="violet" />
                           </div>

                           {!storyItems.length ? (
                              <div className="text-center py-6 border border-dashed border-cyan/20 rounded-lg">
                                 <p className="text-[11px] text-slate-400 uppercase tracking-wider">Aun no hay historias registradas en Story Mode.</p>
                              </div>
                           ) : (
                              <div className="space-y-2.5">
                                 {storyItems.slice(0, 5).map((story) => (
                                    <div key={story.story_id} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                                       <div className="flex items-center justify-between gap-2 mb-1.5">
                                          <p className="text-xs text-slate-200 truncate">{story.story_title}</p>
                                          <span className={cn(
                                             'text-[10px] uppercase px-1.5 py-0.5 rounded border',
                                             story.is_completed
                                                ? 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10'
                                                : 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10'
                                          )}>
                                             {story.is_completed ? 'Completed' : 'In Progress'}
                                          </span>
                                       </div>
                                       <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                          <div className={cn('h-full rounded-full', story.is_completed ? 'bg-emerald-400' : 'bg-cyan-400')} style={{ width: `${story.progress_pct}%` }} />
                                       </div>
                                       <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                          <span>{story.completed_scenes}/{story.total_scenes} scenes</span>
                                          <span>{story.progress_pct}%</span>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                      </div>

               {completedMissions.length === 0 ? (
                   <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
                      <p className="text-slate-500 text-xs uppercase">No completed operations logged.</p>
                   </div>
               ) : (
                   completedMissions.map((mission) => (
                       <div key={mission.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/30 transition-colors group">
                           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                           </div>
                           <div className="flex-1">
                              <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{mission.title}</h4>
                              <p className="text-[10px] text-slate-500 uppercase">{mission.cefr_level} // Completed</p>
                           </div>
                           <div className="px-3 py-1 rounded bg-black/40 border border-white/10 text-[10px] text-slate-400 font-mono">
                              100%
                           </div>
                       </div>
                   ))
               )}
            </div>
         </div>

         {/* Stats Column */}
         <div className="space-y-6">
            <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-600/10 border border-violet-500/20 rounded-2xl p-6">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-violet-500/20 rounded-lg">
                     <Hourglass className="w-6 h-6 text-violet-300" />
                  </div>
                  <span className="text-[10px] text-violet-300 font-bold border border-violet-400/30 px-2 py-0.5 rounded">NEXT</span>
               </div>
               <p className="text-base font-bold text-white mb-2 line-clamp-2">{nextStory?.story_title ?? 'Empieza una historia nueva'}</p>
               <p className="text-[10px] text-slate-300 uppercase leading-relaxed">
                  {nextStory
                    ? `Te faltan ${Math.max(nextStory.total_scenes - nextStory.completed_scenes, 0)} escenas para cerrar esta historia.`
                    : 'Tu siguiente avance esta en la seccion Stories. Activa Story Mode para generar trazabilidad.'}
               </p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-6">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                     <Award className="w-6 h-6 text-amber-500" />
                  </div>
                  <span className="text-[10px] text-amber-500 font-bold border border-amber-500/30 px-2 py-0.5 rounded">RATING</span>
               </div>
               <p className="text-3xl font-bold text-white mb-1">A+</p>
               <p className="text-[10px] text-slate-400 uppercase leading-relaxed">
                  {profile?.avg_comprehensibility
                    ? `Average comprehensibility: ${Math.round(profile.avg_comprehensibility)}%.`
                    : 'Complete mas sesiones para calcular tu rating real.'}
               </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-6">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                     <Zap className="w-6 h-6 text-cyan-500" />
                  </div>
                  <span className="text-[10px] text-cyan-500 font-bold border border-cyan-500/30 px-2 py-0.5 rounded">STREAK</span>
               </div>
                      <p className="text-3xl font-bold text-white mb-1">{storyTotals?.inProgressStories ?? 0} <span className="text-sm font-normal text-slate-400">ACTIVE</span></p>
               <p className="text-[10px] text-slate-400 uppercase leading-relaxed">
                           Historias activas actualmente. Mantener continuidad acelera fluidez.
               </p>
            </div>

                  <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                     <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-emerald-300" />
                        <p className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">Structures Tracker</p>
                     </div>
                     {profile?.top_structures?.length ? (
                        <div className="flex flex-wrap gap-2">
                           {profile.top_structures.slice(0, 6).map((item) => (
                              <span key={item.structure} className="text-[10px] uppercase tracking-wide px-2 py-1 rounded border border-white/15 bg-white/5 text-slate-300">
                                 {item.structure} x{item.count}
                              </span>
                           ))}
                        </div>
                     ) : (
                        <p className="text-[10px] text-slate-500 uppercase">Aun no hay estructuras detectadas.</p>
                     )}
                  </div>
         </div>
      </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, tone }: { label: string; value: string | number; tone: 'emerald' | 'cyan' | 'amber' | 'violet' }) {
   const toneClass: Record<typeof tone, string> = {
      emerald: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
      cyan: 'text-cyan-300 border-cyan-400/30 bg-cyan-500/10',
      amber: 'text-amber-300 border-amber-400/30 bg-amber-500/10',
      violet: 'text-violet-300 border-violet-400/30 bg-violet-500/10',
   }

   return (
      <div className={cn('rounded-lg border p-2.5 text-center', toneClass[tone])}>
         <p className="text-sm font-bold">{value}</p>
         <p className="text-[9px] uppercase tracking-wider mt-0.5">{label}</p>
      </div>
   )
}

function UserAvatar({ name }: { name: string }) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    return <span className="text-2xl font-bold text-slate-500">{initials}</span>
}
