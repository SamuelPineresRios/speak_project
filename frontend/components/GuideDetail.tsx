"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChatPanel } from "./ChatPanel";
import { ExerciseCard } from "./ExerciseCard";
import { TypewriterMessage } from "./TypewriterMessage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BookOpen, Lightbulb, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("content");

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
    <div className="space-y-6">
      {/* Header - Dark Theme Matching Missions */}
      <div className="bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Icon and Title */}
          <div className="flex items-start gap-5 flex-1">
            <span className="text-5xl flex-shrink-0">{guide.cover_emoji}</span>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {guide.title}
              </h1>
              <p className="text-slate-300 text-base leading-relaxed mb-4">
                {guide.description}
              </p>
              
              {/* Metadata badges */}
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-md text-sm font-medium hover:border-cyan/30 transition-colors">
                  <span>📚</span> {guide.cefr_level}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-md text-sm font-medium">
                  <span>⏱</span> {guide.estimated_minutes} min
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-md text-sm font-medium">
                  <span>⚡</span> +{xpReward} XP
                </div>
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <div className="w-full md:w-auto">
            {!isCompleted ? (
              <Button
                onClick={handleCompleteGuide}
                disabled={completingGuide}
                className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
              >
                {completingGuide ? "Guardando..." : "Marcar como completado"}
              </Button>
            ) : (
              <div className="w-full md:w-auto px-6 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 font-semibold text-center">
                ✓ Completado
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {guide.progress && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-400">Progreso</span>
              <span className="text-sm font-semibold text-cyan">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {completedExercises.length} de {guide.content.exercises.length} ejercicios completados
            </div>
          </div>
        )}
      </div>

      {/* Simple Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
        <TabsList className="bg-slate-800/50 border-b border-white/10 grid w-full grid-cols-3 rounded-none p-0 h-auto">
          <TabsTrigger
            value="content"
            className="py-3 px-4 font-semibold data-[state=active]:bg-cyan/20 data-[state=active]:border-b-2 data-[state=active]:border-cyan data-[state=active]:text-cyan text-slate-400 rounded-none"
          >
            <BookOpen className="w-4 h-4 mr-2 inline" />
            Contenido
          </TabsTrigger>
          <TabsTrigger
            value="exercises"
            className="py-3 px-4 font-semibold data-[state=active]:bg-cyan/20 data-[state=active]:border-b-2 data-[state=active]:border-cyan data-[state=active]:text-cyan text-slate-400 rounded-none"
          >
            <Target className="w-4 h-4 mr-2 inline" />
            Ejercicios ({completedExercises.length})
          </TabsTrigger>
          {guide.enable_chat_assistant && (
            <TabsTrigger
              value="chat"
              className="py-3 px-4 font-semibold data-[state=active]:bg-cyan/20 data-[state=active]:border-b-2 data-[state=active]:border-cyan data-[state=active]:text-cyan text-slate-400 rounded-none"
            >
              <Zap className="w-4 h-4 mr-2 inline" />
              Asistente
            </TabsTrigger>
          )}
        </TabsList>

        {/* Content Section */}
        <TabsContent value="content" className="p-6 space-y-6">
          {/* Introduction - Structured Presentation with Typewriter Effect */}
          {guide.content.introduction && (
            <div className={cn(
              "relative border border-white/10 bg-gradient-to-br from-black/50 to-black/40 backdrop-blur-sm rounded-lg p-6 transition-all duration-300",
              "hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
            )}>
              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/40" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/40" />
              
              <div className="relative space-y-5">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-body font-semibold text-lg text-cyan-300 tracking-tight">
                      Introducción
                    </h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-cyan-500/60 to-cyan-500/0 mt-2 rounded-full" />
                  </div>
                </div>

                {/* Content with Better Structure */}
                <div className="space-y-4">
                  {guide.content.introduction
                    .split(/\n\n+/)
                    .filter((block) => block.trim().length > 0)
                    .map((block, blockIdx) => {
                      const trimmedBlock = block.trim();
                      
                      // Detect bullets or lists
                      const isList = /^[\s]*[-•*]/.test(trimmedBlock);
                      const isHeader = /^[A-Z][^.!?]*:$/.test(trimmedBlock);
                      
                      if (isHeader) {
                        // Section header
                        return (
                          <div key={blockIdx} className="pt-2 pb-1">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <h3 className="font-body font-semibold text-base text-emerald-300">
                                {trimmedBlock}
                              </h3>
                            </div>
                          </div>
                        );
                      }

                      if (isList) {
                        // Bullet list
                        const items = trimmedBlock
                          .split(/\n/)
                          .filter((line) => line.trim().length > 0);
                        
                        return (
                          <ul key={blockIdx} className="space-y-2 ml-2">
                            {items.map((item, i) => {
                              const cleanItem = item.replace(/^[\s]*[-•*]\s*/, '');
                              return (
                                <li key={i} className="flex gap-3 text-slate-300 font-body text-base">
                                  <span className="text-cyan-400 flex-shrink-0 pt-1">•</span>
                                  <span className="leading-relaxed opacity-90">
                                    <TypewriterMessage 
                                      text={cleanItem}
                                      isActive={activeTab === "content"}
                                      speed={20}
                                    />
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      }

                      // Regular paragraph
                      return (
                        <p
                          key={blockIdx}
                          className="font-body text-slate-300 leading-relaxed text-base opacity-90"
                        >
                          <TypewriterMessage 
                            text={trimmedBlock}
                            isActive={activeTab === "content"}
                            speed={20}
                          />
                        </p>
                      );
                    })}
                </div>

                {/* Visual Separator */}
                <div className="mt-4 h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
              </div>
            </div>
          )}

          {/* Definition */}
          {guide.content.definition && (
            <div className={cn(
              "relative border border-white/10 bg-black/40 backdrop-blur-sm rounded-lg p-4 transition-all duration-300",
              "hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
            )}>
              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
              
              <div className="relative">
                <h3 className="font-body font-semibold text-cyan mb-2 flex items-center gap-2 tracking-tight">
                  <BookOpen className="w-4 h-4" />
                  Definición
                </h3>
                <p className="text-slate-300 font-body italic border-l-2 border-cyan/30 pl-3 opacity-90">
                  &quot;{guide.content.definition}&quot;
                </p>
              </div>
            </div>
          )}

          {/* Explanation */}
          {guide.content.explanation && (
            <div className={cn(
              "relative border border-white/10 bg-black/40 backdrop-blur-sm rounded-lg p-4 transition-all duration-300",
              "hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
            )}>
              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
              
              <div className="relative">
                <h3 className="font-body font-semibold text-cyan mb-2 flex items-center gap-2 tracking-tight">
                  <Lightbulb className="w-4 h-4" />
                  Explicación
                </h3>
                <p className="text-slate-300 font-body opacity-90">
                  {guide.content.explanation}
                </p>
              </div>
            </div>
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
