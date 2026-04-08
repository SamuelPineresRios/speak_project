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

    // Call OpenRouter API for evaluation
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const prompt = `Evaluate this English exercise response and provide feedback in JSON format.
    
User Response: "${user_response}"
Context/Topic: "${guide_title || concept || "Grammar Exercise"}"

Provide a JSON response with: comprehensibility_score (0-10), natural_score (0-10), grammar_score (0-10), feedback (string), and suggestions (array of strings).`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenRouter API returned ${response.status}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    try {
      const evaluation = JSON.parse(content);
    } catch {
      throw new Error("Failed to parse OpenRouter response");
    }

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
