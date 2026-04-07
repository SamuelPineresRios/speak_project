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

    const { exercise_id, selected_answer, is_correct } = await request.json();

    if (!exercise_id || selected_answer === undefined) {
      return NextResponse.json(
        { error: "Missing exercise_id or selected_answer" },
        { status: 400 }
      );
    }

    const db = readDB();
    const guideId = params.id;

    // Initialize exercise submissions if needed
    if (!db.exercise_submissions) {
      db.exercise_submissions = [];
    }

    // Record the submission
    const submission = {
      id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      guide_id: guideId,
      exercise_id: exercise_id,
      student_id: studentId,
      selected_answer,
      is_correct,
      submitted_at: new Date().toISOString(),
    };

    db.exercise_submissions.push(submission);
    writeDB(db);

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("[EXERCISE_SUBMISSION]", error);
    return NextResponse.json(
      { error: "Error recording exercise submission" },
      { status: 500 }
    );
  }
}
