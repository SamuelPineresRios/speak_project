-- =============================================================================
-- GUÍAS DE APRENDIZAJE - INSERT STATEMENTS
-- Módulo: Learning Guides (Guías de Aprendizaje)
-- Fecha: 2026-04-08
-- =============================================================================

-- Tabla: guides
-- Descripción: Contiene todas las guías de aprendizaje para el módulo

-- ============================================================================
-- GUIDE 1: Present Perfect - The Quest (⏰)
-- ============================================================================
INSERT INTO guides (
  id, title, description, cover_emoji, cefr_level, 
  concept_tags, estimated_minutes, xp_reward, 
  progress_status, progress_score, exercises_completed, exercises_total,
  current_streak, max_streak,
  definition, explanation, formula,
  mission_connection, story_connection, scene_concepts,
  created_at, is_published, enable_chat_assistant
) VALUES (
  'guide-001',
  '⏰ Present Perfect - The Quest',
  'Domina el Present Perfect y desbloquea habilidades de experiencias. 10 ejercicios, 150 XP a ganar.',
  '⏰',
  'A2',
  JSON_ARRAY('present-perfect', 'grammar', 'verb-tenses'),
  25,
  150,
  'in_progress',
  75,
  6,
  10,
  2,
  5,
  'El Present Perfect es un tiempo verbal que se utiliza para expresar acciones que comenzaron en el pasado pero tienen alguna conexión o relevancia con el presente.',
  'El Present Perfect conecta el pasado con el presente. A diferencia del Simple Past (pretérito), el Present Perfect NO especifica CUÁNDO ocurrió la acción. Es perfecto para experiencias de vida, acciones recientes, cambios a lo largo del tiempo, o acciones que comenzaron en el pasado y continúan.',
  'Subject + HAVE/HAS + Past Participle\n\nPara preguntas: HAVE/HAS + Subject + Past Participle?\n\nPara negativos: Subject + HAVE/HAS + NOT + Past Participle',
  'm-001',
  'story-001',
  JSON_ARRAY('past-experience', 'life-events'),
  '2026-03-18T10:00:00Z',
  TRUE,
  TRUE
);

-- ============================================================================
-- GUIDE 2: Phrasal Verbs - Master Edition (🔄)
-- ============================================================================
INSERT INTO guides (
  id, title, description, cover_emoji, cefr_level,
  concept_tags, estimated_minutes, xp_reward,
  progress_status, progress_score, exercises_completed, exercises_total,
  current_streak, max_streak,
  definition, explanation, formula,
  mission_connection, story_connection, scene_concepts,
  created_at, is_published, enable_chat_assistant
) VALUES (
  'guide-002',
  '🔄 Phrasal Verbs - Master Edition',
  'Conviértete en experto en Phrasal Verbs. 10 desafíos, 175 XP esperando.',
  '🔄',
  'B1',
  JSON_ARRAY('phrasal-verbs', 'vocabulary', 'colloquial'),
  30,
  175,
  'not_started',
  0,
  0,
  10,
  0,
  0,
  'Los Phrasal Verbs son combinaciones de un verbo principal + una o más palabras (preposición o adverbio). Juntos crean un significado diferente al del verbo solo.',
  'Los phrasal verbs son muy comunes en inglés hablado y son esenciales para comunicarse naturalmente. El significado no es la suma simple de sus partes. Por ejemplo, ''look'' = mirar, pero ''look after'' = cuidar. Los phrasal verbs pueden ser separables (el objeto va entre el verbo y la partícula) o inseparables (el objeto siempre va después).',
  'Separable: Verb + Particle + Object O Verb + Object + Particle\nEjemplo: ''Put on your coat'' o ''Put your coat on''\n\nInseparable: Verb + Particle + Object\nEjemplo: ''Look after your little sister'' (NOT: Look your sister after)',
  'm-004',
  'story-005',
  JSON_ARRAY('verb-usage', 'daily-conversation'),
  '2026-03-18T11:00:00Z',
  TRUE,
  TRUE
);

-- ============================================================================
-- GUIDE 3: Conditional Sentences - The Challenge (❓)
-- ============================================================================
INSERT INTO guides (
  id, title, description, cover_emoji, cefr_level,
  concept_tags, estimated_minutes, xp_reward,
  progress_status, progress_score, exercises_completed, exercises_total,
  current_streak, max_streak,
  definition, explanation, formula,
  mission_connection, story_connection, scene_concepts,
  created_at, is_published, enable_chat_assistant
) VALUES (
  'guide-003',
  '❓ Conditional Sentences - The Challenge',
  'Domina las condicionales: If, Unless, Unless... 10 ejercicios épicos, 200 XP premium.',
  '❓',
  'B1',
  JSON_ARRAY('conditionals', 'grammar', 'hypothetical'),
  30,
  200,
  'in_progress',
  82,
  8,
  10,
  5,
  8,
  'Las oraciones condicionales (If Clauses) son enunciados que expresan una condición y su resultado. Estructuran situaciones reales, posibles, o imaginarias.',
  'Hay CUATRO tipos principales. Cada tipo expresa diferentes grados de probabilidad: desde situaciones reales hasta situaciones completamente imaginarias. El tipo 0 es para verdades universales, tipo 1 para posible/futuro, tipo 2 para improbable/presente, tipo 3 para imposible/pasado. Esta estructura es fundamental en inglés para negociar, hacer planes, y expresar posibilidades.',
  'Type 0 (Universal): If + Simple Present, Simple Present\nType 1 (Posible): If + Simple Present, will + infinitive\nType 2 (Improbable): If + Simple Past, would + infinitive\nType 3 (Imposible/Pasado): If + Past Perfect, would have + past participle',
  'm-002',
  'story-003',
  JSON_ARRAY('hypothetical', 'probability'),
  '2026-03-18T12:00:00Z',
  TRUE,
  TRUE
);

-- ============================================================================
-- GUIDE 4: Passive Voice - Pro Mode (🧬)
-- ============================================================================
INSERT INTO guides (
  id, title, description, cover_emoji, cefr_level,
  concept_tags, estimated_minutes, xp_reward,
  progress_status, progress_score, exercises_completed, exercises_total,
  current_streak, max_streak,
  definition, explanation, formula,
  created_at, is_published, enable_chat_assistant
) VALUES (
  'guide-004',
  '🧬 Passive Voice - Pro Mode',
  'Conviértete en maestro de la voz pasiva. 5 ejercicios avanzados, 250 XP de oro.',
  '🔄',
  'B1',
  JSON_ARRAY('passive-voice', 'grammar', 'verb-structures'),
  25,
  250,
  'completed',
  100,
  5,
  5,
  0,
  10,
  'La voz pasiva es una estructura gramatical en la que el objeto de la acción se convierte en el sujeto, y el verbo se modifica para reflejar esto.',
  'Comparamos: Active: ''The teacher wrote the book'' vs Passive: ''The book was written by the teacher''. En la pasiva, enfatizamos la ACCIÓN o el RECEPTOR de la acción, no necesariamente quién la hizo. Es muy común en escritura formal, noticias, y reportes científicos.',
  'Sujeto + Verbo TO BE (conjugado) + Past Participle + (by + agente)\n\nEjemplos:\nPresent: The house is painted every year\nPast: The letter was delivered yesterday\nFuture: The project will be completed next month\nPerfect: The work has been done correctly',
  '2026-03-19T10:00:00Z',
  TRUE,
  TRUE
);

-- ============================================================================
-- GUIDE 5: Modals of Deduction - Logic Puzzle (🔍)
-- ============================================================================
INSERT INTO guides (
  id, title, description, cover_emoji, cefr_level,
  concepts, theme, difficulty,
  xp_reward, unlock_level,
  definition, explanation,
  created_at, is_published, enable_chat_assistant
) VALUES (
  'g-005',
  'Modals of Deduction - Logic Puzzle',
  'Deduce probabilities with absolute precision using ''must'', ''might'', and ''can''t''. Solve the mystery protocols.',
  '🔍',
  'B1',
  JSON_ARRAY('Modals of Deduction', 'must/might/can''t', 'Probability'),
  'mystery',
  'Intermediate',
  200,
  3,
  'Los ''Modals of Deduction'' son verbos auxiliares (como must, might, can''t) que usamos para expresar qué tan seguros estamos de que algo es cierto, basándonos en la evidencia disponible.',
  'En la programación y en la vida real, a menudo no tenemos toda la información. Estos verbos de deducción nos permiten articular conclusiones lógicas. ''Must'' significa que estamos casi seguros de algo (como si leyeras los logs de un error). ''Might'' es una posibilidad, y ''Can''t'' se usa cuando algo es lógicamente imposible.',
  '2026-03-18T14:30:00Z',
  TRUE,
  TRUE
);

-- ============================================================================
-- GUIDE 6: Future Forms - Time Traveler (🚀)
-- ============================================================================
INSERT INTO guides (
  id, title, description, cover_emoji, cefr_level,
  concepts, theme, difficulty,
  xp_reward, unlock_level,
  definition, explanation,
  created_at, is_published, enable_chat_assistant
) VALUES (
  'g-006',
  'Future Forms - Time Traveler',
  'Navigate the timelines of tomorrow. Master ''will'', ''going to'', and Present Continuous for future plans.',
  '🚀',
  'A2',
  JSON_ARRAY('Future Forms', 'Will vs Going to', 'Future Plans'),
  'sci-fi',
  'Beginner',
  150,
  2,
  'Los ''Future Forms'' en inglés no son un solo tiempo verbal, sino múltiples estructuras (will, be going to, present continuous) que se usan dependiendo de la intención (predicciones, planes o arreglos).',
  'Elegir el tiempo correcto es crucial para comunicar tus proyecciones. ''Will'' es espontáneo y sin evidencia, ideal para decisiones rápidas en tiempo real. ''Going to'' implica un diseño previo o evidencia visible (como ver nubes negras), y el Present Continuous denota un arreglo cerrado (una reunión de agenda inamovible).',
  '2026-03-18T15:00:00Z',
  TRUE,
  TRUE
);

-- ============================================================================
-- GUIDE 7: Reported Speech - The Informant (🕵️)
-- ============================================================================
INSERT INTO guides (
  id, title, description, cover_emoji, cefr_level,
  concepts, theme, difficulty,
  xp_reward, unlock_level,
  definition, explanation,
  created_at, is_published, enable_chat_assistant
) VALUES (
  'g-007',
  'Reported Speech - The Informant',
  'Intercept and transmit classified communications. Learn to backshift tenses correctly in Reported Speech.',
  '🕵️',
  'B2',
  JSON_ARRAY('Reported Speech', 'Backshifting', 'Indirect Communication'),
  'espionage',
  'Upper Intermediate',
  250,
  4,
  'El ''Reported Speech'' (o Estilo Indirecto) es la estructura que usamos para contarle a otra persona lo que un tercero dijo, sin citar sus palabras exactas con comillas.',
  'Dominarlo es vital, como cuando transfieres el reporte de un cliente a tu equipo de desarrollo o pasas el contexto en una daily. La regla de oro es el ''backshifting'': el tiempo del verbo original suele retroceder un paso hacia el pasado (del Presente al Pasado, del Pasado al Pasado Perfecto) para mantener la concordancia temporal.',
  '2026-03-18T16:00:00Z',
  TRUE,
  TRUE
);

-- ============================================================================
-- GUIDE 8: Relative Clauses - Network Builder (🌐)
-- ============================================================================
INSERT INTO guides (
  id, title, description, cover_emoji, cefr_level,
  concepts, theme, difficulty,
  xp_reward, unlock_level,
  definition, explanation,
  created_at, is_published, enable_chat_assistant
) VALUES (
  'g-008',
  'Relative Clauses - Network Builder',
  'Construct complex sentence networks. Combine data packets using ''who'', ''which'', ''that'', and ''where''.',
  '🌐',
  'B1',
  JSON_ARRAY('Relative Clauses', 'Defining vs Non-Defining', 'Pronouns'),
  'networking',
  'Intermediate',
  200,
  3,
  'Las ''Relative Clauses'' (Cláusulas Relativas) son estructuras secundarias que añaden información sobre un sustantivo anterior sin necesidad de crear una oración completamente nueva.',
  'Permiten construcciones más complejas y naturales. ''Who'' para personas, ''which'' para objetos, ''that'' como alternativa universal, ''where'' para lugares. Hay dos tipos: ''defining'' (esencial para el significado) y ''non-defining'' (información adicional, entre comas).',
  '2026-03-18T17:00:00Z',
  TRUE,
  TRUE
);

-- =============================================================================
-- RESUMEN DE GUÍAS INSERTADAS
-- =============================================================================
-- Total de guías: 8
-- Niveles CEFR cubiertos: A2, B1, B2
-- XP Total disponible: 1,445 XP
-- Temas: Gramática, Vocabulario, Pronunciación, Conversación
-- 
-- Guía 1: Present Perfect (A2) - 150 XP - Grammar
-- Guía 2: Phrasal Verbs (B1) - 175 XP - Vocabulary
-- Guía 3: Conditional Sentences (B1) - 200 XP - Grammar
-- Guía 4: Passive Voice (B1) - 250 XP - Grammar
-- Guía 5: Modals of Deduction (B1) - 200 XP - Grammar
-- Guía 6: Future Forms (A2) - 150 XP - Grammar
-- Guía 7: Reported Speech (B2) - 250 XP - Grammar
-- Guía 8: Relative Clauses (B1) - 200 XP - Grammar
-- =============================================================================

-- NOTA IMPORTANTE: 
-- Los campos JSON deben ser formateados según la base de datos SQL específica:
-- - PostgreSQL: Usar JSON_ARRAY() o '["valor1", "valor2"]'
-- - MySQL: Usar JSON_ARRAY()
-- - SQL Server: Usar N'' para Unicode, JSON_ARRAY()
-- 
-- Ajusta según tu motor de base de datos específico.
