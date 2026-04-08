import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación del middleware
    const studentId = request.headers.get("x-user-id");

    if (!studentId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Obtener parámetros de filtro
    const { searchParams } = new URL(request.url);
    const cefrLevel = searchParams.get("cefr_level");
    const conceptTag = searchParams.get("concept_tag");

    // Construir query a Supabase
    let query = supabase
      .from("guides")
      .select("*")
      .eq("is_published", true);

    // Aplicar filtros
    if (cefrLevel) {
      query = query.eq("cefr_level", cefrLevel);
    }

    if (conceptTag) {
      query = query.contains("concept_tags", [conceptTag]);
    }

    // Ejecutar query
    const { data: guides, error: guidesError } = await query;

    if (guidesError) {
      console.error("[GUIDES_FETCH_ERROR]", guidesError);
      return NextResponse.json(
        { error: "Error fetching guides from database" },
        { status: 500 }
      );
    }

    // Obtener progreso del estudiante si existe tabla guide_progress
    let guideProgress: any[] = [];
    try {
      const { data: progress } = await supabase
        .from("guide_progress")
        .select("*")
        .eq("student_id", studentId);
      
      guideProgress = progress || [];
    } catch (err) {
      // Si la tabla no existe, continuar sin progreso
      console.log("[GUIDE_PROGRESS_NOT_FOUND]", err);
    }

    // Enriquecer guías con información de progreso
    const enrichedGuides = (guides || []).map((guide: any) => {
      const progress = guideProgress.find(
        (gp: any) =>
          gp.student_id === studentId && gp.guide_id === guide.id
      );
      
      // Use guide's built-in progress if available
      return {
        ...guide,
        progress: progress || {
          student_id: studentId,
          guide_id: guide.id,
          status: guide.progress_status || "not_started",
          score: guide.progress_score || 0,
          exercises_completed: guide.exercises_completed || 0,
          exercises_total: guide.exercises_total || 0,
          current_streak: guide.current_streak || 0,
          max_streak: guide.max_streak || 0,
        },
      };
    });

    return NextResponse.json({
      success: true,
      guides: enrichedGuides,
      total: enrichedGuides.length,
    });
  } catch (error) {
    console.error("[GUIDES_LIST]", error);
    return NextResponse.json(
      { error: "Error fetching guides" },
      { status: 500 }
    );
  }
}
