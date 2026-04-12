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
          "HTTP-Referer": "https://vox.app",
          "X-Title": "VOX"
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
          "HTTP-Referer": "https://vox.app",
          "X-Title": "VOX"
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

    const systemPrompt = `You are ${mission.character_name} in a roleplay conversation.
Your job: Have a conversation to help student complete this objective: "${mission.objective}"
Context: "${mission.scene_context}"
Student level: ${userLevel}
${specificInstruction}

CONVERSATION FLOW - FOLLOW THE OBJECTIVE SEQUENCE:

Objective: "${mission.objective}"

BREAK DOWN THE OBJECTIVE:
- Identify EACH required task (e.g., "introduce name", "introduce where from", "introduce one thing you enjoy", "ask a question")
- Ask for EACH item IN ORDER following the typical conversation flow
- Do NOT jump ahead or skip items
- Do NOT ask multiple items in one question

EXAMPLE FLOW for "Introduce yourself: say your name, where you are from, and one thing you enjoy. Ask the other person one question too":
  STEP 1: Ask for name → "What's your name?"
  STEP 2: Ask for origin → "Where are you from?"
  STEP 3: Ask for hobby → "What's something you enjoy doing?"
  STEP 4: Ask them a question → Any natural follow-up question

DO NOT do this (WRONG):
  ✗ "Are you enjoying it so far?" (too vague, doesn't follow objective steps)
  ✗ "Tell me everything about yourself" (asks too much at once)
  ✗ Ask about hobbies first (wrong order - should be name first)

CRITICAL RULES - EVALUATE RESPONSES STRICTLY:

1. QUESTION RELEVANCE - Is the student answering YOUR CURRENT question (the one in the objective sequence)?
   ✓ VALID: Responds to your specific question about name/origin/hobby/etc
   ✗ INVALID: Ignores your question or answers about something else
   
   Example: You ask "What is your name?"
   ✓ Valid: "My name is John"
   ✗ Invalid: "I have an exam" or "I like pizza"

2. REACTION BASED on ANSWER:
   • Rating 1 (REJECT): Did NOT answer your current step question
     → Show you didn't understand or answer the question
     → Ask them AGAIN with the SAME question
     → progress=0
   
   • Rating 2-3 (NEEDS WORK): Answered but has grammar/vocabulary errors
     → Provide correction
     → Move to NEXT step in sequence if it's clear enough
     → progress=10-30
   
   • Rating 4-5 (GOOD): Answered well with minimal errors
     → Acknowledge the good answer
     → Move to NEXT step in the objective sequence
     → progress increases based on how many steps completed

3. PROGRESS CALCULATION:
   - Count total steps needed (e.g., 4 steps: name, origin, hobby, question)
   - Progress = (current_step / total_steps) * 100
   - When all steps complete → mission_completed = true

4. JSON RESPONSE (MANDATORY):
{
  "message": "Your character response in English",
  "rating": 1-5 (integer),
  "feedback": "Tu retroalimentación en ESPAÑOL",
  "correctedText": null or "corrected sentence",
  "progress": 0-100 (integer),
  "mission_completed": true/false
}

EXAMPLES:

STEP 1 - ASK NAME:
- Your message: "Hi! Welcome to our networking event. What's your name?"
- Student says: "I'm John"
- Response: {
    "message": "Nice to meet you, John! Where are you from?",
    "rating": 4,
    "feedback": "¡Excelente! Respondiste correctamente. Ahora cuéntame de dónde eres.",
    "correctedText": null,
    "progress": 25,
    "mission_completed": false
  }

STEP 1 - WRONG ANSWER (must show example of correct response):
- Your message: "What's your name?"
- Student says: "I have an exam tomorrow"
- Response: {
    "message": "I'm sorry, I don't understand. I'm asking what your name is - could you tell me that?",
    "rating": 1,
    "feedback": "No respondiste a la pregunta. Te pregunté tu nombre, por favor responde a eso primero.",
    "correctedText": "My name is [your name].",
    "progress": 0,
    "mission_completed": false
  }

STEP 2 - ASK ORIGIN:
- Your message: "Where are you from?"
- Student says: "I am from spain"
- Response: {
    "message": "That's great! Spain is beautiful. What's something you really enjoy doing?",
    "rating": 3,
    "feedback": "Respuesta correcta pero falta capitalizar 'I' y 'Spain'. Debería ser 'I am from Spain.'",
    "correctedText": "I am from Spain.",
    "progress": 50,
    "mission_completed": false
  }

STEP 3 - ASK HOBBY:
- Your message: "What's something you really enjoy doing?"
- Student says: "I enjoy playing soccer very much"
- Response: {
    "message": "That sounds fun! How often do you play?",
    "rating": 5,
    "feedback": "¡Respuesta excelente y bien estructurada! Muy natural.",
    "correctedText": null,
    "progress": 75,
    "mission_completed": false
  }

STEP 4 - ASK YOUR QUESTION:
- Your message: "How often do you play?"
- Student says: "I play twice a week"
- Response: {
    "message": "Nice! Well, it was great meeting you, John from Spain!",
    "rating": 4,
    "feedback": "¡Completaste la misión perfectamente! Diste tu nombre, origen, una cosa que disfrutas, y respondiste mis preguntas.",
    "correctedText": null,
    "progress": 100,
    "mission_completed": true
  }

KEY ABOUT correctedText:
- For rating 1 (rejected): ALWAYS provide an example of correct answer (e.g., "My name is John.")
- For rating 2-3 (errors): Provide the corrected version of what they said
- For rating 4-5 (good): Use null

REMEMBER:
- Follow the objective sequence strictly
- Ask one thing at a time
- Provide correctedText only for ratings 2-3
- feedback MUST be in SPANISH
- Return ONLY JSON, no markdown/backticks`;

    // API logic continues below
    

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
        "HTTP-Referer": "https://vox.app", // Required by OpenRouter
        "X-Title": "VOX"
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
            correctedText: parsed.correctedText || null, // Return the corrected version of user's response
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
