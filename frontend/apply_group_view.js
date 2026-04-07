const fs = require('fs');

const pageContent = `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TeacherDashboard } from '@/components/TeacherDashboard'
import { StudentProfileModal } from '@/components/StudentProfileModal'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft, Plus, Hash, CheckCircle2, 
  Share2, Shield, Building2, Terminal
} from "lucide-react";

interface Group {
  id: string; name: string; access_code: string
  institution_name: string | null; created_at: string
}

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [totalMissions, setTotalMissions] = useState(0)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch(\`/api/teachers/groups/\${params.id}\`).then(r => r.json()),
      fetch(\`/api/teachers/groups/\${params.id}/students\`).then(r => r.json()),
    ]).then(([g, s]) => {
      setGroup(g)
      setTotalMissions(s.total_missions ?? 0)
      setLoading(false)
    })
  }, [params.id])

  const copyCode = () => {
    if (!group) return
    navigator.clipboard.writeText(group.access_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-indigo-500/20 border-b-indigo-500 rounded-full animate-spin-reverse delay-150" />
      </div>
      <p className="text-cyan-500 font-mono text-sm animate-pulse tracking-widest">Sincronizando feed del escuadrón...</p>
    </div>
  )
  if (!group) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <Shield className="w-16 h-16 text-slate-800 mb-4" />
      <p className="text-slate-400 font-mono">ENLACE AL ESCUADRÓN PERDIDO. REINTENTE.</p>
      <button onClick={() => router.back()} className="mt-6 text-cyan-400 font-mono text-sm hover:underline">Volver al panel base</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] font-sans p-4 sm:p-8">
      {/* Gamified Decorative BG */}
      <div className="fixed inset-0 pointer-events-none grid-background opacity-20" />
      
      <div className="max-w-4xl mx-auto relative z-10 mt-6 md:mt-12 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glass-effect p-6 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          
          <div className="space-y-3">
             <button 
                onClick={() => router.back()} 
                className="group flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-2 font-mono text-xs transition-colors uppercase tracking-widest"
              >
                <div className="p-1 rounded bg-slate-900 border border-slate-800 group-hover:border-cyan-500/50 group-hover:bg-cyan-950/30 transition-all">
                  <ChevronLeft className="w-3 h-3" />
                </div>
                Centro de Mando
              </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-950/40 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Shield className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-tech font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] tracking-tight">
                  {group.name}
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-mono bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">
                    <Terminal className="w-3 h-3 text-cyan-500" /> ID: {group.id.slice(0,8)}...
                  </span>
                  {group.institution_name && (
                    <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-mono bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">
                      <Building2 className="w-3 h-3 text-emerald-500" /> {group.institution_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Link 
            href={\`/group/\${params.id}/assign-mission\`}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-cyan-600/20 hover:bg-cyan-500/30 border border-cyan-500/50 hover:border-cyan-400 rounded-xl text-cyan-50 font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-neon-cyan active:scale-95 w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform" />
            ASIGNAR MISIÓN
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Link>
        </div>

        {/* Access code Panel */}
        <div className="glass-effect rounded-2xl p-6 border border-amber-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/5 group-hover:to-orange-500/10 transition-colors pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <p className="text-[10px] text-amber-500 font-mono font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5" /> Clave de Vinculación de Operadores
              </p>
              <span className="inline-block font-mono font-bold text-3xl md:text-5xl tracking-[0.25em] text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)] bg-amber-950/30 px-4 py-2 rounded-xl border border-amber-900/50">
                {group.access_code}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={copyCode}
                className={cn(
                  'flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-mono font-bold text-xs uppercase transition-all duration-300',
                  copied 
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-950/30'
                )}
              >
                {copied ? <><CheckCircle2 className="w-4 h-4" /> ASEGURADO</> : <><Terminal className="w-4 h-4" /> COPIAR CLAVE</>}
              </button>
              
              <button 
                onClick={() => {
                  const text = \`Sistema SPEAK: Te han asignado al escuadrón. Código de acceso: \${group.access_code}\`
                  if (navigator.share) navigator.share({ title: 'Únete a SPEAK', text })
                  else copyCode()
                }} 
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all active:scale-95 flex-shrink-0"
                title="Compartir Terminal"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-ashboard Component */}
        <TeacherDashboard
          groupId={params.id}
          groupName={group.name}
          totalMissions={totalMissions}
          onViewStudent={setSelectedStudentId}
        />

        {selectedStudentId && (
          <StudentProfileModal studentId={selectedStudentId} onClose={() => setSelectedStudentId(null)} />
        )}
      </div>
    </div>
  )
}
`;

fs.writeFileSync('app/(teacher)/group/[id]/page.tsx', pageContent);

const dashboardContent = `'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cn, formatDuration } from '@/lib/utils'
import { 
  Users, Activity, Target, ChevronDown, ChevronUp, AlertTriangle, Clock, ShieldCheck
} from "lucide-react";

interface StudentProgress {
  student_id: string
  full_name: string | null
  email: string
  missions_completed: number
  total_missions: number
  writing_time_seconds: number
  avg_comprehensibility: number | null
}

interface TeacherDashboardProps {
  groupId: string
  groupName: string
  totalMissions: number
  onViewStudent: (studentId: string) => void
}

export function TeacherDashboard({ groupId, groupName, totalMissions, onViewStudent }: TeacherDashboardProps) {
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'name' | 'missions' | 'time'>('missions')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchStudents = useCallback(async () => {
    const res = await fetch(\`/api/teachers/groups/\${groupId}/students\`)
    if (res.ok) {
      const data = await res.json()
      setStudents(data.students ?? [])
      if (loading) setLoading(false)
    }
  }, [groupId, loading])

  useEffect(() => {
    fetchStudents()
    pollRef.current = setInterval(fetchStudents, 10000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [groupId, fetchStudents]) 

  const sorted = [...students].sort((a, b) => {
    let val = 0
    if (sortBy === 'name') val = (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email)
    if (sortBy === 'missions') val = a.missions_completed - b.missions_completed
    if (sortBy === 'time') val = a.writing_time_seconds - b.writing_time_seconds
    return sortDir === 'desc' ? -val : val
  })

  const groupAvg = students.filter(s => s.avg_comprehensibility !== null).length > 0
    ? students.reduce((sum, s) => sum + (s.avg_comprehensibility ?? 0), 0) / students.length
    : null

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (sortBy !== col) return <ChevronDown className="w-3 h-3 opacity-20" />
    return sortDir === 'desc' ? <ChevronDown className="w-3 h-3 text-cyan-400" /> : <ChevronUp className="w-3 h-3 text-cyan-400" />
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 glass-effect rounded-2xl border border-slate-800">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
      <p className="font-mono text-cyan-500 text-xs tracking-widest animate-pulse">RECOPILANDO DATOS DE OPERADORES...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats summary - Cyberpunk Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Operatives */}
        <div className="glass-effect rounded-xl p-5 border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-cyan-500" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-mono text-cyan-500 font-bold tracking-widest mb-1">OPERADORES</p>
            <p className="text-4xl font-tech font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {students.length}
            </p>
          </div>
        </div>

        {/* Active Agents */}
        <div className="glass-effect rounded-xl p-5 border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-mono text-amber-500 font-bold tracking-widest mb-1">ACTIVOS EN CAMPO</p>
            <p className="text-4xl font-tech font-bold text-amber-400 shadow-neon-amber-text">
              {students.filter(s => s.missions_completed > 0).length}
            </p>
          </div>
        </div>

        {/* Avg Clarity */}
        <div className="glass-effect rounded-xl p-5 border border-slate-800 relative overflow-hidden group">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-mono text-slate-400 font-bold tracking-widest mb-1 uppercase">Precisión Táctica</p>
            <p className={cn(
              'text-4xl font-tech font-bold',
              groupAvg !== null ? (groupAvg >= 80 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : groupAvg >= 65 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-coral') : 'text-slate-600'
            )}>
              {groupAvg !== null ? \`\${Math.round(groupAvg)}%\` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Operative Roster Table */}
      <div className="glass-effect rounded-2xl overflow-hidden border border-slate-700/50">
        <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-cyan-500" />
             <h3 className="font-mono text-sm font-bold text-slate-200 tracking-widest">REGISTRO DE OPERADORES</h3>
           </div>
        </div>
        
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 border-b border-slate-800 bg-slate-950/50">
          {(['name', 'missions', 'time'] as const).map(col => (
            <button key={col} onClick={() => toggleSort(col)}
              className={cn(
                "text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors text-left",
                sortBy === col ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
              )}>
              {col === 'name' ? 'Identificación' : col === 'missions' ? 'Misiones' : 'Tiempo en Red'}
              <SortIcon col={col} />
            </button>
          ))}
        </div>

        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          {sorted.length === 0 ? (
            <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
              <Users className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-slate-400 font-mono text-sm">NO HAY SEÑALES DETECTADAS.</p>
              <p className="text-slate-500 font-sans text-xs mt-1">Comparte la clave de acceso para reclutar escuadrón.</p>
            </div>
          ) : sorted.map(student => {
            const isLow = groupAvg !== null && student.avg_comprehensibility !== null
              && student.avg_comprehensibility < groupAvg * 0.5
              
            return (
              <button 
                key={student.student_id} 
                onClick={() => onViewStudent(student.student_id)}
                className={cn(
                  'w-full grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/40 transition-all text-left group', 
                  isLow ? 'bg-red-950/20 hover:bg-red-900/30' : ''
                )}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-tech font-bold flex-shrink-0 transition-transform group-hover:scale-110 shadow-lg',
                    isLow 
                      ? 'bg-red-950/50 text-red-500 border border-red-500/50 shadow-neon-coral' 
                      : student.missions_completed > 0 
                        ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                  )}>
                    {(student.full_name ?? student.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 font-bold truncate tracking-wide font-sans group-hover:text-white transition-colors">
                      {student.full_name ?? student.email.split('@')[0]}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-slate-500 font-mono truncate">{student.email}</p>
                      {isLow && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono bg-red-950/50 text-red-400 px-1.5 py-0.5 rounded border border-red-900/50 whitespace-nowrap">
                          <AlertTriangle className="w-2.5 h-2.5" /> SOPORTE TÁCTICO REQUERIDO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex items-center justify-end">
                  <div className="px-3 py-1 rounded-md bg-slate-900/60 border border-slate-800">
                    <p className="text-sm font-mono font-bold">
                      <span className={student.missions_completed > 0 ? 'text-amber-400 text-base shadow-neon-amber-text' : 'text-slate-600'}>
                        {student.missions_completed}
                      </span>
                      <span className="text-slate-600 px-1">/</span>
                      <span className="text-slate-400">{student.total_missions}</span>
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex items-center justify-end text-slate-400">
                  <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900/40 px-2 py-1.5 rounded-md border border-slate-800 group-hover:border-slate-700 transition-colors">
                     <Clock className="w-3 h-3 text-slate-500" />
                     {formatDuration(student.writing_time_seconds)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
         Enlace satelital continuo (Renovación 10s)
      </div>
    </div>
  )
}
`;

fs.writeFileSync('components/TeacherDashboard.tsx', dashboardContent);
console.log('Group detail view & components gamified!');