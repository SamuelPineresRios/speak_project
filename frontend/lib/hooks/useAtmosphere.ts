import { useRef, useEffect } from 'react'

export type AtmosphereType = 'neutral' | 'tense' | 'dark' | 'warm' | 'urgent' | 'mysterious' | 'happy' | 'danger'

interface AtmosphereConfig {
  background: string
  overlay: string
  textClass: string
  borderClass: string
  accentColor: string
  animation?: string
}

const atmospheres: Record<AtmosphereType, AtmosphereConfig> = {
  neutral: {
    background: "bg-slate-950",
    overlay: "bg-transparent",
    textClass: "text-slate-100 font-sans",
    borderClass: "border-slate-800",
    accentColor: "cyan"
  },
  warm: {
    background: "bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950",
    overlay: "bg-[url('/noise.png')] opacity-20 mix-blend-overlay",
    textClass: "text-amber-100 font-serif",
    borderClass: "border-amber-700/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]",
    accentColor: "amber",
    animation: "animate-pulse-slow"
  },
  happy: {
    background: "bg-gradient-to-t from-emerald-950 to-slate-900",
    overlay: "",
    textClass: "text-emerald-50 font-display",
    borderClass: "border-emerald-500/30",
    accentColor: "emerald",
    animation: "animate-float"
  },
  tense: {
    background: "bg-slate-900",
    overlay: "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)]",
    textClass: "text-slate-200 font-mono tracking-tighter",
    borderClass: "border-red-900/50 border-l-4 border-l-red-600",
    accentColor: "red"
  },
  urgent: {
    background: "bg-slate-900",
    overlay: "shadow-[inset_0_0_100px_rgba(220,38,38,0.2)]",
    textClass: "text-white font-bold uppercase italic",
    borderClass: "border-amber-600 animate-pulse",
    accentColor: "orange"
  },
  dark: {
    background: "bg-[#05070A]",
    overlay: "bg-black/80",
    textClass: "text-slate-400 font-light tracking-wide",
    borderClass: "border-white/5",
    accentColor: "slate"
  },
  mysterious: {
    background: "bg-gradient-to-b from-indigo-950 to-black",
    overlay: "",
    textClass: "text-indigo-100 font-mono text-shadow-glitch",
    borderClass: "border-indigo-500/20",
    accentColor: "indigo"
  },
  danger: {
    background: "bg-gradient-to-br from-red-950 via-black to-black",
    overlay: "",
    textClass: "text-red-100 font-bold",
    borderClass: "border-red-600 animate-pulse-fast",
    accentColor: "red"
  }
}

export function useAtmosphere(type: AtmosphereType) {
  return atmospheres[type] || atmospheres.neutral
}
