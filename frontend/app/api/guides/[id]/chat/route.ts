import { readDB, writeDB } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/postgres";
import { guides } from "@/lib/schema";
import { completeChat } from "@/lib/ai";
import { isAuthFailure, requireUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireUser(request);
    if (isAuthFailure(session)) return session;

    const db = readDB();
    const guideId = params.id;

    const chatMessages = (db.chat_messages || []).filter(
      (msg: any) => msg.guide_id === guideId && msg.student_id === session.userId
    );

    return NextResponse.json({
      success: true,
      messages: chatMessages,
    });
  } catch (error) {
    console.error("[CHAT_HISTORY]", error);
    return NextResponse.json({ error: "Error fetching chat history" }, { status: 500 });
  }
}

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
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const [guide] = await getDb()
      .select()
      .from(guides)
      .where(eq(guides.id, guideId))
      .limit(1);
    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    // Crear mensaje del usuario
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      guide_id: guideId,
      student_id: studentId,
      role: "user",
      content,
      sent_at: new Date().toISOString(),
    };

    db.chat_messages = db.chat_messages || [];
    db.chat_messages.push(userMessage);

    // Generar respuesta con OpenRouter/Gemini DIRECTAMENTE
    let assistantResponse = "";
    try {
      assistantResponse = await generateAssistantResponseDirect(content, guide);
    } catch (e) {
      console.error("[CHAT] Error generando respuesta:", e);
      assistantResponse = "Disculpa, hubo un error. Intenta de nuevo.";
    }

    const assistantMessage = {
      id: `msg-${Date.now()}-assistant`,
      guide_id: guideId,
      student_id: studentId,
      role: "assistant",
      content: assistantResponse,
      sent_at: new Date().toISOString(),
    };

    db.chat_messages.push(assistantMessage);
    writeDB(db);

    return NextResponse.json({
      success: true,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("[CHAT_MESSAGE]", error);
    return NextResponse.json({ error: "Error sending message" }, { status: 500 });
  }
}

async function generateAssistantResponseDirect(
  userMessage: string,
  guide: any
): Promise<string> {
  const guideContext = JSON.stringify({
    title: guide.title,
    topic: guide.description,
    cefr_level: guide.cefr_level,
    key_structures: guide.content?.key_structures || [],
    common_expressions: guide.content?.common_expressions || [],
    definition: guide.content?.definition,
    explanation: guide.content?.explanation,
    formula: guide.content?.formula,
    real_life_examples: guide.content?.real_life_examples || []
  });

  const systemPrompt = `You are an expert, friendly English tutor for Spanish speakers.
Your role: Answer student questions about "${guide.title}" (CEFR ${guide.cefr_level}) in a conversational, supportive way.

GUIDE CONTEXT:
${guideContext}

INSTRUCTIONS:
1. Respond ONLY in Spanish, with warmth and encouragement
2. Reference specific examples from the guide context when applicable
3. If the student shares an English example, briefly evaluate it and provide feedback
4. Give 1-2 concrete examples specific to the topic
5. Use emojis sparingly to make conversation warm
6. Ask follow-up questions to deepen learning
7. Keep responses natural and conversational - NEVER use pre-made generic responses
8. If student asks about grammar, use the guide structures to explain
9. If topic is outside this guide, gently redirect

Return ONLY a warm, natural tutor response in Spanish.`;

  console.log("[CHAT] 🚀 Llamando OpenRouter/Gemini...");

  const tutorResponse = await completeChat({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    maxTokens: 1024,
  });

  console.log("[CHAT] ✅ Respuesta recibida");
  return tutorResponse;
}
