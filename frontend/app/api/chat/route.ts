import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

export async function POST(req: NextRequest) {
  try {
    // Defensive parsing of request body to surface malformed JSON from client
    const rawBody = await req.text();
    let parsedBody: any = {};
    try {
      parsedBody = JSON.parse(rawBody || '{}');
    } catch (err: any) {
      console.error('Chat API: invalid JSON body', { error: err?.message, rawBody: rawBody?.slice(0, 200) });
      return NextResponse.json({ error: 'Invalid JSON body', details: err?.message, raw_preview: rawBody?.slice(0, 1000) }, { status: 400 });
    }
    const { messages, mission, userLevel, mode, lastMessage } = parsedBody;

    // Define level-specific behavior guidelines
    const levelDirectives: Record<string, string> = {
      'A1': "Use EXTREMELY simple English. Short sentences (max 5 words). Basic vocabulary only. No idioms. Speak slowly/clearly.",
      'A2': "Use simple English. Common verbs and nouns. Simple past/future tenses only. Avoid complex grammar. Be patient.",
      'B1': "Use standard conversational English. Some common idioms are okay. clear articulation but natural speed.",
      'B2': "Speak naturally and fluently. Use varied vocabulary, phrasal verbs, and complex sentences. Act like a native speaker.",
      'C1': "Use sophisticated vocabulary and nuance. Speak at full native speed with idioms and cultural references."
    };

    const specificInstruction = levelDirectives[userLevel] || levelDirectives['A2'];

    if (mode === 'briefing') {
      const prompt = `
Generate a short preparation briefing for an English learning roleplay mission.
Context: "${mission.scene_context}"
Objective: "${mission.objective}"
Student Level: ${userLevel || 'A2'}

Return a valid JSON object (all text values in English) with:
{
  "key_verbs": ["verb1", "verb2", "verb3"],
  "useful_phrases": ["phrase1", "phrase2", "phrase3"],
  "grammar_tips": "Brief advice on relevant grammar in English",
  "estimated_duration_minutes": 2
}
      `.trim();
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://speak-mvp.com",
          "X-Title": "Speak MVP"
        },
        body: JSON.stringify({
          "model": "google/gemini-2.0-flash-001",
          "messages": [{ role: 'user', content: prompt }],
          "response_format": { "type": "json_object" }
        })
      });
      
      const result = await response.json();
      if (!result.choices || result.choices.length === 0 || !result.choices[0].message) {
        console.error("Briefing Mode: Invalid API Response", result);
        return NextResponse.json({ error: "Invalid response from AI provider" }, { status: 500 });
      }
      return NextResponse.json(JSON.parse(result.choices[0].message.content));
    }

    if (mode === 'hints') {      
      const hintsPrompt = `
You are a helpful English learning coach. A student is doing a roleplay mission and the AI character just asked them this question:

"${lastMessage}"

Context: "${mission.scene_context}"
Objective: "${mission.objective}"
Student Level: ${userLevel || 'A2'}

Based on what the character asked, generate SPECIFIC vocabulary and phrases to help the student answer this particular question.

Return a valid JSON object (all text values in English) with:
{
  "key_verbs": ["verb1", "verb2", "verb3"] - verbs most useful for answering this specific question,
  "useful_phrases": ["phrase1", "phrase2", "phrase3"] - practical phrases to use in the answer,
  "grammar_tips": "Specific grammar advice for answering this question in English"
}
      `.trim();
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://speak-mvp.com",
          "X-Title": "Speak MVP"
        },
        body: JSON.stringify({
          "model": "google/gemini-2.5-flash-001",
          "messages": [{ role: 'user', content: hintsPrompt }],
          "response_format": { "type": "json_object" }
        })
      });
      
      const result = await response.json();
      if (!result.choices || result.choices.length === 0 || !result.choices[0].message) {
        console.error("Hints Mode: Invalid API Response", result);
        return NextResponse.json({ error: "Invalid response from AI provider" }, { status: 500 });
      }
      return NextResponse.json(JSON.parse(result.choices[0].message.content));
    }

    const systemPrompt = `
You are playing the role of ${mission.character_name} in a roleplay.
IMPORTANT: You ARE ${mission.character_name}. NEVER use placeholders like "[your name]". Use your assigned character name "${mission.character_name}" or simply "I".
Context: "${mission.scene_context}"
Objective: "${mission.objective}"
Student Level: ${userLevel || 'A2'}

Instructions:
1. Speak ONLY in English. Do not use any other language at all.
2. Stay in character.
3. Keep responses concise and natural.
4. Adapt to level ${userLevel}. SPECIFIC INSTRUCTION: ${specificInstruction}
5. PROACTIVELY Guide the user to complete the objective: "${mission.objective}". Ask relevant questions to move the scenario forward.
6. Rate the USER'S last response (from 1 to 5 stars) based on clarity and appropriatenes.
7. Return a JSON object with:
   - "message": Your response text as the character.
   - "estimated_time": Seconds estimated for the student to reply (e.g. 15 for simple, 45 for complex).
   - "feedback": Evaluate the USER'S last message (the one immediately before your reply). Correct their grammar/vocabulary or praise them. Address the USER directly (e.g., "You said... try saying..."). Do NOT critique your own character's lines.
   - "rating": Integer 1-5 (User's performance score for the last turn).
   - "progress": Integer 0-100. Estimate how close the user is to completing the objective "${mission.objective}". 
        - Start at 0-10 at the beginning.
        - Increase as the user provides necessary information or performs required actions.
        - Reach 100 ONLY when the objective is fully met and the conversation can end.
   - "mission_completed": Boolean (true if progress is 100).
    `.trim();

    // Prepend system message if not present
    // Also, calculate current average rating if available in message history
    let validRatings = 0;
    let highRatings = 0;
    
    // Sanitize messages for API and count ratings
    const apiMessages = messages.map((m: any) => {
        if (m.rating) {
            validRatings++;
            if (m.rating > 3.5) highRatings++;
        }
        // Remove custom fields before sending to AI provider
        const { rating, feedback, ...rest } = m;
        return rest;
    });

    const successRate = validRatings > 0 ? (highRatings / validRatings) : 0;
    const shouldEnd = validRatings >= 3 && successRate > 0.5; // Example logic: at least 3 turns, >50% good

    const fullMessages = [
      { role: 'system', content: systemPrompt + (shouldEnd ? "\n\n(System Note: The student has performed well enough to pass. You may wrap up the conversation if the objective is complete.)" : "") },
      ...apiMessages
    ];

    // If no user messages yet, this is the start of the conversation.
    if (messages.length === 0) {
      fullMessages.push({ 
        role: 'user', 
        content: `(System) The simulation is starting. Please greet the user as ${mission.character_name} and set the scene based on the context: "${mission.scene_context}". Keep it short and speak ONLY in English.` 
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://speak-mvp.com", // Required by OpenRouter
        "X-Title": "Speak MVP"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001", // Using a standard reliable model ID
        "messages": fullMessages,
        "max_tokens": 500, // Explicitly increase output token limit
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API Error:", errorText);
        return NextResponse.json({ error: `AI Provider Error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    if (!result.choices || result.choices.length === 0 || !result.choices[0].message) {
        console.error("Invalid API Response", result);
        return NextResponse.json({ error: "Invalid response from AI provider" }, { status: 500 });
    }
    
    try {
        const parsed = JSON.parse(result.choices[0].message.content);
        return NextResponse.json({ 
            message: { 
                role: 'assistant', 
                content: parsed.message,
                rating: parsed.rating // Return rating for frontend to store
            }, 
            estimated_time: parsed.estimated_time || 30,
            feedback: parsed.feedback,
            progress: parsed.progress || 0, // Pass progress to frontend
            mission_completed: parsed.mission_completed
        });
    } catch (e) {
        // Fallback for non-JSON response
        if (!result.choices || result.choices.length === 0 || !result.choices[0].message) {
            console.error("Fallback Mode: Invalid API Response", result);
            return NextResponse.json({ error: "Invalid response from AI provider" }, { status: 500 });
        }
        return NextResponse.json({ 
            message: result.choices[0].message,
            estimated_time: 30,
            feedback: null
        });
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
