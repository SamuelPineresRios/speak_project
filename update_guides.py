#!/usr/bin/env python3
import json
from pathlib import Path

db_path = Path("frontend/data/db.json")
with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Enhanced guides with detailed content
improved_guides = [
    {
        "id": "guide-001",
        "title": "Present Perfect",
        "description": "Master the Present Perfect tense for talking about experiences and recent actions",
        "cover_emoji": "⏰",
        "cefr_level": "A2",
        "concept_tags": ["present-perfect", "grammar", "verb-tenses"],
        "estimated_minutes": 25,
        "content": {
            "definition": "El Present Perfect es un tiempo verbal que se utiliza para expresar acciones que comenzaron en el pasado pero tienen alguna conexión o relevancia con el presente.",
            "explanation": "El Present Perfect conecta el pasado con el presente. A diferencia del Simple Past (pretérito), el Present Perfect NO especifica CUÁNDO ocurrió la acción. Es perfecto para experiencias de vida, acciones recientes, cambios a lo largo del tiempo, o acciones que comenzaron en el pasado y continúan.",
            "formula": "Subject + HAVE/HAS + Past Participle\n\nPara preguntas: HAVE/HAS + Subject + Past Participle?\n\nPara negativos: Subject + HAVE/HAS + NOT + Past Participle",
            "key_structures": [
                {
                    "structure": "Affirmative: Subject + have/has + Past Participle",
                    "example": "I have visited Madrid five times.",
                    "explanation": "Se usa con I, you, we, they (have) y he, she, it (has). Indica experiencia en la vida."
                },
                {
                    "structure": "Present Perfect Continuous: have/has + been + -ing",
                    "example": "I have been studying English for 2 years.",
                    "explanation": "Enfatiza la duración de una acción que comenzó en el pasado y continúa ahora."
                },
                {
                    "structure": "Interrogative: Have/Has + Subject + Past Participle?",
                    "example": "Have you ever tried sushi?",
                    "explanation": "Se usa para preguntar sobre experiencias previas."
                },
                {
                    "structure": "Negative: Subject + haven't/hasn't + Past Participle",
                    "example": "She hasn't finished her work yet.",
                    "explanation": "Negación de una acción esperada que aún no ha completado."
                }
            ],
            "common_expressions": [
                {"expression": "ever (alguna vez)", "example": "Have you ever been to Paris?"},
                {"expression": "never (nunca)", "example": "I have never seen that movie."},
                {"expression": "just (acabo de)", "example": "I have just arrived."},
                {"expression": "already (ya)", "example": "She has already finished her homework."},
                {"expression": "yet (todavía/aún)", "example": "Have you finished yet?"},
                {"expression": "for (durante)", "example": "We have known each other for 5 years."},
                {"expression": "since (desde)", "example": "I have lived here since 2015."}
            ],
            "real_life_examples": [
                {
                    "context": "En una entrevista de trabajo",
                    "example": "I have worked with international teams for 3 years.",
                    "explanation": "Muestras tu experiencia relevante para el puesto."
                },
                {
                    "context": "Hablando con un amigo que no has visto",
                    "example": "I've been learning to code and I've completed two projects.",
                    "explanation": "Compartes lo que has estado haciendo últimamente."
                },
                {
                    "context": "En una tienda",
                    "example": "Customer: Have you received the new stock? Shopkeeper: Yes, it just arrived!",
                    "explanation": "Preguntar sobre disponibilidad de productos."
                },
                {
                    "context": "Discusión sobre logros",
                    "example": "I have visited 15 countries and I'm planning to visit more.",
                    "explanation": "Compartir experiencias de vida."
                }
            ],
            "exercises": [
                {
                    "id": "ex-001",
                    "type": "multiple_choice",
                    "question": "Complete: 'I ____ (see) that movie three times.'",
                    "options": ["have seen", "saw", "see", "have been seeing"],
                    "correct_answer": "have seen",
                    "explanation": "Usamos 'have seen' porque es una experiencia en la vida sin especificar cuándo."
                },
                {
                    "id": "ex-002",
                    "type": "multiple_choice",
                    "question": "Which sentence is correct?",
                    "options": [
                        "She has lived here since 2020.",
                        "She lives here since 2020.",
                        "She has lived here for 2020."
                    ],
                    "correct_answer": "She has lived here since 2020.",
                    "explanation": "'Since' va con el año/punto en el tiempo. 'Lives' es present simple, no es correcto aquí."
                },
                {
                    "id": "ex-003",
                    "type": "multiple_choice",
                    "question": "''Have you finished your homework yet?' '____'",
                    "options": [
                        "No, I haven't finished it yet.",
                        "No, I don't finish it yet.",
                        "No, I haven't finishing it yet."
                    ],
                    "correct_answer": "No, I haven't finished it yet.",
                    "explanation": "Usamos present perfect negativo con 'yet' para acciones no completadas."
                },
                {
                    "id": "ex-004",
                    "type": "fill_in",
                    "question": "I ____ (just / arrive) at the airport.",
                    "options": ["have just arrived", "just arrived", "have arrive just"],
                    "correct_answer": "have just arrived",
                    "explanation": "Orden correcto: have + just + past participle"
                },
                {
                    "id": "ex-005",
                    "type": "multiple_choice",
                    "question": "Which uses Present Perfect correctly?",
                    "options": [
                        "They have visited Paris last year.",
                        "They have visited Paris many times.",
                        "They visited Paris last month."
                    ],
                    "correct_answer": "They have visited Paris many times.",
                    "explanation": "No puedes usar Present Perfect con expresiones de tiempo específicas como 'last year' o 'last month'. Si especificas el tiempo, usas Simple Past."
                },
                {
                    "id": "ex-006",
                    "type": "multiple_choice",
                    "question": "How long ____ (you / live) in this city?",
                    "options": [
                        "have you lived",
                        "do you live",
                        "have you been living",
                        "are you living"
                    ],
                    "correct_answer": "have you lived",
                    "explanation": "Con 'how long' (duración) usamos Present Perfect, especialmente si es una acción continua desde el pasado."
                },
                {
                    "id": "ex-007",
                    "type": "multiple_choice",
                    "question": "She ____ (never / try) Italian food before.",
                    "options": [
                        "has never tried",
                        "never has tried",
                        "has never try"
                    ],
                    "correct_answer": "has never tried",
                    "explanation": "Estructura: has + never + past participle. Never va después del auxiliar."
                },
                {
                    "id": "ex-008",
                    "type": "multiple_choice",
                    "question": "What's wrong? You ____ (look) upset.",
                    "options": [
                        "have looked",
                        "has looked",
                        "are looking",
                        "have been looking"
                    ],
                    "correct_answer": "have been looking",
                    "explanation": "En observaciones sobre cambios recientes, usamos Present Perfect Continuous para enfatizar la duración."
                },
                {
                    "id": "ex-009",
                    "type": "true_false",
                    "question": "True or False: 'I have gone to the cinema yesterday' is correct.",
                    "correct_answer": "false",
                    "explanation": "'Yesterday' es expresión de tiempo específico, así que debes usar Simple Past: 'I went to the cinema yesterday.'"
                },
                {
                    "id": "ex-010",
                    "type": "multiple_choice",
                    "question": "The project ____ (finish) yet?",
                    "options": [
                        "Has it finished",
                        "Has finished",
                        "Has it been finishing",
                        "Did it finish"
                    ],
                    "correct_answer": "Has it finished",
                    "explanation": "Pregunta con Present Perfect: Question word/pronoun + has/have + subject (si aplica) + past participle."
                }
            ]
        },
        "mission_connection": "m-001",
        "story_connection": "story-001",
        "scene_concepts": ["past-experience", "life-events"],
        "created_at": "2026-03-18T10:00:00Z",
        "is_published": True,
        "enable_chat_assistant": True
    },
    {
        "id": "guide-002",
        "title": "Phrasal Verbs",
        "description": "Learn essential phrasal verbs for daily conversation and business",
        "cover_emoji": "🔄",
        "cefr_level": "B1",
        "concept_tags": ["phrasal-verbs", "vocabulary", "colloquial"],
        "estimated_minutes": 30,
        "content": {
            "definition": "Los Phrasal Verbs son combinaciones de un verbo principal + una o más palabras (preposición o adverbio). Juntos crean un significado diferente al del verbo solo.",
            "explanation": "Los phrasal verbs son muy comunes en inglés hablado y son esenciales para comunicarse naturalmente. El significado no es la suma simple de sus partes. Por ejemplo, 'look' = mirar, pero 'look after' = cuidar. Los phrasal verbs pueden ser separables (el objeto va entre el verbo y la partícula) o inseparables (el objeto siempre va después).",
            "formula": "Separable: Verb + Particle + Object O Verb + Object + Particle\nEjemplo: 'Put on your coat' o 'Put your coat on'\n\nInseparable: Verb + Particle + Object\nEjemplo: 'Look after your little sister' (NOT: Look your sister after)",
            "key_structures": [
                {
                    "structure": "Separable Phrasal Verbs",
                    "example": "Put on / Take off / Turn on",
                    "explanation": "Con nombres: 'Put on your shoes' o 'Put your shoes on'. Con pronombres: SIEMPRE en medio: 'Put them on (NOT: Put on them)'"
                },
                {
                    "structure": "Inseparable Phrasal Verbs",
                    "example": "Look after / Look forward to / Get along with",
                    "explanation": "El objeto va SIEMPRE después: 'I look forward to the weekend' (NOT: 'I look the weekend forward to')"
                },
                {
                    "structure": "Three-word Phrasal Verbs",
                    "example": "Put up with / Get on with",
                    "explanation": "Tres palabras vinculadas, siempre inseparables."
                }
            ],
            "common_expressions": [
                {"phrasal_verb": "Look up", "meaning": "Buscar información", "example": "I looked up the word in the dictionary.", "context": "Académico/Estudio"},
                {"phrasal_verb": "Put off", "meaning": "Posponer, aplazar", "example": "Don't put off your homework.", "context": "General/Procrastinación"},
                {"phrasal_verb": "Bring up", "meaning": "Mencionar, educar (niño)", "example": "She brought up an interesting point.", "context": "Conversación/Educación"},
                {"phrasal_verb": "Get along", "meaning": "Llevarse bien, entenderse", "example": "They get along really well.", "context": "Relaciones"},
                {"phrasal_verb": "Check out", "meaning": "Explorar, investigar, pagar y salir", "example": "Check out this new restaurant!", "context": "General/Viaje"},
                {"phrasal_verb": "Give up", "meaning": "Rendirse, abandonar", "example": "Don't give up on your dreams.", "context": "Motivación"},
                {"phrasal_verb": "Turn down", "meaning": "Rechazar, reducir volumen", "example": "They turned down my job offer.", "context": "Trabajo/Tecnología"},
                {"phrasal_verb": "Work out", "meaning": "Resolver, hacer ejercicio, funcionar", "example": "Everything worked out perfectly.", "context": "General"}
            ],
            "real_life_examples": [
                {
                    "context": "En una reunión de trabajo",
                    "example": "We need to put off the meeting to next week because our manager is sick.",
                    "explanation": "Usar 'put off' para posponer compromisos profesionales."
                },
                {
                    "context": "En redes sociales",
                    "example": "Check out my new blog post! I wrote about productivity tips.",
                    "explanation": "Invitar a otros a ver algo interesante."
                },
                {
                    "context": "En un conflicto familiar",
                    "example": "My brother and I don't always get along, but we're working on it.",
                    "explanation": "Hablar sobre relaciones interpersonales."
                },
                {
                    "context": "En una entrevista de trabajo",
                    "example": "When problems arise, I look them up in the documentation before asking for help.",
                    "explanation": "Mostrar iniciativa y habilidades de resolución de problemas."
                }
            ],
            "exercises": [
                {
                    "id": "ex-001",
                    "type": "multiple_choice",
                    "question": "Choose the correct phrasal verb: 'My sister always ____ her friends when she's in trouble.'",
                    "options": ["looks after", "puts on", "gets along", "checks out"],
                    "correct_answer": "looks after",
                    "explanation": "'Looks after' = cuidar de alguien. 'Puts on' = ponerse ropa. 'Gets along' = llevarse bien. 'Checks out' = investigar."
                },
                {
                    "id": "ex-002",
                    "type": "fill_in",
                    "question": "I need to ____ your number in my phone.",
                    "options": ["put in", "put on", "put up", "put off"],
                    "correct_answer": "put in",
                    "explanation": "'Put in' = insertar, meter. Aquí usamos el número de teléfono como objeto."
                },
                {
                    "id": "ex-003",
                    "type": "multiple_choice",
                    "question": "Which sentence is correct?",
                    "options": [
                        "They gave up on finding a solution.",
                        "They gave on up finding a solution.",
                        "They gave finding on up a solution."
                    ],
                    "correct_answer": "They gave up on finding a solution.",
                    "explanation": "'Give up on' = rendirse ante algo. Orden: verbo + partículas + preposición + objeto."
                },
                {
                    "id": "ex-004",
                    "type": "multiple_choice",
                    "question": "Complete: 'She turned ____ the job offer because the salary was too low.'",
                    "options": ["down", "off", "on", "up"],
                    "correct_answer": "down",
                    "explanation": "'Turn down' = rechazar una oferta. 'Turn off' = apagar. 'Turn on' = encender. 'Turn up' = aparecer."
                },
                {
                    "id": "ex-005",
                    "type": "rearrange",
                    "question": "Rearrange: 'I / on / they / get / really / along / well / with'",
                    "correct_answer": "I really get along well with them.",
                    "explanation": "Conjugación de 'get along with': 'I / we / you / they get along' + 'he / she / it gets along'"
                },
                {
                    "id": "ex-006",
                    "type": "multiple_choice",
                    "question": "Which is the correct position for the pronoun? 'Turn it ____' or '____'",
                    "options": [
                        "Turn it on",
                        "Turn on it",
                        "On turn it",
                        "It turn on"
                    ],
                    "correct_answer": "Turn it on",
                    "explanation": "Con pronombres, siempre va entre el verbo y la partícula: Verb + Pronoun + Particle"
                },
                {
                    "id": "ex-007",
                    "type": "multiple_choice",
                    "question": "'Please ____ the radio, it's too loud!'",
                    "options": [
                        "turn down",
                        "turn up",
                        "turn on",
                        "turn over"
                    ],
                    "correct_answer": "turn down",
                    "explanation": "'Turn down' = reducir el volumen o rechazar. 'Turn up' = aumentar volumen o aparecer."
                },
                {
                    "id": "ex-008",
                    "type": "fill_in",
                    "question": "Don't ____ your dreams! Keep working hard.",
                    "options": ["give up on", "give up", "give on", "give to"],
                    "correct_answer": "give up on",
                    "explanation": "'Give up on' = rendirse ante algo. Sin 'on' también es correcto, pero 'on' añade énfasis en el objeto."
                },
                {
                    "id": "ex-009",
                    "type": "true_false",
                    "question": "True or False: 'Look after your sister' and 'Look your sister after' mean the same thing.",
                    "correct_answer": "false",
                    "explanation": "'Look after' es inseparable. 'Look your sister after' es INCORRECTO. 'Look after your sister' es la forma correcta."
                },
                {
                    "id": "ex-010",
                    "type": "multiple_choice",
                    "question": "Complete: 'They are ____ from their trip next week.'",
                    "options": [
                        "coming back",
                        "coming on",
                        "coming up",
                        "coming off"
                    ],
                    "correct_answer": "coming back",
                    "explanation": "'Come back' = regresar. 'Come up' = surgir (tema). 'Come off' = desprenderse."
                }
            ]
        },
        "mission_connection": "m-004",
        "story_connection": "story-005",
        "scene_concepts": ["verb-usage", "daily-conversation"],
        "created_at": "2026-03-18T11:00:00Z",
        "is_published": True,
        "enable_chat_assistant": True
    }
]

# Add more guides (conditionals, passive voice, modals, etc.)
improved_guides.extend([
    {
        "id": "guide-003",
        "title": "Conditional Sentences (If Clauses)",
        "description": "Master the four types of conditional sentences for expressing hypothetical situations",
        "cover_emoji": "❓",
        "cefr_level": "B1",
        "concept_tags": ["conditionals", "grammar", "hypothetical"],
        "estimated_minutes": 30,
        "content": {
            "definition": "Las oraciones condicionales (If Clauses) son enunciados que expresan una condición y su resultado. Estructuran situaciones reales, posibles, o imaginarias.",
            "explanation": "Hay CUATRO tipos principales. Cada tipo expresa diferentes grados de probabilidad: desde situaciones reales hasta situaciones completamente imaginarias. El tipo 0 es para verdades universales, tipo 1 para posible/futuro, tipo 2 para improbable/presente, tipo 3 para imposible/pasado. Esta estructura es fundamental en inglés para negociar, hacer planes, y expresar posibilidades.",
            "formula": "Type 0 (Universal): If + Simple Present, Simple Present\nType 1 (Posible): If + Simple Present, will + infinitive\nType 2 (Improbable): If + Simple Past, would + infinitive\nType 3 (Imposible/Pasado): If + Past Perfect, would have + past participle",
            "key_structures": [
                {
                    "structure": "Zero Conditional (Siempre verdadero)",
                    "example": "If you heat ice, it melts.",
                    "explanation": "Para hechos científicos, reglas, o verdades generales que siempre son ciertas."
                },
                {
                    "structure": "First Conditional (Probable en futuro)",
                    "example": "If I study hard, I will pass the exam.",
                    "explanation": "Para situaciones reales que PROBABLEMENTE pasarán si la condición ocurre."
                },
                {
                    "structure": "Second Conditional (Improbable ahora)",
                    "example": "If I won the lottery, I would travel the world.",
                    "explanation": "Para situaciones imaginarias o poco probables en el PRESENTE. Es como un sueño o especulación."
                },
                {
                    "structure": "Third Conditional (Imposible - pasado)",
                    "example": "If you had studied, you would have passed.",
                    "explanation": "Para hablar del PASADO con arrepentimiento o reflexión. La condición no ocurrió, por eso es imposible."
                }
            ],
            "common_expressions": [
                {"type": "Mixed usage", "expression": "unless (a menos que)", "example": "I won't go unless you come with me.", "note": "Unless = if not"},
                {"type": "Second Conditional", "expression": "If I were you...", "example": "If I were you, I would talk to her.", "note": "Se usa 'were' incluso con 'I', no 'was'"},
                {"type": "First Conditional", "expression": "as long as (siempre que)", "example": "I'll help you as long as you try your best.", "note": "Sinónimo de 'if'"},
                {"type": "Third Conditional", "expression": "If only (si tan solo)", "example": "If only I had known!", "note": "Expresa arrepentimiento"}
            ],
            "real_life_examples": [
                {
                    "context": "Negociación de salario",
                    "example": "If you offer me $60,000, I will accept the job. If you offered $70,000, I would consider it more seriously.",
                    "explanation": "Combinar tipo 1 y 2 para expresar diferentes escenarios."
                },
                {
                    "context": "Discusión sobre el pasado",
                    "example": "If you had told me earlier, I would have helped you. But you didn't tell me, so here we are.",
                    "explanation": "Tipo 3: expresar arrepentimiento o reflexión."
                },
                {
                    "context": "Planificación de viaje",
                    "example": "If the weather is good, we will go to the beach this weekend.",
                    "explanation": "Tipo 1: planes reales basados en condiciones probables."
                },
                {
                    "context": "Consejo imaginario",
                    "example": "If I were in your position, I would definitely apply for that scholarship.",
                    "explanation": "Tipo 2: consejos sobre cómo actuarías en su lugar."
                }
            ],
            "exercises": [
                {
                    "id": "ex-001",
                    "type": "multiple_choice",
                    "question": "Complete (Type 1): 'If you study hard, you ____.' ",
                    "options": ["will pass", "would pass", "pass", "would have passed"],
                    "correct_answer": "will pass",
                    "explanation": "Type 1: If + Simple Present→ will + infinitive, para situaciones probables en el futuro."
                },
                {
                    "id": "ex-002",
                    "type": "multiple_choice",
                    "question": "Which is Type 2 (improbable)?",
                    "options": [
                        "If you won the lottery, you would buy a house.",
                        "If you win the lottery, you will buy a house.",
                        "If you had won the lottery, you would have bought a house."
                    ],
                    "correct_answer": "If you won the lottery, you would buy a house.",
                    "explanation": "Type 2: If + Simple Past → would + infinitive, para situaciones imaginarias/improbables en el PRESENTE."
                },
                {
                    "id": "ex-003",
                    "type": "fill_in",
                    "question": "If I ____ (know) you were coming, I ____ (prepare) dinner.",
                    "options": [
                        "knew / would prepare",
                        "had known / would have prepared",
                        "know / will prepare",
                        "would know / prepare"
                    ],
                    "correct_answer": "had known / would have prepared",
                    "explanation": "Type 3: If + Past Perfect → would have + past participle, para reflexionar sobre el PASADO."
                },
                {
                    "id": "ex-004",
                    "type": "multiple_choice",
                    "question": "True use of Type 0?",
                    "options": [
                        "If water boils, it will evaporate.",
                        "If water boils, it evaporates.",
                        "If water boiled, it would evaporate."
                    ],
                    "correct_answer": "If water boils, it evaporates.",
                    "explanation": "Type 0: If + Simple Present → Simple Present, para hechos científicos/reglas universales."
                },
                {
                    "id": "ex-005",
                    "type": "multiple_choice",
                    "question": "Complete: 'Unless you ____ (apologize), I won't forgive you.'",
                    "options": [
                        "apologize",
                        "apologized",
                        "will apologize",
                        "would apologize"
                    ],
                    "correct_answer": "apologize",
                    "explanation": "'Unless' funciona como 'if not'. Estructura: Unless + Simple Present → will + infinitive (Type 1)."
                },
                {
                    "id": "ex-006",
                    "type": "multiple_choice",
                    "question": "What conditional type uses 'were' even with 'I'?",
                    "options": [
                        "Type 0",
                        "Type 1",
                        "Type 2",
                        "Type 3"
                    ],
                    "correct_answer": "Type 2",
                    "explanation": "Type 2 (improbable/presente): 'If I were you...' 'If she were here...' Se usa 'were' para todos incluso con singulares."
                },
                {
                    "id": "ex-007",
                    "type": "rearrange",
                    "question": "Rearrange to Type 3: 'studied / would / I / have / had / if / passed'",
                    "correct_answer": "If I had studied, I would have passed.",
                    "explanation": "Type 3: If + Past Perfect, would have + past participle, para hablar con arrepentimiento."
                },
                {
                    "id": "ex-008",
                    "type": "true_false",
                    "question": "True or False: 'If he will come, I will be happy' is correct.",
                    "correct_answer": "false",
                    "explanation": "INCORRECTO: No usamos futuro en la if-clause. CORRECTO: 'If he comes, I will be happy.' (Type 1: Simple Present en la cláusula if)"
                },
                {
                    "id": "ex-009",
                    "type": "multiple_choice",
                    "question": "Which is mixed conditional (una parte del pasado, otra del presente)?",
                    "options": [
                        "If you had studied, you would pass now.",
                        "If I were there, everything would be different.",
                        "If it rains tomorrow, we will stay home."
                    ],
                    "correct_answer": "If you had studied, you would pass now.",
                    "explanation": "Mixed: If + Past Perfect → would + present infinitive. Significa: si hubieras estudiado ANTES, ahora estarías aprobando."
                },
                {
                    "id": "ex-010",
                    "type": "multiple_choice",
                    "question": "Complete: 'As long as you're honest with me, I ____.' ",
                    "options": [
                        "will trust you",
                        "would trust you",
                        "trust you",
                        "am trusting you"
                    ],
                    "correct_answer": "will trust you",
                    "explanation": "'As long as' funciona como 'if' en Type 1. Simple Present en la condición + will + infinitive."
                }
            ]
        },
        "mission_connection": "m-002",
        "story_connection": "story-003",
        "scene_concepts": ["hypothetical", "probability"],
        "created_at": "2026-03-18T12:00:00Z",
        "is_published": True,
        "enable_chat_assistant": True
    }
])

# Update database
db["guides"] = improved_guides

# Write back
with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"✅ Updated {len(improved_guides)} guides in database")
print(f"✅ Total exercises added: {sum(len(g.get('content', {}).get('exercises', [])) for g in improved_guides)}")
