import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("\n========== TUTOR ENDPOINT (Gemini) ==========");
    const body = await request.json();
    const { user_message, guide_title, guide_context, cefr_level = "B1" } = body;

    console.log("[TUTOR] 📥 Solicitud:", { guide_title, cefr_level });

    if (!user_message || !guide_title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const systemPrompt = `You are an expert, friendly English tutor for Spanish speakers.
Your role: Answer student questions about "${guide_title}" (CEFR ${cefr_level}) in a conversational, supportive way.

GUIDE CONTEXT:
${guide_context}

INSTRUCTIONS:
1. Respond ONLY in Spanish, with warmth and encouragement
2. Reference specific examples from the guide context when applicable
3. If the student shares an English example, briefly evaluate it and provide feedback
4. Give 1-2 concrete examples specific to the topic
5. Use emojis sparingly to make conversation warm
6. Ask follow-up questions to deepen learning
7. Keep responses natural and conversational - NEVER use pre-made generic responses
8. If student asks about grammar, use the guide structures to explain
9. If student gives an English answer, start with: "¡Buen intento! [evaluation]"
10. If topic is outside this guide, gently redirect

CEFR ${cefr_level} GUIDANCE:
- A1/A2: Celebrate effort, accept approximations, be very encouraging
- B1: Introduce nuance, point out subtleties, expect more precision
- B2: Focus on sophistication, register, idiomatic expressions

Return ONLY a warm, natural tutor response in Spanish.`;

    console.log("[TUTOR] 🚀 Llamando Gemini via OpenRouter...");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://speak-mvp.com",
        "X-Title": "Speak MVP"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: user_message
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[TUTOR] ❌ Error from OpenRouter:", errorData);
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const result = await response.json();
    const tutorResponse = result.choices[0].message.content;

    console.log("[TUTOR] ✅ Respuesta recibida:");
    console.log("[TUTOR] Preview:", tutorResponse.substring(0, 80) + "...");
    console.log("========================================\n");

    return NextResponse.json({
      success: true,
      tutor_response: tutorResponse,
    });

  } catch (error) {
    console.error("[TUTOR] 💥 Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        tutor_response: "Disculpa, hubo un error. Intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}
