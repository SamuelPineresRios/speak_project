import { readDB, writeDB } from "@/lib/db";
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

    const db = readDB();
    const guideId = params.id;

    // Buscar la guía
    const guide = db.guides?.find((g: any) => g.id === guideId);

    if (!guide) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    // Obtener progreso del estudiante
    const progress = (db.guide_progress || []).find(
      (gp: any) =>
        gp.student_id === studentId && gp.guide_id === guideId
    );

    // Si no existe progreso, crear uno nuevo
    if (!progress) {
      const newProgress = {
        id: `gp-${Date.now()}`,
        student_id: studentId,
        guide_id: guideId,
        status: "not_started",
        exercises_completed: 0,
        exercises_total: guide.content?.exercises?.length || 0,
        started_at: new Date().toISOString(),
        completed_at: null,
        score: 0,
      };

      db.guide_progress = db.guide_progress || [];
      db.guide_progress.push(newProgress);
      writeDB(db);

      return NextResponse.json({
        success: true,
        guide,
        progress: newProgress,
      });
    }

    return NextResponse.json({
      success: true,
      guide,
      progress,
    });
  } catch (error) {
    console.error("[GUIDE_DETAIL]", error);
    return NextResponse.json(
      { error: "Error fetching guide" },
      { status: 500 }
    );
  }
}
