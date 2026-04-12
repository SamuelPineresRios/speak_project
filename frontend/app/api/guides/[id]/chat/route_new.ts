import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// Get OpenRouter API key
function getOpenRouterApiKey() {
  let apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }
  // Remove surrounding quotes
  if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || 
      (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
    apiKey = apiKey.slice(1, -1);
  }
  return apiKey;
}

// GET - Fetch chat history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = request.headers.get("x-user-id");
    if (!studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guideId = params.id;

    try {
      const { data: chatMessages } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("guide_id", guideId)
        .eq("student_id", studentId)
        .order("sent_at", { ascending: true });

      return NextResponse.json({
        success: true,
        messages: chatMessages || [],
      });
    } catch {
      // Table might not exist, return empty
      return NextResponse.json({
        success: true,
        messages: [],
      });
    }
  } catch (error) {
    console.error("[CHAT_GET]", error);
    return NextResponse.json({ success: true, messages: [] });
  }
}

// POST - Send message and get AI response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const guideId = params.id;
  
  try {
    console.log(`\n[CHAT_POST] ⏰ Starting chat request for guide: ${guideId}`);
    
    const studentId = request.headers.get("x-user-id");
    if (!studentId) {
      console.log("[CHAT_POST] ❌ No student ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      console.log("[CHAT_POST] ❌ No message content");
      return NextResponse.json({ error: "No content" }, { status: 400 });
    }

    console.log(`[CHAT_POST] 📝 Message from student ${studentId}: "${content.substring(0, 50)}..."`);

    // Get guide from Supabase
    console.log("[CHAT_POST] 📚 Fetching guide from Supabase...");
    const { data: guide, error: guideError } = await supabase
      .from("guides")
      .select("*")
      .eq("id", guideId)
      .single();

    if (guideError || !guide) {
      console.error("[CHAT_POST] ❌ Guide not found:", guideId, guideError);
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    console.log(`[CHAT_POST] ✅ Guide found: "${guide.title}"`);

    // Generate AI response
    console.log("[CHAT_POST] 🤖 Calling generateAssistantResponseDirect...");
    let assistantResponse = "";
    
    try {
      assistantResponse = await generateAssistantResponseDirect(content, guide);
      console.log(`[CHAT_POST] ✅ AI response generated (${assistantResponse.length} chars)`);
    } catch (aiError) {
      console.error("[CHAT_POST] ❌ AI generation failed:", aiError);
      const errorMsg = aiError instanceof Error ? aiError.message : String(aiError);
      console.error("[CHAT_POST] Error message:", errorMsg);
      throw aiError; // Re-throw to be caught by outer try-catch
    }

    // Create message objects
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      guide_id: guideId,
      student_id: studentId,
      role: "user" as const,
      content,
      sent_at: new Date().toISOString(),
    };

    const assistantMessage = {
      id: `msg-${Date.now()}-assistant`,
      guide_id: guideId,
      student_id: studentId,
      role: "assistant" as const,
      content: assistantResponse,
      sent_at: new Date().toISOString(),
    };

    // Try to store messages (optional)
    try {
      await supabase.from("chat_messages").insert([userMessage]);
    } catch {
      console.log("[CHAT_POST] ℹ️ Could not store user message");
    }

    try {
      await supabase.from("chat_messages").insert([assistantMessage]);
    } catch {
      console.log("[CHAT_POST] ℹ️ Could not store assistant message");
    }

    const duration = Date.now() - startTime;
    console.log(`[CHAT_POST] ✨ Complete in ${duration}ms\n`);

    return NextResponse.json({
      success: true,
      userMessage,
      assistantMessage,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[CHAT_POST] 💥 ERROR (${duration}ms):`, error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[CHAT_POST] Error details:", errorMsg);

    return NextResponse.json({
      success: false,
      error: "Failed to process chat",
      details: errorMsg,
    }, { status: 500 });
  }
}

async function generateAssistantResponseDirect(
  userMessage: string,
  guide: any
): Promise<string> {
  console.log("[AI_GENERATE] 🚀 Starting AI response generation");

  // Parse guide content fields
  const parseField = (field: any) => {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  };

  console.log("[AI_GENERATE] 📚 Parsing guide data...");
  const guideContext = JSON.stringify({
    title: guide.title,
    topic: guide.description,
    cefr_level: guide.cefr_level,
    definition: guide.definition,
    explanation: guide.explanation,
    formula: guide.formula,
    key_structures: parseField(guide.key_structures),
    common_expressions: parseField(guide.common_expressions),
    real_life_examples: parseField(guide.real_life_examples),
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
7. Keep responses natural and conversational
8. If student asks about grammar, use the guide structures to explain
9. If topic is outside this guide, gently redirect

Return ONLY a warm, natural tutor response in Spanish.`;

  console.log("[AI_GENERATE] 🔑 Getting OpenRouter API key...");
  const apiKey = getOpenRouterApiKey();
  console.log("[AI_GENERATE] ✅ API key loaded");

  console.log("[AI_GENERATE] 📡 Sending request to OpenRouter...");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://vox.app",
      "X-Title": "VOX"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  console.log(`[AI_GENERATE] 📬 Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[AI_GENERATE] ❌ HTTP Error:", response.status);
    console.error("[AI_GENERATE] Response:", errorText.substring(0, 300));
    throw new Error(`OpenRouter HTTP ${response.status}: ${errorText.substring(0, 200)}`);
  }

  const result = await response.json();

  if (!result.choices?.[0]?.message?.content) {
    console.error("[AI_GENERATE] ❌ Invalid response structure");
    console.error("[AI_GENERATE] Result:", JSON.stringify(result).substring(0, 300));
    throw new Error("Invalid OpenRouter response structure");
  }

  const tutorResponse = result.choices[0].message.content;
  console.log(`[AI_GENERATE] ✅ Response received (${tutorResponse.length} chars)`);
  
  return tutorResponse;
}
