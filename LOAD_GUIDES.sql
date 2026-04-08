-- ============================================
-- LOAD GUIDES DATA TO SUPABASE
-- ============================================
-- Copy and paste this entire file into your Supabase SQL Editor
-- and click "Run"
-- 
-- This will insert all 8 guides with their complete content
-- (definitions, formulas, key structures, exercises, etc.)

DELETE FROM guides WHERE id LIKE 'guide-%';

-- Guide 1: Conditional Sentences
INSERT INTO guides (id, title, description, cover_emoji, cefr_level, concept_tags, estimated_minutes, content, is_published, created_at)
VALUES (
  'guide-004',
  'Conditional Sentences',
  'Learn to form and use conditional sentences for hypothetical situations',
  '❓',
  'B1',
  '["conditionals", "grammar", "verb-tenses"]',
  20,
  '{
    "introduction": "Los condicionales se usan para hablar de situaciones hipotéticas. Hay tres tipos principales: First Conditional (probable), Second Conditional (poco probable), y Third Conditional (imposible porque ya pasó).",
    "key_structures": [
      {
        "structure": "First Conditional: If + Present Simple + Will + Verb",
        "example": "If you study hard, you will pass the exam.",
        "explanation": "Se usa para hablar de algo que probablemente suceda en el futuro si se cumple una condición."
      },
      {
        "structure": "Second Conditional: If + Past Simple + Would + Verb",
        "example": "If I had more time, I would travel more.",
        "explanation": "Se usa para hablar de situaciones imaginarias o poco probables en el presente."
      },
      {
        "structure": "Third Conditional: If + Had + Past Participle + Would have + Past Participle",
        "example": "If I had known about the party, I would have gone.",
        "explanation": "Se usa para hablar de situaciones imposibles que no sucedieron en el pasado."
      }
    ],
    "common_expressions": [
      {"expression": "If + you/he/she/it/they", "meaning": "Conditional structure"},
      {"expression": "Unless (unless = if not)", "meaning": "Negative condition"},
      {"expression": "In case (por si acaso)", "meaning": "Precautionary condition"}
    ],
    "exercises": [
      {
        "id": "guide-004-ex-1",
        "type": "fill-blank",
        "question": "Complete: ''If she doesn''t arrive soon, we ____ (leave) without her.''",
        "correct_answer": "will leave",
        "alternatives": ["leave", "are leaving"]
      }
    ]
  }',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Guide 2: Passive Voice
INSERT INTO guides (id, title, description, cover_emoji, cefr_level, concept_tags, estimated_minutes, content, is_published, created_at)
VALUES (
  'guide-005',
  'Passive Voice',
  'Master the passive voice for objective descriptions and formal writing',
  '🔄',
  'B2',
  '["passive-voice", "grammar", "formal-english"]',
  25,
  '{
    "introduction": "La voz pasiva se forma con ''to be'' + past participle. Se usa cuando queremos enfatizar la acción o el objeto en lugar del sujeto que realiza la acción.",
    "definition": "La voz pasiva es una estructura gramatical que enfatiza la acción y el objeto, en lugar del sujeto que realiza la acción.",
    "formula": "Subject + to be (conjugated) + Past Participle (+ by + agent)",
    "key_structures": [
      {
        "structure": "Subject + to be + Past Participle (+ by + agent)",
        "example": "The letter was written by John (Active: John wrote the letter)",
        "explanation": "La forma pasiva enfatiza que la carta fue escrita, no quién la escribió."
      },
      {
        "structure": "Passive in different tenses",
        "example": "Present: is written, Past: was written, Future: will be written, Perfect: has been written",
        "explanation": "El verbo ''to be'' cambia de tiempo, pero el past participle siempre es el mismo."
      }
    ],
    "common_expressions": [
      {"expression": "It is said that...", "meaning": "Se dice que..."},
      {"expression": "It is known that...", "meaning": "Se sabe que..."}
    ],
    "exercises": []
  }',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Guide 3: Modal Verbs
INSERT INTO guides (id, title, description, cover_emoji, cefr_level, concept_tags, estimated_minutes, content, is_published, created_at)
VALUES (
  'guide-006',
  'Modal Verbs',
  'Use modal verbs correctly to express possibility, ability, permission, and obligation',
  '💪',
  'B1',
  '["modal-verbs", "grammar", "meaning"]',
  22,
  '{
    "introduction": "Los verbos modales (can, could, may, might, must, should, ought to, will, would) se usan para expresar habilidad, posibilidad, permiso, obligación, etc. Nunca se conjugan y siempre van seguidos del infinitivo sin ''to''.",
    "definition": "Verbos que expresan habilidad, posibilidad, permiso, obligación u otras modalidades.",
    "formula": "Modal Verb + Base Verb (without to)",
    "key_structures": [
      {
        "structure": "Can / Could + Verb (Habilidad o Posibilidad)",
        "example": "I can speak English / Could you help me?",
        "explanation": "''Can'' es más común en presente, ''could'' en pasado o formas más polidas."
      },
      {
        "structure": "Must / Have to + Verb (Obligación)",
        "example": "You must attend the meeting / You have to be on time",
        "explanation": "''Must'' expresa una obligación personal; ''have to'' es más externa."
      }
    ],
    "common_expressions": [
      {"expression": "May I...?", "meaning": "Formal permission"},
      {"expression": "Might", "meaning": "Remote possibility"}
    ],
    "exercises": []
  }',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Guide 4: Present Perfect
INSERT INTO guides (id, title, description, cover_emoji, cefr_level, concept_tags, estimated_minutes, content, is_published, created_at)
VALUES (
  'guide-001',
  'Present Perfect',
  'Master the Present Perfect tense for experiences and recent events',
  '⏱️',
  'A2',
  '["tenses", "grammar", "present-perfect"]',
  18,
  '{
    "introduction": "El Present Perfect se usa para hablar de experiencias, eventos recientes o situaciones que comenzaron en el pasado but continues al presente.",
    "definition": "Tiempo verbal que conecta el pasado con el presente, expresando acciones que comenzaron en el pasado pero tienen relevancia en el presente.",
    "formula": "Have/Has + Past Participle",
    "key_structures": [
      {
        "structure": "Have/Has + Past Participle",
        "example": "I have studied English for 5 years. / She has lived in Madrid.",
        "explanation": "Se usa para experiencias de vida o eventos que continúan siendo relevantes."
      }
    ],
    "common_expressions": [
      {"expression": "Have you ever...?", "meaning": "Ever - experiencias en la vida"},
      {"expression": "Just - acabar de", "meaning": "Recently - acciones recientes"}
    ],
    "exercises": []
  }',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Guide 5: Phrasal Verbs
INSERT INTO guides (id, title, description, cover_emoji, cefr_level, concept_tags, estimated_minutes, content, is_published, created_at)
VALUES (
  'guide-002',
  'Phrasal Verbs',
  'Learn common phrasal verbs and their meanings in context',
  '🔗',
  'B1',
  '["phrasal-verbs", "vocabulary", "verbs"]',
  20,
  '{
    "introduction": "Los phrasal verbs son combinaciones de un verbo + adverbio o preposición que crean significados idiomatic que no se pueden deducir de las palabras individuales.",
    "definition": "Combinación de verbo + adverbio/preposición con significado idiomático.",
    "key_structures": [
      {
        "structure": "Verb + Adverb/Preposition",
        "example": "Give up (abandonar), Put off (posponer), Call out (gritar)",
        "explanation": "El significado no se puede deducir de las palabras individuales."
      }
    ],
    "common_expressions": [
      {"phrasal_verb": "Bring up", "meaning": "Criar, educar", "example": "She was brought up in London"},
      {"phrasal_verb": "Get along", "meaning": "Llevarse bien", "example": "They get along very well"}
    ],
    "exercises": []
  }',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Guide 6: Reported Speech
INSERT INTO guides (id, title, description, cover_emoji, cefr_level, concept_tags, estimated_minutes, content, is_published, created_at)
VALUES (
  'guide-007',
  'Reported Speech',
  'Learn how to report what others said using reported speech',
  '💬',
  'B2',
  '["reported-speech", "grammar", "indirect-speech"]',
  24,
  '{
    "introduction": "Reported Speech (discurso indirecto) se usa para contar lo que alguien dijo sin usar comillas. Los verbos y los tiempos cambian.",
    "definition": "Manera de reportar lo que alguien dijo sin usar comillas directas.",
    "formula": "He/She said (that) + subject + verb (one tense back)",
    "key_structures": [
      {
        "structure": "Direct: \"I love this movie\" → Reported: He said (that) he loved that movie",
        "example": "Direct: \"Where are you going?\" → Reported: She asked where I was going",
        "explanation": "El verbo se retira un tiempo atrás."
      }
    ],
    "common_expressions": [
      {"expression": "Say vs Tell", "meaning": "Say: no objeto directo, Tell: con objeto directo"}
    ],
    "exercises": []
  }',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Guide 7: Negotiation Phrases
INSERT INTO guides (id, title, description, cover_emoji, cefr_level, concept_tags, estimated_minutes, content, is_published, created_at)
VALUES (
  'guide-003',
  'Negotiation Phrases',
  'Essential phrases for business negotiations and agreements',
  '🤝',
  'B1',
  '["negotiation", "business", "phrases"]',
  19,
  '{
    "introduction": "Las frases de negociación son expresiones utilizadas en contextos de negocios para llegar a acuerdos, hacer propuestas y resolver desacuerdos.",
    "definition": "Expresiones utilizadas en conversaciones de negocios para negociar y llegar a acuerdos.",
    "key_structures": [
      {
        "structure": "Making Offers",
        "example": "What if we... / Would you consider... / How about...",
        "explanation": "Formas polidas de hacer propuestas en negociaciones."
      },
      {
        "structure": "Expressing Concerns",
        "example": "My concern is... / I''m worried about... / The issue is...",
        "explanation": "Maneras de expresar preocupaciones o problemas."
      }
    ],
    "common_expressions": [
      {"expression": "Let''s find a middle ground", "meaning": "Encontrar un término medio"},
      {"expression": "I appreciate your offer", "meaning": "Agradecer una oferta"}
    ],
    "exercises": []
  }',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Guide 8: Question Formation
INSERT INTO guides (id, title, description, cover_emoji, cefr_level, concept_tags, estimated_minutes, content, is_published, created_at)
VALUES (
  'guide-008',
  'Question Formation',
  'Master how to ask questions in English correctly',
  '❓',
  'A2',
  '["questions", "grammar", "interrogatives"]',
  16,
  '{
    "introduction": "La formación de preguntas en inglés sigue patrones específicos dependiendo del tipo de pregunta (Yes/No, Wh-, Tag questions).",
    "definition": "Estructuras gramaticales para hacer preguntas en inglés.",
    "formula": "Auxiliary Verb + Subject + Main Verb + Object?",
    "key_structures": [
      {
        "structure": "Yes/No Questions: Do/Does/Did + Subject + Verb",
        "example": "Do you like English? / Does she work here?",
        "explanation": "Preguntas que requieren respuesta sí o no."
      },
      {
        "structure": "Wh- Questions: Question word + Auxiliary + Subject + Verb",
        "example": "What do you do? / Where does he live?",
        "explanation": "Preguntas que comienzan con palabras interrogativas."
      },
      {
        "structure": "Tag Questions: Statement + short question",
        "example": "You like English, don''t you? / She works here, doesn''t she?",
        "explanation": "Preguntas cortas añadidas al final de afirmaciones."
      }
    ],
    "common_expressions": [
      {"expression": "Could you...?", "meaning": "Pregunta muy cortes"},
      {"expression": "Can I...?", "meaning": "Solicitar permiso"}
    ],
    "exercises": []
  }',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Verify all guides were loaded
SELECT id, title, cefr_level, 
  (content IS NOT NULL) as has_content,
  (content->>'introduction' IS NOT NULL) as has_introduction,
  (content->>'definition' IS NOT NULL) as has_definition,
  (content->>'formula' IS NOT NULL) as has_formula,
  (content->'key_structures' IS NOT NULL) as has_structures
FROM guides
ORDER BY id;
