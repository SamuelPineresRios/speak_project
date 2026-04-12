'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Radio, User, LogOut, Disc, Lightbulb, Users, Menu, X } from 'lucide-react' // Importing icons
import { useAuth } from '@/lib/hooks/useAuth'
import { useState } from 'react'

export function StudentSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth() // Extract user from hook
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '/missions', label: 'MISIONES', icon: Radio },
    { href: '/guides', label: 'GUIAS DE APRENDIZAJE', icon: Lightbulb },
    { href: '/groups', label: 'GRUPOS', icon: Users },
    { href: '/profile', label: 'PERFIL', icon: User },
  ]

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <span className="font-bold text-black font-display text-lg">V</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wider text-white">VOX</h1>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-black/90 lg:bg-black/40 backdrop-blur-xl flex flex-col z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand - hidden on mobile since it's in top bar */}
        <div className="p-6 border-b border-white/10 hidden lg:block">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <span className="font-bold text-black font-display text-lg">S</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wider text-white">SPEAK</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest px-4 mb-2 lg:mt-0 mt-16">Menu principal</div>
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono tracking-wide transition-all duration-200 group relative",
                isActive 
                  ? "text-cyan bg-cyan/10 border border-cyan/20 shadow-[0_0_10px_-3px_rgba(6,182,212,0.3)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan rounded-r shadow-[0_0_8px_cyan]" />
              )}
              <link.icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "opacity-70 group-hover:opacity-100")} />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Status / Logout */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Cerrar sesion</span>
        </button>
        
        <div className="mt-4 flex items-center justify-between px-2">
           <div className="flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
             <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest">Online</span>
           </div>
           <span className="text-[9px] text-slate-600 font-mono">ID::8472-X</span>
        </div>
      </div>
    </aside>
    </>
  )
}
