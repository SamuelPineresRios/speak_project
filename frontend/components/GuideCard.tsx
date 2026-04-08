"use client";

import React from "react";
import Link from "next/link";

interface Guide {
  id: string;
  title: string;
  description: string;
  cover_emoji: string;
  cefr_level: string;
  estimated_minutes: number;
  xp_reward?: number;
  progress?: {
    status: string;
    score: number;
    exercises_completed: number;
    exercises_total: number;
    current_streak?: number;
    max_streak?: number;
  };
}

function getDifficultyColor(level: string): string {
  const colors: Record<string, string> = {
    A1: "from-cyan-500 to-cyan-400",
    A2: "from-cyan-500 to-blue-400",
    B1: "from-emerald-500 to-teal-400",
    B2: "from-violet-500 to-purple-400",
    C1: "from-amber-500 to-orange-400",
    C2: "from-coral to-pink-500",
  };
  return colors[level.toUpperCase()] || "from-slate-500 to-slate-400";
}

function getProgressGradient(percent: number): string {
  if (percent < 33) return "from-red-500 via-coral to-amber-500";
  if (percent < 66) return "from-amber-500 via-amber-400 to-emerald-400";
  return "from-emerald-500 to-emerald-400";
}

export function GuideCard({ guide }: { guide: Guide }) {
  const progressPercent = guide.progress
    ? (guide.progress.exercises_completed / guide.progress.exercises_total) * 100
    : 0;

  const isCompleted = guide.progress?.status === "completed";
  const isInProgress = guide.progress?.status === "in_progress";
  const streak = guide.progress?.current_streak || 0;
  const xpReward = guide.xp_reward || 150;

  return (
    <Link href={`/guides/${guide.id}`} className="group">
      {/* Outer glow effect */}
      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-amber-500/0 group-hover:from-cyan-500/20 group-hover:via-cyan-500/10 group-hover:to-amber-500/20 transition-all duration-300 blur-xl" />

        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-midnight-50/80 to-midnight/60 backdrop-blur-xl border border-cyan-500/20 group-hover:border-cyan-500/60 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 overflow-hidden">
          {/* Corner brackets decoration */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50 group-hover:border-cyan-400 transition-colors duration-300" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50 group-hover:border-cyan-400 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50 group-hover:border-cyan-400 transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50 group-hover:border-cyan-400 transition-colors duration-300" />

          {/* Header section with icon + XP badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Left: Icon + Title */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                {guide.cover_emoji}
              </span>
              <div className="min-w-0 flex-1">
                  <h3 className="font-body text-xl font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300 truncate">
                  {guide.title}
                </h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {/* Difficulty Badge */}
                  <div className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold text-white bg-gradient-to-r ${getDifficultyColor(guide.cefr_level)} shadow-neon-cyan border border-white/20`}>
                    {guide.cefr_level.toUpperCase()}
                  </div>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    ⏱ {guide.estimated_minutes}m
                  </span>
                </div>
              </div>
            </div>

            {/* Right: XP Badge */}
            <div className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono font-semibold bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-400/50 rounded-lg text-amber-300 shadow-neon-amber group-hover:shadow-neon-amber group-hover:border-amber-400/80 transition-all duration-300">
              <span>+{xpReward}</span>
              <span className="text-amber-400 animate-bounce-gentle">⚡</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
            {guide.description}
          </p>

          {/* Progress Section */}
          {guide.progress && (
            <div className="space-y-3 mb-4 pb-4 border-t border-slate-700/50">
              {/* Progress Bar with gradient */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 uppercase tracking-wide">
                    {guide.progress.exercises_completed}/{guide.progress.exercises_total} Ejercicios
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressGradient(progressPercent)} rounded-full shadow-lg transition-all duration-500 ease-out`}
                    style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
                  >
                    <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Status indicators row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/50 shadow-neon-emerald">
                      ✓ Completado
                    </span>
                  )}
                  {isInProgress && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-amber-500/20 text-amber-300 rounded border border-amber-500/50">
                      ⏳ En Progreso
                    </span>
                  )}
                </div>

                {/* Streak indicator if exists */}
                {streak > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-coral/20 to-amber-500/20 border border-amber-400/40 font-techBody font-bold text-amber-300 text-xs animate-streak-pulse">
                    <span className="text-lg">🔥</span>
                    <span>{streak}</span>
                  </div>
                )}
              </div>

              {/* Current score/accuracy if available */}
              {guide.progress.score > 0 && (
                <div className="pt-2 border-t border-slate-700/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Precisión</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {guide.progress.score}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA Button - Hidden until hover */}
          <div className="flex gap-2 pt-3 border-t border-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="flex-1 px-3 py-2 text-xs font-mono font-bold text-midnight bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded transition-all duration-300 hover:shadow-neon-amber">
              {isCompleted ? "Revisar" : isInProgress ? "Continuar" : "Comenzar"}
            </button>
            {isCompleted && (
              <button className="px-3 py-2 text-xs font-mono text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 rounded transition-all duration-300">
                📊
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
