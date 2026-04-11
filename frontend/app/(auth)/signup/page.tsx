'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert, UserPlus, Mail, KeyRound, AlertCircle, ChevronRight, Fingerprint } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [cefrLevel, setCefrLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('A1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  // Check if user already has a valid session/group
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (res.ok) {
          // User has valid session, redirect to missions
          router.push('/missions')
        } else {
          // No valid session, show signup form
          setIsChecking(false)
        }
      } catch (err) {
        // Error checking session, show signup form
        setIsChecking(false)
      }
    }
    
    checkExistingSession()
  }, [router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          full_name: name, 
          email, 
          password, 
          role,
          cefr_level: role === 'student' ? cefrLevel : undefined
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'ERROR DE SISTEMA')
      }
      const data = await res.json()
      localStorage.setItem('userId', data.user.id)
      if (data.user.role === 'teacher') router.push('/dashboard')
      else router.push('/join-group')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col justify-center items-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-900 to-black">
      {/* Show loading while checking session */}
      {isChecking && (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-cyan-400 font-mono text-sm tracking-wider">Verificando sesión...</p>
        </div>
      )}

      {/* Show signup form if no existing session */}
      {!isChecking && (
        <>
          {/* Decorative Grid */}
          <div className="fixed inset-0 pointer-events-none grid-background opacity-20" />
          
          <div className="w-full max-w-sm relative z-10 space-y-8 animate-fade-in-up">
            
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 mb-6 shadow-neon-cyan">
                 <Fingerprint className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-tech font-bold text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] tracking-tight uppercase">Nuevo Registro</h1>
              <p className="text-xs font-mono text-cyan-500/80 mt-2 tracking-[0.2em] uppercase">Creación de Identidad Digital</p>
        </div>

        {/* Roles Toggle */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 relative overflow-hidden">
          <div className={cn("absolute inset-y-1.5 w-[calc(50%-0.375rem)] bg-cyan-600 rounded-lg transition-transform duration-300 ease-out", role === 'teacher' ? "translate-x-[calc(100%+0.1rem)]" : "translate-x-0" )} />
          <button type="button" onClick={() => setRole('student')} className={cn("flex-1 py-2.5 text-xs font-mono font-bold tracking-widest z-10 transition-colors uppercase", role === 'student' ? "text-white drop-shadow-md" : "text-slate-500 hover:text-slate-300")}> Estudiante </button>
          <button type="button" onClick={() => setRole('teacher')} className={cn("flex-1 py-1.5 text-xs font-mono font-bold tracking-widest z-10 transition-colors uppercase", role === 'teacher' ? "text-white" : "text-slate-500 hover:text-slate-300")}> Profesor </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="glass-effect rounded-2xl p-6 md:p-8 space-y-5 border border-cyan-500/20 relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          
          <div className="group relative">
             <label className="text-[10px] text-cyan-500 font-mono font-bold uppercase tracking-widest block px-1 mb-1">ALIAS OPERATIVO (NOMBRE)</label>
             <div className="relative">
               <UserPlus className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
               <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-900/80 border border-slate-700/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-11 pr-4 py-3.5 text-white font-mono placeholder:text-slate-600" placeholder="Agent 007" />
             </div>
          </div>

          <div className="group relative">
             <label className="text-[10px] text-cyan-500 font-mono font-bold uppercase tracking-widest block px-1 mb-1">CANAL DE COMUNICACIÓN (EMAIL)</label>
             <div className="relative">
               <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
               <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900/80 border border-slate-700/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-11 pr-4 py-3.5 text-white font-mono placeholder:text-slate-600" placeholder="operador@red.com" />
             </div>
          </div>

          <div className="group relative">
             <label className="text-[10px] text-cyan-500 font-mono font-bold uppercase tracking-widest block px-1 mb-1">NUEVA CLAVE (CONTRASEÑA)</label>
             <div className="relative">
               <KeyRound className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
               <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-900/80 border border-slate-700/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-11 pr-4 py-3.5 text-white font-mono placeholder:text-slate-600" placeholder="••••••••" />
             </div>
          </div>

          {role === 'student' && (
            <div className="group relative">
              <label className="text-[10px] text-cyan-500 font-mono font-bold uppercase tracking-widest block px-1 mb-2">Nivel de Inglés (CEFR)</label>
              <div className="grid grid-cols-5 gap-2">
                {(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setCefrLevel(level)}
                    className={cn(
                      "py-2.5 px-1 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 border",
                      cefrLevel === level
                        ? "bg-cyan-600 border-cyan-400 text-white shadow-neon-cyan"
                        : "bg-slate-900/80 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 mt-2 px-1">A1: Inicial | A2: Elemental | B1: Intermedio | B2: Intermedio-Alto | C1: Avanzado</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-mono mt-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 border border-cyan-400 hover:shadow-neon-cyan flex items-center justify-center gap-2 tracking-[0.2em] uppercase text-sm mt-6">
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <> VERIFICAR E INFESTAR <ChevronRight className="w-4 h-4" /> </>}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">
            ¿YA TIENES ACCESO? INICIAR PROTOCOLO DE RETORNO -&gt;
          </Link>
        </div>

        </div>
        </>
      )}
    </div>
  )
}
