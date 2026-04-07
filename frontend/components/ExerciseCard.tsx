"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Exercise {
  id: string;
  type: "multiple_choice" | "fill_in" | "true_false" | "rearrange";
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onComplete?: (exercise: Exercise, isCorrect: boolean) => void;
  guideId: string;
}

export function ExerciseCard({
  exercise,
  onComplete,
  guideId,
}: ExerciseCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === exercise.correct_answer;
    setAnswered(true);
    setShowExplanation(true);

    if (onComplete) {
      onComplete(exercise, isCorrect);
    }

    // Optionally send to evaluation service for logging
    try {
      await fetch(`/api/guides/${guideId}/exercise-submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: exercise.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
        }),
      });
    } catch (err) {
      console.error("Failed to log exercise submission:", err);
    }
  };

  const isCorrect = selectedAnswer === exercise.correct_answer;
  const showResult = answered && selectedAnswer;

  return (
    <Card className="overflow-hidden border-cyan-500/30 hover:border-cyan-500/60 transition-colors">
      <CardHeader className="bg-gradient-to-r from-slate-950 to-slate-900 pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base text-cyan-300">
            {exercise.question}
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs whitespace-nowrap ${
              exercise.type === "multiple_choice"
                ? "border-amber-500 text-amber-400"
                : exercise.type === "true_false"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-violet-500 text-violet-400"
            }`}
          >
            {exercise.type === "multiple_choice"
              ? "Multiple Choice"
              : exercise.type === "true_false"
                ? "True/False"
                : exercise.type === "fill_in"
                  ? "Fill In"
                  : "Rearrange"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-6">
        <div className="space-y-3">
          {exercise.options && exercise.options.length > 0 ? (
            exercise.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !answered && setSelectedAnswer(option)}
                disabled={answered}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedAnswer === option
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-red-500 bg-red-500/10"
                    : "border-slate-700 bg-slate-900/50 hover:border-cyan-500/50"
                } disabled:cursor-default ${answered ? "opacity-70" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === option
                        ? isCorrect
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-red-500 bg-red-500"
                        : "border-slate-600"
                    }`}
                  >
                    {selectedAnswer === option && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-sm">{option}</span>
                  {answered && option === exercise.correct_answer && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                  )}
                  {answered &&
                    selectedAnswer !== exercise.correct_answer &&
                    selectedAnswer === option && (
                      <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                    )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-sm text-slate-400 italic">
              (Ejercicio de respuesta libre - {exercise.type})
            </div>
          )}
        </div>

        {/* Explanation Section */}
        {showExplanation && (
          <div
            className={`mt-4 p-3 rounded-lg border-l-4 ${
              isCorrect
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-red-500 bg-red-500/5"
            }`}
          >
            <div className="flex gap-2 items-start">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="text-sm">
                <p className={`font-semibold mb-1 ${
                  isCorrect
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}>
                  {isCorrect ? "¡Correcto!" : "Respuesta incorrecta"}
                </p>
                <p className="text-slate-300">{exercise.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!answered && selectedAnswer && (
          <Button
            onClick={handleSubmit}
            className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-semibold"
          >
            Check Answer
          </Button>
        )}

        {answered && !isCorrect && (
          <Button
            onClick={() => {
              setSelectedAnswer(null);
              setAnswered(false);
              setShowExplanation(false);
            }}
            className="w-full mt-4 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 border"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
