# Story Mode - Arquitectura Técnica Completa

## Índice
1. [Visión General](#visión-general)
2. [Estructura de Datos](#estructura-de-datos)
3. [Componentes Frontend](#componentes-frontend)
4. [Backend - Rutas API](#backend---rutas-api)
5. [Lógica de Evaluación](#lógica-de-evaluación)
6. [Integración en Sidebar](#integración-en-sidebar)
7. [Contenido Narrativo Inicial](#contenido-narrativo-inicial)
8. [Flujo de Usuario](#flujo-de-usuario)

---

## Visión General

El **Story Mode** es un módulo de práctica narrativa progresiva donde:
- **Estudiantes** avanzan a través de una historia interactiva con múltiples escenas (A1 → B2)
- **Cada escena** presenta un contexto narrativo, un personaje NPC, y una pregunta/prompt
- **Antes de responder**, los estudiantes ven una modal educativa con:
  - Verbos sugeridos (conjugados en tiempos relevantes)
  - Adjetivos y sustantivos contextuales
  - Ejemplos de uso en otros contextos
  - Consejos gramaticales específicos
- **Las respuestas** se validan contextualmente (no solo gramaticalmente)
- **La progresión** es orgánica dentro de la narrativa, escalando complejidad

### Diferencia key con Missions
- **Missions**: Ejercicios puntuales, evaluación de tareas discretas
- **Story Mode**: Experiencia narrativa cohesiva, práctica comunicativa sostenida, progresión de múltiples escenas

---

## Estructura de Datos

### 1. Story (Tabla/Documento)
```typescript
interface Story {
  id: string
  title: string
  description: string
  cover_emoji: string
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2'              // Nivel INICIAL de la historia
  total_scenes: number
  estimated_minutes: number
  backdrop_url?: string
  characters: Array<{
    name: string
    role: string
    personality_traits: string[]
    background: string
  }>
  narrative_theme: string                             // e.g., "viaje a una ciudad desconocida"
  learning_objectives: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### 2. Scene (Tabla/Documento)
```typescript
interface Scene {
  id: string
  story_id: string
  order: number                                       // 1, 2, 3, ...
  title: string
  
  // CONTEXTO NARRATIVO
  narrative_context: string                           // "Estás en una estación de tren en Madrid..."
  situation: string                                   // "Un turista te pide información"
  objective: string                                   // "Ayudar al turista y responder sus preguntas"
  
  // PERSONAJE NPC
  character_name: string
  character_role: string                              // "Turista confundido"
  character_personality: string[]                     // ["nervioso", "educado", "impaciente"]
  character_opening_dialogue: string                  // "¡Hola! ¿Me puedes ayudar? Estoy buscando..."
  
  // PROGRESIÓN DE DIFICULTAD
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2'              // Nivel esperado para esta escena
  
  // CRITERIOS DE EVALUACIÓN
  evaluation_criteria: {
    vocabulary_complexity: 'basic' | 'intermediate' | 'advanced'
    grammar_structures: string[]                      // ["presente simple", "pretérito indefinido"]
    naturalness_factor: number                        // 0.5-1.0 (qué tan natural debe sonar)
    context_relevance: 'strict' | 'moderate' | 'flexible'
    min_tokens: number                                // Mínimo número de palabras esperadas
  }
  
  // ORIENTACIÓN EDUCATIVA (Pre-Response Modal)
  guidance: {
    key_verbs: Array<{
      base_form: string
      translations: { en: string; pt?: string }
      tenses: {
        present: string                               // yo hablo
        preterite: string                              // yo hablé
        imperfect: string                              // yo hablaba
        future: string                                 // yo hablaré
        conditional: string                            // yo hablaría
      }
      examples_in_context: string[]                   // Ejemplos de uso en la escena
      examples_in_other_contexts: string[]            // Ejemplos en otros contextos
    }>
    key_adjectives: Array<{
      word: string
      meaning: string
      example_in_scene: string
      example_other_context: string
    }>
    key_nouns: Array<{
      word: string
      meaning: string
      article: string
      example_in_scene: string
    }>
    grammar_tips: {
      focus_structure: string                         // "Uso del pretérito indefinido"
      explanation: string
      examples: string[]
      common_mistakes: string[]
    }
    sentence_starters: string[]                       // "Yo creo que...", "Lo siento, pero..."
    register_notes: string                            // "Use formal 'usted' with tourists"
  }
  
  // RESPUESTAS ESPERADAS
  expected_responses: {
    high_quality: string[]                           // Respuestas excelentes (modelo)
    acceptable: string[]                              // Respuestas aceptables
    common_mistakes: Array<{
      pattern: string
      correction: string
      explanation: string
    }>
  }
  
  // REACCIONES DEL PERSONAJE
  character_reactions: {
    advance: string                                  // Si respuesta es excelente
    pause: string                                    // Si respuesta necesita mejora
    confusion: string                                 // Si respuesta es off-topic
  }
  
  // METADATOS
  base_duration_seconds: number
  atmosphere: 'neutral' | 'tense' | 'dark' | 'warm' | 'urgent' | 'mysterious' | 'happy' | 'danger'
  background_description: string
  is_final_scene: boolean
  created_at: string
}
```

### 3. StoryProgress (Tabla/Documento)
```typescript
interface StoryProgress {
  id: string
  student_id: string
  story_id: string
  
  current_scene_id: string
  current_scene_order: number
  
  status: 'not_started' | 'in_progress' | 'completed'
  scenes_completed: number[]
  
  // Estadísticas
  total_attempts: number
  successful_attempts: number
  average_quality_score: number
  
  // Timeline
  started_at: string
  completed_at: string | null
  last_accessed_at: string
  updated_at: string
}
```

### 4. Scene Response (para almacenar respuestas en story mode)
```typescript
interface SceneResponse {
  id: string
  student_id: string
  scene_id: string
  story_id: string
  
  attempt_number: number
  user_text: string
  
  evaluation: {
    is_approved: boolean                              // true = continuar, false = reintentar
    quality_score: number                             // 1-5
    context_relevance: number                         // 1-5
    grammar_score: number                             // 1-5
    vocabulary_score: number                          // 1-5
    naturalness_score: number                         // 1-5
    
    feedback: {
      positive_aspects: string[]
      areas_to_improve: string[]
      specific_corrections: Array<{
        original: string
        corrected: string
        reason: string
        alternative_options: string[]
      }>
      nativelike_suggestions: Array<{
        current_phrase: string
        native_alternative: string
        explanation: string
      }>
    }
    
    context_validation: {
      is_contextually_appropriate: boolean
      relevance_explanation: string
    }
  }
  
  submitted_at: string
  evaluated_at: string
}
```

---

## Componentes Frontend

### 1. StoryModeEntry (Lista de historias disponibles)
**Archivo**: `frontend/app/(student)/story/page.tsx`
- Muestra tarjetas de historias disponibles
- Información: título, emoji, nivel CEFR, progreso (si en_progreso)
- Botones: "Iniciar", "Continuar", "Ver Resultados"

### 2. StorySceneView (Experiencia principal)
**Archivo**: `frontend/components/StorySceneView.tsx`

Estructura:
```
┌─ Header ────────────────────────────────┐
│ Story Title | Scene X of Y | Timer      │
├─────────────────────────────────────────┤
│                                         │
│ [Background + Narrative Context]        │
│ "Estás en una estación de tren..."      │
│                                         │
│ ┌─ Character Display ──────────────┐   │
│ │ [Avatar] NPC Name                │   │
│ │ "¡Hola! ¿Me puedes ayudar?       │   │
│ │  Estoy buscando la estación de..." │   │
│ └──────────────────────────────────┘   │
│                                         │
│ [User Response Input Area]              │
│ "Escribe tu respuesta..."               │
│                                         │
│ ┌─ Action Buttons ─────────────────┐   │
│ │ [💡 Ver Ayuda] [🎙️ Voz] [📤 Enviar] │
│ └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 3. PreResponseGuidanceModal (Modal de preparación)
**Archivo**: `frontend/components/PreResponseGuidanceModal.tsx`

Tabs:
- **Verbos Clave** (acordeón expandible)
  - Verbo base, conjugaciones en tiempos relevantes
  - Ejemplos en contexto + otros contextos
- **Vocabulario** (adjetivos y sustantivos)
  - Palabra, significado, ejemplo en escena
- **Consejos Gramaticales**
  - Estructura enfocada, explicación, ejemplos
  - Errores comunes a evitar
- **Frases de Apertura**
  - Formas naturales de comenzar

### 4. EvaluationFeedbackModal (Retroalimentación post-respuesta)
**Archivo**: `frontend/components/EvaluationFeedbackModal.tsx`

Muestra:
- ✅ Aspectos positivos (si hay)
- ⚠️ Áreas a mejorar
- 🔧 Correcciones específicas (original → corregido + razón)
- 🌟 Sugerencias de naturalidad ("Más nativo sonaría...")
- Validación contextual

Botones:
- [Reintentar] si no aprobado
- [Continuar] si aprobado

---

## Backend - Rutas API

### 1. POST `/api/story/start`
Inicia una nueva historia o reanuda una existente

**Solicitud:**
```json
{
  "student_id": "string",
  "story_id": "string",
  "action": "new" | "resume"
}
```

**Respuesta:**
```json
{
  "success": true,
  "progress": StoryProgress,
  "current_scene": Scene,
  "message": "string"
}
```

### 2. POST `/api/story/guidance`
Obtiene la modal de orientación pre-respuesta

**Solicitud:**
```json
{
  "scene_id": "string",
  "student_level": "A1" | "A2" | "B1" | "B2",
  "last_npc_message": "string"
}
```

**Respuesta:**
```json
{
  "key_verbs": [ /* Array de verbos con conjugaciones */ ],
  "key_adjectives": [ /* Array de adjetivos */ ],
  "key_nouns": [ /* Array de sustantivos */ ],
  "grammar_tips": { /* Consejo gramatical */ },
  "sentence_starters": ["string", "string"],
  "register_notes": "string"
}
```

### 3. POST `/api/story/evaluate`
Valida la respuesta del estudiante

**Solicitud:**
```json
{
  "student_id": "string",
  "scene_id": "string",
  "story_id": "string",
  "user_response": "string",
  "student_level": "A1" | "A2" | "B1" | "B2",
  "attempt_number": number
}
```

**Respuesta:**
```json
{
  "is_approved": boolean,
  "quality_score": number,
  "context_relevance": number,
  "grammar_score": number,
  "vocabulary_score": number,
  "naturalness_score": number,
  "feedback": {
    "positive_aspects": ["string"],
    "areas_to_improve": ["string"],
    "specific_corrections": [
      {
        "original": "string",
        "corrected": "string",
        "reason": "string",
        "alternative_options": ["string"]
      }
    ],
    "nativelike_suggestions": [
      {
        "current_phrase": "string",
        "native_alternative": "string",
        "explanation": "string"
      }
    ]
  },
  "context_validation": {
    "is_contextually_appropriate": boolean,
    "relevance_explanation": "string"
  },
  "character_reaction": "string",
  "npc_next_message": "string"
}
```

### 4. POST `/api/story/progress`
Actualiza progreso y continúa a siguiente escena

**Solicitud:**
```json
{
  "student_id": "string",
  "story_id": "string",
  "current_scene_id": "string",
  "response_id": "string",
  "quality_score": number
}
```

**Respuesta:**
```json
{
  "progress_updated": true,
  "next_scene": Scene | null,
  "story_completed": boolean,
  "completion_stats": {
    "scenes_completed": number,
    "average_quality": number,
    "total_attempts": number
  }
}
```

### 5. GET `/api/story/progress/:student_id/:story_id`
Obtiene progreso actual del estudiante en una historia

---

## Lógica de Evaluación

### Evaluador Contextual (Node.js / Python)
**Ubicación**: `frontend/app/api/story/evaluate.ts` o `evaluation_service/story_evaluator.py`

```typescript
// Pseudocódigo
async evaluateStoryResponse(
  userResponse: string,
  scene: Scene,
  studentLevel: string,
  attemptNumber: number
) {
  // 1. ANÁLISIS DE CONTEXTO
  const contextRelevance = await analyzeContextRelevance(
    userResponse,
    scene.situation,
    scene.objective
  )
  // Valida si la respuesta tiene sentido en el contexto narrativo
  
  // 2. ANÁLISIS GRAMATICAL
  const grammarScore = analyzeGrammar(
    userResponse,
    scene.evaluation_criteria.grammar_structures
  )
  // Verifica estructuras esperadas para el nivel
  
  // 3. ANÁLISIS LÉXICO
  const vocabularyScore = analyzeVocabulary(
    userResponse,
    scene.guidance.key_verbs,
    scene.guidance.key_adjectives,
    scene.evaluation_criteria.vocabulary_complexity
  )
  
  // 4. NATURALIDAD
  const naturalnessScore = analyzeNaturalness(
    userResponse,
    studentLevel,
    scene.character_personality
  )
  
  // 5. CRITERIOS DE APROBACIÓN
  const isApproved = (
    contextRelevance > 0.7 &&
    grammarScore >= 3.5 &&
    vocabularyScore >= 3.0 &&
    naturalnessScore >= 3.0 &&
    userResponse.split(' ').length >= scene.evaluation_criteria.min_tokens
  )
  
  // 6. RETROALIMENTACIÓN ESPECÍFICA
  const feedback = generateContextualFeedback(
    userResponse,
    scene,
    studentLevel,
    isApproved
  )
  
  return {
    is_approved: isApproved,
    quality_score: (grammarScore + vocabularyScore + naturalnessScore) / 3,
    context_relevance: contextRelevance,
    grammar_score: grammarScore,
    vocabulary_score: vocabularyScore,
    naturalness_score: naturalnessScore,
    feedback,
    context_validation: { /* ... */ }
  }
}
```

### Criterios por Nivel CEFR

#### A1 (Elemental)
- **Vocabulario**: Palabras simples, sustantivos y verbos básicos
- **Gramática**: Presente simple, verbos simples
- **Estructura**: Frases cortas (3-7 palabras)
- **Contexto**: Muy flexible, solo verificar que responde a la pregunta
- **Naturalidad**: No crítica, solo claridad

#### A2 (Elemental Superior)
- **Vocabulario**: Palabras comunes, adjetivos básicos
- **Gramática**: Presente simple, pasado simple (pretérito)
- **Estructura**: Oraciones simples (5-12 palabras)
- **Contexto**: Moderadamente flexible
- **Naturalidad**: Básica (coherencia con contexto)

#### B1 (Intermedio)
- **Vocabulario**: Variado, expresiones comunes, algunos verbos frasales
- **Gramática**: Presente, pasado, futuro; conectores simples
- **Estructura**: Oraciones complejas (8-15 palabras)
- **Contexto**: Estricto, must be relevant
- **Naturalidad**: Moderada (fluidez básica esperada)

#### B2 (Intermedio Alto)
- **Vocabulario**: Sofisticado, expresiones idiomáticas, registro variado
- **Gramática**: Todos los tiempos, subjuntivo, construcciones complejas
- **Estructura**: Párrafos coherentes (15+ palabras)
- **Contexto**: Muy estricto, excelente relevancia
- **Naturalidad**: Alta (debería sonar como nativo educado)

---

## Integración en Sidebar

### Modificación: StudentSidebar.tsx

Cambio de links array:

```typescript
const links = [
  { href: '/missions', label: 'MISIONES', icon: Radio },
  { href: '/guides', label: 'GUÍAS DE APRENDIZAJE', icon: Lightbulb },
  { href: '/story', label: 'STORY MODE', icon: BookOpen },  // ← NUEVO
  { href: '/groups', label: 'GRUPOS', icon: Users },
  { href: '/profile', label: 'PERFIL', icon: User },
]
```

O si prefieres una sección anterior (más importante):
```typescript
const links = [
  { href: '/story', label: 'STORY MODE', icon: BookOpen },  // ← PRIMERO
  { href: '/missions', label: 'MISIONES', icon: Radio },
  { href: '/guides', label: 'GUÍAS DE APRENDIZAJE', icon: Lightbulb },
  { href: '/groups', label: 'GRUPOS', icon: Users },
  { href: '/profile', label: 'PERFIL', icon: User },
]
```

---

## Contenido Narrativo Inicial

### Story 1: "Crisis en la Estación"
**Metadata:**
- Nivel inicial: A1
- Nivel final: B2
- Escenas: 5
- Temas: Viaje, orientación, comunicación de emergencia

#### Escena 1 (A1 - Elemental)
**Título**: "Un encuentro fortuito"

**Contexto**: Estás en la estación de tren Santa Justa en Sevilla. Un turista extranjero ve lost, mira el mapa confundido y te ve. Te pide ayuda.

**Personaje**: María, turista estadounidense, 30 años, viajera experimentada pero no habla español bien

**Diálogo del NPC**: 
> "¡Perdona! ¿Tú hablas inglés? No, wait... ¿Español? Sí, okay, um... ¿De dónde es el tren que va a Madrid? Estoy buscando el andén correcto. I'm in a hurry!"

**Objetivo**: Saludarla y preguntarle a dónde va

**Opciones de Respuesta Correcta** (A1):
- "Hola. ¿Dónde quieres ir?"
- "Hola, me llamo [X]. ¿Adónde vas?"
- "Hola. ¿A qué estación viajas?"

**Verbos Clave** (en modal pre-respuesta):
- **Ir**: voy, vas, va (presente) | fui, fuiste, fue (pasado)
  - Contexto: "Yo voy a Madrid"
  - Otro: "Yo voy al trabajo cada día"
- **Viajar**: viajo, viajas, viaja
  - Contexto: "Ella viaja a Barcelona"
  - Otro: "Viajo en tren los viernes"
- **Buscar**: busco, buscas, busca
  - Contexto: "Buscas el andén 5"
  - Otro: "Busco mis llaves"

**Adjetivos Clave**:
- Correcto/Correcta ("¿El andén correcto?")
- Perdido/Perdida ("He perdido el andén")
- Rápido/Rápida ("Tengo prisa")

**Consejo Gramatical**: 
"En A1, usa el presente simple: SUJETO + VERBO (yo + voy). No necesitas explicar todo. 'Voy a Madrid' es suficiente."

---

#### Escena 2 (A1-A2 - Transición)
**Título**: "Información sobre el viaje"

**NPC siguiente**: María pregunta más detalles:
> "¿Y tú vas a Madrid también? ¿Con familia? ¿Cuánto tiempo?"

**Objetivo**: Responder preguntas simples sobre tu situación/viaje

**Verbos Clave**:
- Viajar
- Estar (en lugar)
- Tener (familia, tiempo)
- Acompañar

---

#### Escena 3 (A2 - Intermedio)
**Título**: "Explicar la situación"

**Context drift**: María está confundida sobre horarios:
> "¿A qué hora sale el tren? Tengo el boleto aquí... dice '16:45'. ¿Es correcto? ¿Cuánto tiempo tarda a Madrid?"

**Objetivo**: Ayudarla con información de horarios (usando palabras claves: "hora", "tarde", "minutos", "sale")

**Verbos Clave Nuevos**:
- Salir (presente/futuro)
- Durar
- Tardar

---

(Continuar con escenas 4 y 5, escalando a B1-B2 con situaciones más complejas)

---

## Flujo de Usuario

### Flujo Principal: Story Mode

```
1. INGRESO
   └─→ StudentSidebar: click "STORY MODE"
   └─→ Navigate to /story

2. LISTA DE HISTORIAS
   └─→ Página `/story/page.tsx` muestra:
       - "Crisis en la Estación" (En Progreso: 3/5 escenas)
       - "Mercado Digital" (No iniciado)
       - "Reunión de Negocios" (Completado ✓)

3. SELECCIONAR HISTORIA
   └─→ Click "Continuar"
   └─→ Fetch story progress + current scene

4. SCENE VIEW (Experiencia Principal)
   ├─→ Muestra contexto narrativo + NPC diálogo
   ├─→ Input: "Escribe tu respuesta"
   └─→ Botones:
       - 💡 "Ver Ayuda" → abre PreResponseGuidanceModal
       - 🎙️ "Hablar" → speech-to-text
       - 📤 "Enviar" → submit

5. PRE-RESPONSE MODAL (Si click "Ver Ayuda")
   ├─→ Tabs: Verbos | Vocabulario | Gramática | Frases
   ├─→ Muestra: Conjugaciones, ejemplos, contextos
   └─→ Cierra modal, vuelve a escena

6. SUBMIT RESPUESTA
   ├─→ POST /api/story/evaluate
   ├─→ Backend: Validación contextual + gramatical
   └─→ Retorna evaluación

7. FEEDBACK MODAL
   ├─→ Si APROBADO ✅
   │   ├─→ Muestra aspectos positivos
   │   ├─→ Reacción del NPC (alegría/satisfacción)
   │   └─→ Botón [Continuar Siguiente Escena]
   │
   └─→ Si NO APROBADO ❌
       ├─→ Muestra áreas a mejorar, correcciones
       ├─→ Reacción del NPC (confusión/pedir aclaración)
       └─→ Botón [Reintentar Misma Escena]

8. PROGRESIÓN
   └─→ Después de aprobación:
       POST /api/story/progress
       ↓
       ├─→ Actualiza StoryProgress
       ├─→ Carga siguiente escena
       ├─→ Si última escena: Muestra resultados finales

9. COMPLETION SCREEN
   ├─→ "¡Felicitaciones! Completaste: Crisis en la Estación"
   ├─→ Estadísticas:
   │   - Escenas completadas: 5/5
   │   - Calidad promedio: 4.2/5
   │   - Intentos totales: 7
   │   - Tiempo total: 23 minutos
   ├─→ Certificate/Badge?
   └─→ Botones: [Volver Historias] [Compartir]
```

---

## Notas de Implementación

### Prioridad Fase 1
1. Estructura de datos (db.json + tipos)
2. Componente StorySceneView básico
3. PreResponseGuidanceModal
4. Ruta `/api/story/evaluate` simple
5. Integración sidebar

### Prioridad Fase 2
1. Lógica de evaluación avanzada
2. Validación contextual mejorada
3. Persistencia perfeccionada
4. Analytics / Estadísticas

### Consideraciones Técnicas
- **Almacenamiento**: Usar db.json para MVP; migrar a DB real después
- **Evaluación**: OpenRouter API (Gemini) con prompts específicos para validación contextual
- **Modal**: Usar componente Accordion/Tabs existente (lucide-react)
- **Voz**: Opcional en MVP; integrar Web Speech API después

---

## Archivos a Crear/Modificar

### Crear:
- `frontend/app/(student)/story/page.tsx` - Lista de historias
- `frontend/app/(student)/story/[storyId]/page.tsx` - Experience principal
- `frontend/components/StorySceneView.tsx` - Vista de escena
- `frontend/components/PreResponseGuidanceModal.tsx` - Modal pre-respuesta
- `frontend/components/EvaluationFeedbackModal.tsx` - Retroalimentación
- `frontend/app/api/story/evaluate.ts` - Lógica de evaluación
- `frontend/app/api/story/guidance.ts` - Generador de modal
- `frontend/data/stories.json` - Contenido narrativo
- `frontend/lib/story-evaluator.ts` - Utilidades de evaluación

### Modificar:
- `frontend/lib/types.ts` - Agregar tipos Story, Scene, StoryProgress, SceneResponse
- `frontend/components/StudentSidebar.tsx` - Agregar link "Story Mode"
- `frontend/data/db.json` - Agregar secciones de stories y storyProgress

