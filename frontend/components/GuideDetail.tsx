"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChatPanel } from "./ChatPanel";
import { ExerciseCard } from "./ExerciseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BookOpen, Lightbulb, Target, Zap } from "lucide-react";

interface Guide {
  id: string;
  title: string;
  description: string;
  cover_emoji: string;
  cefr_level: string;
  concept_tags: string[];
  estimated_minutes: number;
  enable_chat_assistant?: boolean;
  content: {
    definition?: string;
    explanation?: string;
    formula?: string;
    introduction: string;
    key_structures: Array<{
      structure: string;
      example: string;
      explanation: string;
    }>;
    common_expressions: Array<{
      expression?: string;
      phrasal_verb?: string;
      meaning?: string;
      example: string;
      context?: string;
      type?: string;
      note?: string;
    }>;
    real_life_examples?: Array<{
      context: string;
      example: string;
      explanation: string;
    }>;
    exercises: Array<{
      id: string;
      type: string;
      question: string;
      correct_answer: string;
      explanation: string;
      options?: string[];
      alternatives?: string[];
    }>;
  };
  progress?: {
    status: string;
    score: number;
    exercises_completed: number;
    exercises_total: number;
  };
}

interface GuideDetailProps {
  guideId: string;
}

export function GuideDetail({ guideId }: GuideDetailProps) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingGuide, setCompletingGuide] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [correctExercises, setCorrectExercises] = useState<string[]>([]);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/guides/${guideId}`);
        if (!response.ok) throw new Error("Failed to fetch guide");

        const data = await response.json();
        setGuide(data.guide);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error loading guide"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [guideId]);

  async function handleCompleteGuide() {
    if (!guide) return;

    try {
      setCompletingGuide(true);
      const response = await fetch(
        `/api/guides/${guideId}/mark-completed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: Math.round(
              (correctExercises.length / guide.content.exercises.length) * 100
            ),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGuide({
          ...guide,
          progress: data.progress,
        });
      }
    } catch (err) {
      console.error("Error completing guide:", err);
    } finally {
      setCompletingGuide(false);
    }
  }

  const handleExerciseComplete = (exercise: any, isCorrect: boolean) => {
    setCompletedExercises((prev) =>
      prev.includes(exercise.id)
        ? prev
        : [...prev, exercise.id]
    );
    if (isCorrect) {
      setCorrectExercises((prev) =>
        prev.includes(exercise.id)
          ? prev
          : [...prev, exercise.id]
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">⚙️</div>
        <span className="ml-2 text-cyan-300">
          Cargando guía...
        </span>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-red-400 mb-2" />
        <p className="text-red-400">Error: {error || "Guide not found"}</p>
      </div>
    );
  }

  const progressPercent = guide.progress
    ? (guide.progress.exercises_completed /
      guide.progress.exercises_total) *
    100
    : Math.round(
      (correctExercises.length / guide.content.exercises.length) * 100
    );
  const isCompleted = guide.progress?.status === "completed";
  const xpReward = (guide as any)?.xp_reward || 150;

  return (
    <div className="space-y-6 animate-smooth-entrance">
      {/* Gamified Header */}
      <Card className="relative overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-midnight-50/80 to-midnight/60 backdrop-blur-xl shadow-neon-cyan">
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
        
        {/* Animated background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-neon pointer-events-none" />

        <CardHeader className="relative z-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                <span className="text-6xl relative z-10 animate-bounce-gentle inline-block">
                  {guide.cover_emoji}
                </span>
              </div>
              <div>
                <CardTitle className="text-3xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                  {guide.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge
                    variant="outline"
                    className="border-emerald-400/50 text-emerald-300 bg-emerald-950/40 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-mono"
                  >
                    🚀 {guide.cefr_level}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-cyan-400/50 text-cyan-300 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-mono"
                  >
                    ⏱ {guide.estimated_minutes} min
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-amber-400/50 text-amber-300 bg-amber-950/40 shadow-neon-amber font-mono"
                  >
                    ⚡ +{xpReward} XP
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[140px]">
              {!isCompleted ? (
                <Button
                  onClick={handleCompleteGuide}
                  disabled={completingGuide}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-neon-emerald transition-all duration-300 border border-emerald-400/50 rounded-none relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative font-bold font-tech tracking-wider">
                    {completingGuide ? "SYNCING..." : "MARK COMPLETE"}
                  </span>
                </Button>
              ) : (
                <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/70 rounded-none text-emerald-300 font-tech font-bold text-center shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse-neon">
                  ✓ MASTERED
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 mt-2">
          <p className="text-slate-300 mb-6 text-lg leading-relaxed border-l-2 border-cyan-500/50 pl-4 py-1 bg-gradient-to-r from-cyan-950/20 to-transparent">
            {guide.description}
          </p>

          {/* Gamified Progress Bar */}
          <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
            <div className="flex justify-between text-sm font-mono">
              <span className="text-slate-400 uppercase tracking-wider text-xs">Missions Scanned</span>
              <span className="text-cyan-400 font-bold">
                {completedExercises.length} / {guide.content.exercises.length} Exercises
              </span>
            </div>
            <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNDAgTDEwMCAwIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamified Content Tabs */}
      <Tabs
        defaultValue="content"
        className="glass-effect-light rounded-xl p-2 md:p-4 border border-cyan-500/20"
      >
        <TabsList className="bg-slate-900/80 border border-slate-700/50 grid w-full grid-cols-4 rounded-lg p-1.5 h-auto">
          <TabsTrigger
            value="content"
            className="py-2.5 font-tech tracking-wider data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:shadow-neon-cyan transition-all duration-300 rounded"
          >
            <BookOpen className="w-4 h-4 mr-2 inline" />
            <span className="hidden sm:inline">DATABASE</span>
          </TabsTrigger>
          <TabsTrigger
            value="exercises"
            className="py-2.5 font-tech tracking-wider data-[state=active]:bg-amber-600/30 data-[state=active]:text-amber-300 data-[state=active]:shadow-neon-amber transition-all duration-300 rounded"
          >
            <Target className="w-4 h-4 mr-2 inline" />
            <span className="hidden sm:inline">MISSIONS</span> ({completedExercises.length})
          </TabsTrigger>
          {guide.enable_chat_assistant && (
            <TabsTrigger
              value="chat"
              className="py-2.5 font-tech tracking-wider data-[state=active]:bg-cyan-600/30 data-[state=active]:text-cyan-300 data-[state=active]:shadow-neon-cyan transition-all duration-300 rounded"
            >
              <Zap className="w-4 h-4 mr-2 inline animate-pulse-neon" />
              <span className="hidden sm:inline">AI TUTOR</span>
            </TabsTrigger>
          )}
          <TabsTrigger
            value="summary"
            className="py-2.5 font-tech tracking-wider data-[state=active]:bg-emerald-600/30 data-[state=active]:text-emerald-300 data-[state=active]:shadow-neon-emerald transition-all duration-300 rounded"
          >
            <Lightbulb className="w-4 h-4 mr-2 inline" />
            <span className="hidden sm:inline">ANALYTICS</span>
          </TabsTrigger>
        </TabsList>

        {/* Contenido */}
        <TabsContent value="content" className="space-y-6 mt-4">
          {/* Definición */}
          {guide.content.definition && (
            <Card className="border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-300" />
                  <CardTitle className="text-cyan-300">
                    Definición
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed italic border-l-4 border-cyan-500 pl-4">
                  &quot;{guide.content.definition}&quot;
                </p>
              </CardContent>
            </Card>
          )}

          {/* Explicación */}
          {guide.content.explanation && (
            <Card className="border-slate-700 bg-slate-800/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-300" />
                  <CardTitle className="text-amber-300">
                    Explicación
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-slate-200 leading-relaxed font-medium">
                  {guide.content.explanation}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Fórmula/Estructura */}
          {guide.content.formula && (
            <Card className="border-emerald-500/30 bg-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-300" />
                  <CardTitle className="text-emerald-300">
                    Estructura / Fórmula
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 p-4 rounded border border-emerald-500/30">
                  <code className="text-emerald-300 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                    {guide.content.formula}
                  </code>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estructuras Clave */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Estructuras Clave
            </h3>
            {guide.content.key_structures?.map(
              (structure, idx) => (
                <Card
                  key={idx}
                  className="border-slate-700 bg-slate-800/30 hover:border-cyan-500/50 transition-colors"
                >
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="px-3 py-1 bg-slate-900 rounded text-cyan-300 text-sm font-mono font-semibold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-cyan-300">
                            {structure.structure}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            <strong className="text-slate-300">
                              Ejemplo:
                            </strong>{" "}
                            <em className="text-amber-300 block mt-0.5">
                              &quot;{structure.example}&quot;
                            </em>
                          </p>
                          <p className="text-base text-slate-200 mt-3 p-3 bg-slate-900/50 rounded-md border-l-4 border-amber-500/50 shadow-md">
                            <strong className="text-slate-300">
                              Explicación:
                            </strong>{" "}
                            {structure.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Expresiones Comunes */}
          {guide.content.common_expressions &&
            guide.content.common_expressions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-emerald-300">
                  Expresiones Comunes
                </h3>
                <div className="grid gap-3">
                  {guide.content.common_expressions.map(
                    (expr, idx) => (
                      <Card
                        key={idx}
                        className="border-slate-700 bg-slate-800/50"
                      >
                        <CardContent className="pt-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-emerald-300">
                              {expr.phrasal_verb ||
                                expr.expression ||
                                expr.type}
                            </p>
                            {expr.meaning && (
                              <p className="text-sm text-amber-300">
                                📌 {expr.meaning}
                              </p>
                            )}
                            <p className="text-base text-slate-200 mt-2 bg-slate-900/50 p-2 rounded">
                              <strong className="text-slate-300">
                                Ejemplo:
                              </strong>{" "}
                              <em className="text-cyan-300">
                                &quot;{expr.example}&quot;
                              </em>
                            </p>
                            {expr.context && (
                              <p className="text-xs text-slate-500 mt-1">
                                Contexto: {expr.context}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Casos de la Vida Real */}
          {guide.content.real_life_examples &&
            guide.content.real_life_examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-violet-300">
                  Casos en la Vida Real
                </h3>
                {guide.content.real_life_examples.map(
                  (example, idx) => (
                    <Card
                      key={idx}
                      className="border-violet-500/30 bg-violet-950/20"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-violet-300">
                          📍 {example.context}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-slate-300 italic">
                          &quot;{example.example}&quot;
                        </p>
                        <p className="text-base text-slate-200 mt-2 bg-slate-900/50 p-2 rounded">
                          💡 {example.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            )}

          {/* Introducción adicional */}
          <Card className="border-slate-700 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="text-slate-300 text-base">
                Introducción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-slate-200 leading-relaxed font-medium">
                {guide.content.introduction}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ejercicios */}
        <TabsContent value="exercises" className="space-y-6 mt-4">
          <div className="grid gap-6">
            {guide.content.exercises?.map(
              (exercise, idx) => (
                <ExerciseCard
                  key={exercise.id || idx}
                  exercise={exercise as any}
                  guideId={guideId}
                  onComplete={handleExerciseComplete}
                />
              )
            )}
          </div>

          {completedExercises.length ===
            guide.content.exercises.length && (
            <Card className="border-emerald-500/50 bg-emerald-950/20">
              <CardContent className="pt-6 text-center">
                <p className="text-emerald-300 text-lg font-semibold">
                  ¡Felicidades! 🎉
                </p>
                <p className="text-emerald-300/70 mt-2">
                  Has completado todos los ejercicios.
                  Puntuación: {Math.round(
                    (correctExercises.length /
                      guide.content.exercises.length) *
                    100
                  )}%
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chat/Tutoría */}
        {guide.enable_chat_assistant && (
          <TabsContent value="chat" className="mt-4">
            <ChatPanel guideId={guideId} guideTopic={guide.title} guideCefr={guide.cefr_level} />
          </TabsContent>
        )}

        {/* Resumen */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Accuracy */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-violet-500/30 hover:border-violet-500/40 transition-all duration-200">
              <div className="text-center space-y-2">
                <span className="text-3xl">🎯</span>
                <div className="text-2xl font-bold text-violet-300">
                  {completedExercises.length > 0 ? Math.round((correctExercises.length / completedExercises.length) * 100) : 0}%
                </div>
                <p className="text-xs text-slate-400">Precisión</p>
              </div>
            </div>

            {/* Exercises */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-cyan-500/30 hover:border-cyan-500/40 transition-all duration-200">
              <div className="text-center space-y-2">
                <span className="text-3xl">✅</span>
                <div className="text-2xl font-bold text-cyan-300">
                  {completedExercises.length}/{guide.content.exercises.length}
                </div>
                <p className="text-xs text-slate-400">Ejercicios</p>
              </div>
            </div>

            {/* XP */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-amber-500/30 hover:border-amber-500/40 transition-all duration-200">
              <div className="text-center space-y-2">
                <span className="text-3xl">⚡</span>
                <div className="text-2xl font-bold text-amber-300">
                  +150
                </div>
                <p className="text-xs text-slate-400">XP Totales</p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <Card className="border-slate-700 bg-slate-800/30">
            <CardHeader>
              <CardTitle>Resumen de Progreso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">
                  Ejercicios Completados
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full shadow-lg transition-all duration-500"
                      style={{
                        width: `${(completedExercises.length / guide.content.exercises.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-cyan-300 w-12">
                    {completedExercises.length} /{" "}
                    {guide.content.exercises.length}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">
                  Respuestas Correctas
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-lg transition-all duration-500"
                      style={{
                        width: `${(correctExercises.length / completedExercises.length) * 100 || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-emerald-300 w-12">
                    {correctExercises.length} /{" "}
                    {completedExercises.length}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-2">
                  Conceptos Cubiertos
                </p>
                <div className="flex flex-wrap gap-2">
                  {guide.concept_tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
