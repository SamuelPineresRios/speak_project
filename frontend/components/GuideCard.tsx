"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

function getDifficultyColor(level: string): { text: string; border: string; bg: string } {
  const colors: Record<string, { text: string; border: string; bg: string }> = {
    A1: { text: "text-emerald", border: "border-emerald/40", bg: "bg-emerald/10" },
    A2: { text: "text-cyan", border: "border-cyan/40", bg: "bg-cyan/10" },
    B1: { text: "text-amber", border: "border-amber/40", bg: "bg-amber/10" },
    B2: { text: "text-violet", border: "border-violet/40", bg: "bg-violet/10" },
    C1: { text: "text-orange", border: "border-orange/40", bg: "bg-orange/10" },
    C2: { text: "text-rose", border: "border-rose/40", bg: "bg-rose/10" },
  };
  return colors[level.toUpperCase()] || colors.A1;
}

function getColorBar(level: string): string {
  const colors: Record<string, string> = {
    A1: "bg-emerald",
    A2: "bg-cyan",
    B1: "bg-amber",
    B2: "bg-violet",
    C1: "bg-orange",
    C2: "bg-rose",
  };
  return colors[level.toUpperCase()] || "bg-emerald";
}

export function GuideCard({ guide }: { guide: Guide }) {
  const progressPercent = guide.progress
    ? (guide.progress.exercises_completed / guide.progress.exercises_total) * 100
    : 0;

  const isCompleted = guide.progress?.status === "completed";
  const isInProgress = guide.progress?.status === "in_progress";
  const streak = guide.progress?.current_streak || 0;
  const xpReward = guide.xp_reward || 150;
  
  const diffColor = getDifficultyColor(guide.cefr_level);
  const colorBar = getColorBar(guide.cefr_level);

  return (
    <Link href={`/guides/${guide.id}`} className="group block relative">
      {/* Cyber Card Background - Exactly like Missions */}
      <div className={cn(
        "absolute inset-0 border border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-300 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
        isCompleted ? "opacity-80 grayscale-[0.8] border-dashed" : "opacity-100"
      )} />
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-cyan transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-cyan transition-colors" />

      {/* Content Container */}
      <div className={cn("relative p-6 pr-8 flex flex-col gap-3 h-full min-h-[280px]", isCompleted && "opacity-60")}>
        
        {/* Header with Level Badge */}
        <div className="flex items-center gap-2">
          <span className={cn("text-[12px] font-bold border px-2 py-1 rounded tracking-wider", diffColor.text, diffColor.border, diffColor.bg)}>
            {guide.cefr_level.toUpperCase()}
          </span>
          {isCompleted && (
            <span className="text-[10px] font-bold tracking-wider text-emerald">COMPLETADO</span>
          )}
          {isInProgress && (
            <span className="text-[10px] font-bold tracking-wider text-amber animate-pulse">EN PROGRESO</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-body font-semibold text-lg text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight leading-tight">
          {guide.title}
        </h3>

        {/* Description */}
        <p className="text-xss text-slate-300 font-body line-clamp-2 leading-relaxed opacity-90">
          {guide.description}
        </p>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
          <span>⏱ {guide.estimated_minutes}m</span>
          <span className="ml-auto">+{xpReward} XP</span>
        </div>

        {/* Status Indicator Bar */}
        <div className={cn("w-1.5 h-1 rounded-full mt-auto", colorBar)} />

        {/* Progress Bar - Hover Effect */}
        <div className="flex items-center gap-2 mt-2">
          <div className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-1000 group-hover:w-full", colorBar)}
              style={{ 
                width: `${Math.max(0, Math.min(100, progressPercent))}%`,
                transitionDelay: "100ms"
              }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {guide.progress
              ? `${guide.progress.exercises_completed}/${guide.progress.exercises_total}`
              : "0/0"}
          </span>
        </div>

        {/* Streak Indicator if exists */}
        {streak > 0 && (
          <div className="mt-2 text-[10px] text-orange font-bold tracking-wider">
            🔥 {streak} DÍAS
          </div>
        )}
      </div>
    </Link>
  );
}
