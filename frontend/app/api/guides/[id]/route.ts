import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación del middleware
    const studentId = request.headers.get("x-user-id");

    if (!studentId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const guideId = params.id;

    // Obtener la guía de Supabase
    const { data: guide, error: guideError } = await supabase
      .from("guides")
      .select("*")
      .eq("id", guideId)
      .single();

    if (guideError || !guide) {
      console.error("[GUIDE_FETCH_ERROR]", guideError);
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    // Obtener progreso del estudiante
    let progress = null;
    try {
      const { data: progressData } = await supabase
        .from("guide_progress")
        .select("*")
        .eq("student_id", studentId)
        .eq("guide_id", guideId)
        .single();

      progress = progressData || null;
    } catch (err) {
      // No existe progreso aún
      console.log("[GUIDE_PROGRESS_NOT_FOUND]", err);
    }

    // Si no existe progreso, crear uno nuevo en Supabase
    if (!progress) {
      const newProgress = {
        student_id: studentId,
        guide_id: guideId,
        status: "not_started",
        exercises_completed: 0,
        exercises_total: guide.exercises_total || (guide.content?.exercises?.length || 0),
        started_at: new Date().toISOString(),
        completed_at: null,
        score: 0,
      };

      try {
        const { data: createdProgress, error: createError } = await supabase
          .from("guide_progress")
          .insert([newProgress])
          .select()
          .single();

        if (createError) {
          console.error("[GUIDE_PROGRESS_CREATE_ERROR]", createError);
        } else {
          progress = createdProgress;
        }
      } catch (err) {
        // Si la tabla no existe, continuar sin crear progreso
        console.log("[GUIDE_PROGRESS_TABLE_NOT_FOUND]", err);
        progress = newProgress;
      }
    }

    // Usar el progreso de la guía (built-in) si no hay progreso individual
    const finalProgress = progress || {
      student_id: studentId,
      guide_id: guideId,
      status: guide.progress_status || "not_started",
      score: guide.progress_score || 0,
      exercises_completed: guide.exercises_completed || 0,
      exercises_total: guide.exercises_total || 0,
      current_streak: guide.current_streak || 0,
      max_streak: guide.max_streak || 0,
    };

    return NextResponse.json({
      success: true,
      guide,
      progress: finalProgress,
    });
  } catch (error) {
    console.error("[GUIDE_DETAIL]", error);
    return NextResponse.json(
      { error: "Error fetching guide" },
      { status: 500 }
    );
  }
}
