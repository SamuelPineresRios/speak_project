import { readDB, writeDB } from "@/lib/db";
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

    const db = readDB();
    const guideId = params.id;
    const body = await request.json();
    const {
      status,
      exercises_completed,
      score,
    } = body;

    // Verificar que la guía existe
    const guide = db.guides?.find((g: any) => g.id === guideId);
    if (!guide) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    // Buscar o crear el progreso
    db.guide_progress = db.guide_progress || [];
    let progress = db.guide_progress.find(
      (gp: any) =>
        gp.student_id === studentId && gp.guide_id === guideId
    );

    if (!progress) {
      progress = {
        id: `gp-${Date.now()}`,
        student_id: studentId,
        guide_id: guideId,
        status: status || "in_progress",
        exercises_completed: exercises_completed || 0,
        exercises_total: guide.content?.exercises?.length || 0,
        started_at: new Date().toISOString(),
        completed_at: null,
        score: score || 0,
      };
      db.guide_progress.push(progress);
    } else {
      // Actualizar campos proporcionados
      if (status !== undefined) progress.status = status;
      if (exercises_completed !== undefined)
        progress.exercises_completed = exercises_completed;
      if (score !== undefined) progress.score = score;

      // Si está completado, establecer la fecha
      if (status === "completed" && !progress.completed_at) {
        progress.completed_at = new Date().toISOString();
      }
    }

    writeDB(db);

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
