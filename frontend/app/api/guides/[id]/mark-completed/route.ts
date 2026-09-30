import { readDB, writeDB } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/postgres";
import { guides } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { isAuthFailure, requireUser } from '@/lib/session'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireUser(request);
    if (isAuthFailure(session)) return session;
    const studentId = session.userId;

    const db = readDB();
    const guideId = params.id;

    // Las guías viven en PostgreSQL; el progreso sigue en db.json.
    const [guide] = await getDb()
      .select()
      .from(guides)
      .where(eq(guides.id, guideId))
      .limit(1);
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
