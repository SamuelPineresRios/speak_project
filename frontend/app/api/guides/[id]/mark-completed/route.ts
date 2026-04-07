import { readDB, writeDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

    // Verificar que la guía existe
    const guide = db.guides?.find((g: any) => g.id === guideId);
    if (!guide) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    // Obtener el body
    const body = await request.json();
    const { score = 100 } = body;

    // Buscar o crear el progreso
    let progress = (db.guide_progress || []).find(
      (gp: any) =>
        gp.student_id === studentId && gp.guide_id === guideId
    );

    const now = new Date().toISOString();

    if (!progress) {
      progress = {
        id: `gp-${Date.now()}`,
        student_id: studentId,
        guide_id: guideId,
        status: "completed",
        exercises_completed: guide.content?.exercises?.length || 0,
        exercises_total: guide.content?.exercises?.length || 0,
        started_at: now,
        completed_at: now,
        score,
      };

      db.guide_progress = db.guide_progress || [];
      db.guide_progress.push(progress);
    } else {
      // Actualizar progreso existente
      progress.status = "completed";
      progress.completed_at = now;
      progress.exercises_completed =
        guide.content?.exercises?.length || 0;
      progress.exercises_total =
        guide.content?.exercises?.length || 0;
      progress.score = score;
    }

    writeDB(db);

    return NextResponse.json({
      success: true,
      message: "Guide marked as completed",
      progress,
    });
  } catch (error) {
    console.error("[MARK_GUIDE_COMPLETED]", error);
    return NextResponse.json(
      { error: "Error marking guide as completed" },
      { status: 500 }
    );
  }
}
