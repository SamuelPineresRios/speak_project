import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
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
    const body = await request.json();
    const {
      status,
      exercises_completed,
      score,
    } = body;

    // Verificar que la guía existe
    const { data: guide, error: guideError } = await supabase
      .from("guides")
      .select("id")
      .eq("id", guideId)
      .single();

    if (guideError || !guide) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    // Buscar progreso existente
    let progress;
    const { data: existingProgress } = await supabase
      .from("guide_progress")
      .select("*")
      .eq("student_id", studentId)
      .eq("guide_id", guideId)
      .single();

    if (!existingProgress) {
      // Crear nuevo progreso
      const newProgress = {
        student_id: studentId,
        guide_id: guideId,
        status: status || "in_progress",
        exercises_completed: exercises_completed || 0,
        exercises_total: guide.exercises_total || 0,
        started_at: new Date().toISOString(),
        completed_at: status === "completed" ? new Date().toISOString() : null,
        score: score || 0,
      };

      const { data: created, error: createError } = await supabase
        .from("guide_progress")
        .insert([newProgress])
        .select()
        .single();

      if (createError) {
        console.error("[CREATE_PROGRESS_ERROR]", createError);
        return NextResponse.json(
          { error: "Error creating progress" },
          { status: 500 }
        );
      }

      progress = created;
    } else {
      // Actualizar progreso existente
      const updateData: any = {};
      
      if (status !== undefined) updateData.status = status;
      if (exercises_completed !== undefined) updateData.exercises_completed = exercises_completed;
      if (score !== undefined) updateData.score = score;

      // Si está completado, establecer la fecha
      if (status === "completed" && !existingProgress.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: updated, error: updateError } = await supabase
        .from("guide_progress")
        .update(updateData)
        .eq("student_id", studentId)
        .eq("guide_id", guideId)
        .select()
        .single();

      if (updateError) {
        console.error("[UPDATE_PROGRESS_ERROR]", updateError);
        return NextResponse.json(
          { error: "Error updating progress" },
          { status: 500 }
        );
      }

      progress = updated;
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("[UPDATE_GUIDE_PROGRESS]", error);
    return NextResponse.json(
      { error: "Error updating guide progress" },
      { status: 500 }
    );
  }
}
