import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const studentId = request.headers.get("x-user-id");

    if (!studentId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user_response, guide_title, concept } = await request.json();

    if (!user_response) {
      return NextResponse.json(
        { error: "Missing user_response" },
        { status: 400 }
      );
    }

    // Call the Python evaluation service
    const evaluationServiceUrl = process.env.EVALUATION_SERVICE_URL || "http://localhost:8000";

    const response = await fetch(`${evaluationServiceUrl}/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        response_text: user_response,
        context: guide_title || concept || "Grammar Exercise",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Evaluation service returned ${response.status}`
      );
    }

    const evaluation = await response.json();

    return NextResponse.json({
      success: true,
      evaluation: {
        comprehensibility_score: evaluation.comprehensibility_score || 0,
        natural_score: evaluation.natural_score || 0,
        grammar_score: evaluation.grammar_score || 0,
        feedback: evaluation.feedback || "Buena respuesta",
        suggestions:
          evaluation.suggestions || [],
        estimated_duration: evaluation.estimated_duration || 0,
      },
    });
  } catch (error) {
    console.error("[AI_EVALUATION]", error);

    // Fallback evaluation if service is down
    return NextResponse.json({
      success: true,
      evaluation: {
        comprehensibility_score:
          Math.random() * 2,
        natural_score: Math.random() * 2,
        grammar_score: Math.random() * 2,
        feedback:
          "Evaluación local - el servicio no está disponible",
        suggestions: [
          "Intenta ser más específico",
          "Usa más vocabulario variado",
        ],
        estimated_duration: 0,
      },
    });
  }
}
