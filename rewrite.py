import re

old_text = open('frontend/app/api/stories/[id]/scene/[sceneId]/submit/route.ts', 'r', encoding='utf-8').read()

new_logic = """  // 2. Evaluation logic (Call OpenRouter)
  let evaluation: any = null;
  const isGood = response_text.length > 20;
  
  const systemPrompt = `Eres un experto tutor de inglés enseñando a un estudiante nivel B1/B2 en un juego de rol.
El personaje del estudiante es ${scene.player_role_name} en ${scene.narrative_context}. 
Situación actual: ${scene.situation}.
Objetivo del estudiante (DEBE FULFILLMENT): ${scene.objective}.
Respuesta del estudiante: "${response_text}".

Evalúa qué tan bien se ajusta la respuesta al contexto y la gramática del inglés.
Tu respuesta DEBE ser SOLAMENTE en un objeto JSON con el siguiente esquema:
{
  "rating_1_to_5": 5, // 1 es completamente fuera de contexto/sin sentido, 5 es perfecta.
  "analysis_message": "Explicación breve EN ESPAÑOL al estudiante sobre por qué su respuesta es correcta, o si se equivocó y estaba fuera de contexto, explícale de forma constructiva.",
  "judgment": "ADVANCE", // ADVANCE si el rating_1_to_5 es de 3 a 5, PAUSE si es 1 a 2.
  "comprehensibility_score": 85, // 0-100.
  "grammar_score": 80, // 0-100.
  "lexical_richness_score": 75, // 0-100.
  "feedback_text": "Respuesta DENTRO DE PERSONAJE, en inglés, continuando la historia.",
  "phrase_correction": {
    "original": "${response_text}",
    "corrected": "La versión corregida gramaticalmente en inglés.",
    "explanation": "Si hubo error, explícalo en español."
  },
  "alternatives": [
     {"type": "native", "phrase": "A more natural native way to say this"},
     {"type": "technical", "phrase": "A more formal/technical way to say this"}
  ]
}`;

  try {
      const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`
          },
          body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              response_format: { type: "json_object" },
              messages: [
                 { role: 'system', content: systemPrompt }
              ]
          })
      });
      if (apiRes.ok) {
          const jsonRes = await apiRes.json();
          const contentStr = jsonRes.choices[0].message.content;
          evaluation = JSON.parse(contentStr);
          evaluation.is_correct = evaluation.rating_1_to_5 >= 3;
      } else {
          console.warn('Eval service error', await apiRes.text());
      }
  } catch (e) {
      console.warn('Eval service fetch failed', e);
  }

  // Fallback Mock si el microservicio de Gemini falla
  if (!evaluation) {
    const score = isGood ? 85 : 45
    evaluation = {
        rating_1_to_5: isGood ? 4 : 2,
        analysis_message: isGood ? 'Buen trabajo ajustándote al contexto de la historia.' : 'Tu respuesta parece no corresponder a la situación, intenta revisar tus diálogos.',
        judgment: isGood ? 'ADVANCE' : 'PAUSE',
        comprehensibility_score: score,
        grammar_score: score - 5,
        lexical_richness_score: score - 10,
        feedback_text: isGood ? 'Great effort catching up with me!' : 'I am sorry, could you elaborate?',
        phrase_correction: {
            original: response_text,
            corrected: response_text,
            explanation: isGood ? 'Tu respuesta es gramaticalmente correcta y tiene sentido.' : 'Revisa de nuevo la forma de decirlo.',
        },
        alternatives: [
           {type: 'native', phrase: 'Alternative native way to say this...'}
        ]
    }
  }
  
  if (!evaluation.recommendations || evaluation.recommendations.length === 0) {
      evaluation.recommendations = buildFallbackRecommendations(response_text, scene.objective);
  }"""

start_match = re.search(r'// 2\. Evaluation logic \(Call Python Service or fallback\)', old_text)
end_match = re.search(r'evaluation\.recommendations = buildFallbackRecommendations\(response_text, scene\.objective\)\n\s+}', old_text)

if start_match and end_match:
    updated_text = old_text[:start_match.start()] + new_logic + old_text[end_match.end():]
    open('frontend/app/api/stories/[id]/scene/[sceneId]/submit/route.ts', 'w', encoding='utf-8').write(updated_text)
    print("Replace Successful.")
else:
    print("Match failure.")
    if not start_match: print("- Start regex failed")
    if not end_match: print("- End regex failed")
