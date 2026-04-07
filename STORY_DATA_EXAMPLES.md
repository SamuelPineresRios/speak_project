# Story Data Structure - Quick Reference with Examples

## 1. Story Object Example

From `frontend/data/db.json`, line 542:

```json
{
  "id": "story-001",
  "title": "El Vuelo Perdido",
  "description": "Perdiste tu vuelo de conexión en un aeropuerto extranjero. Tienes 2 horas para resolver todo antes de que cierren el último vuelo.",
  "cover_emoji": "✈️",
  "cefr_level": "A2",
  "total_scenes": 4,
  "estimated_minutes": 20,
  "created_at": "2026-03-18T10:00:00Z"
}
```

---

## 2. Scene Object Example (Complete with All Dialogue States)

From `frontend/data/db.json`, line 653 (Scene 1-1):

```json
{
  "id": "scene-1-1",
  "story_id": "story-001",
  "order": 1,
  "title": "El Mostrador",
  "narrative_context": "Acabas de aterrizar y corres al mostrador de conexiones. El reloj marca 14:00.",
  "situation": "Estás frente a la agente de aerolínea. Hay una fila larga detrás de ti.",
  "objective": "Pide que te busquen alternativas y menciona tu vuelo final.",
  "character_name": "Sophie",
  "character_role": "Agente de check-in agotada",
  
  "character_opening_dialogue": "Next! Oh... your flight departed 20 minutes ago. I'm sorry, there's nothing I can—",
  
  "character_advance_dialogue": "Okay, okay. Let me check... there IS one seat left on flight 847 to Madrid. But you need to run — gate C12, NOW.",
  
  "character_pause_dialogue": "Sir/Ma'am, I can't help you if I don't understand what you need. Please slow down and tell me clearly.",
  
  "base_duration_seconds": 90,
  "atmosphere": "urgent",
  "background_description": "Busy airport terminal with red flight displays",
  "is_final_scene": false,
  "created_at": "2026-03-18T10:00:00Z",
  "guidance": {
    "key_verbs": ["Miss", "Find", "Help", "Need"],
    "tenses": ["Past Simple (I missed)", "Present Simple (I need)"],
    "example_opening": "Excuse me, I missed my flight...",
    "grammar_tip": "Usa 'I missed' para el pasado."
  }
}
```

---

## 3. TypeScript Interface Definition

From `frontend/lib/db.ts`:

```typescript
export interface Scene {
  id: string                           // "scene-1-1"
  story_id: string                     // "story-001"
  order: number                        // 1, 2, 3...
  title: string                        // "El Mostrador"
  narrative_context: string            // Scenario setup
  situation: string                    // Current state
  objective: string                    // What student must do
  character_name: string               // "Sophie"
  character_role: string               // "Agente de check-in agotada"
  
  // DIALOGUE VARIANTS (the core of branching)
  character_opening_dialogue: string   // Initial prompt when scene starts
  character_advance_dialogue: string   // Shown when judgment = "ADVANCE"
  character_pause_dialogue: string     // Shown when judgment = "PAUSE"
  
  base_duration_seconds: number        // 90
  atmosphere: 'neutral' | 'tense' | 'dark' | 'warm' | 'urgent' | 'mysterious' | 'happy' | 'danger'
  background_description: string       // UI rendering hint
  is_final_scene: boolean              // true = story ends here
  created_at: string                   // ISO timestamp
  
  guidance?: {
    key_verbs: string[]
    tenses: string[]
    example_opening: string
    grammar_tip: string
  }
}
```

---

## 4. Dialogue State Machine

### How the Three Dialogue States Work

```
┌─────────────────────────────────────────────────────────────┐
│                      SCENE STARTS                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────┐
        │ Display:                 │
        │ character_opening_dialogue│ (First interaction only)
        │ "Next! Oh... your flight │
        │  departed 20 minutes ago"│
        └──────────────┬───────────┘
                       │
                       ↓
        ┌──────────────────────────┐
        │ Student types response   │
        │ "I missed my flight"     │
        └──────────────┬───────────┘
                       │
                       ↓
        ┌──────────────────────────────────────────┐
        │ POST /evaluate/story                      │
        │ - Analyzes response                       │
        │ - Checks: comprehensibility >= threshold? │
        │ - Threshold varies by CEFR level          │
        └──────────────┬──────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ↓                             ↓
    ADVANCE                        PAUSE
(comprehensibility >= threshold) (< threshold)
        │                             │
        ↓                             ↓
   ┌─────────────┐            ┌──────────────┐
   │ Display:    │            │ Display:     │
   │ character_  │            │ character_   │
   │ advance_    │            │ pause_       │
   │ dialogue    │            │ dialogue     │
   │ "Okay, let  │            │ "I can't     │
   │  me check.."│            │  help you.." │
   └──────┬──────┘            └──────┬───────┘
          │                          │
          ↓                          ↓
   ┌──────────────┐          ┌──────────────┐
   │ Progress to  │          │ Stay in      │
   │ next scene   │          │ same scene   │
   │ (order + 1)  │          │ (retry)      │
   └──────────────┘          └──────────────┘
          │                          │
          └──────────────┬───────────┘
                         │
                         ↓
              ┌────────────────────┐
              │ Loop or Complete?  │
              │ if is_final_scene: │
              │   → Story DONE     │
              │ else:              │
              │   → Next scene     │
              └────────────────────┘
```

---

## 5. API Endpoint Examples

### GET /api/stories

**Request:**
```bash
GET http://localhost:3000/api/stories
```

**Response:**
```json
[
  {
    "id": "story-001",
    "title": "El Vuelo Perdido",
    "description": "Perdiste tu vuelo de conexión...",
    "cover_emoji": "✈️",
    "cefr_level": "A2",
    "total_scenes": 4,
    "estimated_minutes": 20,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "story-002",
    "title": "La Entrevista",
    "description": "Tienes una entrevista de trabajo...",
    "cover_emoji": "💼",
    "cefr_level": "B1",
    "total_scenes": 4,
    "estimated_minutes": 25,
    "created_at": "2026-03-18T10:00:00Z"
  }
]
```

---

### GET /api/stories/story-001

**Request:**
```bash
GET http://localhost:3000/api/stories/story-001
```

**Response:**
```json
{
  "id": "story-001",
  "title": "El Vuelo Perdido",
  "description": "...",
  "cover_emoji": "✈️",
  "cefr_level": "A2",
  "total_scenes": 4,
  "estimated_minutes": 20,
  "created_at": "2026-03-18T10:00:00Z",
  "scenes": [
    {
      "id": "scene-1-1",
      "story_id": "story-001",
      "order": 1,
      "title": "El Mostrador",
      "character_name": "Sophie",
      "objective": "Pide que te busquen alternativas...",
      "base_duration_seconds": 90,
      "is_final_scene": false,
      // narrative_context and situation are EXCLUDED
    },
    {
      "id": "scene-1-2",
      "story_id": "story-001",
      "order": 2,
      "title": "Seguridad",
      "character_name": "Marcus",
      "objective": "Explica la situación del vuelo perdido...",
      "base_duration_seconds": 90,
      "is_final_scene": false
    },
    {
      "id": "scene-1-3",
      "story_id": "story-001",
      "order": 3,
      "title": "La Cafetería",
      "character_name": "Elena",
      "objective": "Cuéntale qué pasó y pregúntale de dónde es...",
      "base_duration_seconds": 120,
      "is_final_scene": false
    },
    {
      "id": "scene-1-4",
      "story_id": "story-001",
      "order": 4,
      "title": "El Gate",
      "character_name": "James",
      "objective": "Confirma los asientos y pregunta si hay espacio para maleta.",
      "base_duration_seconds": 60,
      "is_final_scene": true
    }
  ]
}
```

---

### GET /api/stories/story-001/progress

**Request:**
```bash
GET http://localhost:3000/api/stories/story-001/progress
```

**Response (if in progress):**
```json
{
  "id": "progress-123",
  "student_id": "ob1wqq71okommwjh5ko",
  "story_id": "story-001",
  "current_scene_id": "scene-1-2",
  "current_scene_order": 2,
  "status": "in_progress",
  "scenes_completed": [1],
  "started_at": "2026-03-20T15:30:00Z",
  "updated_at": "2026-03-20T16:15:00Z",
  "completed_at": null
}
```

**Response (if not started):**
```json
{
  "status": "not_started",
  "scenes_completed": []
}
```

---

### POST /evaluate/story (Evaluation Service)

**Request:**
```json
{
  "response_text": "Excuse me, I missed my flight to Madrid for my connection.",
  "mission_id": "story-001",
  "mission_context": "Perdiste tu vuelo de conexión en un aeropuerto extranjero.",
  "objective": "Pide que te busquen alternativas y menciona tu vuelo final.",
  "student_cefr_level": "A2"
}
```

**Response (ADVANCE judgment):**
```json
{
  "comprehensibility_score": 85,
  "grammar_score": 75,
  "lexical_richness_score": 70,
  "judgment": "ADVANCE",
  "feedback_text": "¡Vuelo reservado! El agente entendió perfectamente: un pasaje a Madrid para el 15 de marzo.\n\n¡Bien! Dijiste 'my flight' — la estructura quedó clarísima. Eso es lo más importante.\n\nPara sonar más natural: 'I missed my connection flight to Madrid.' — el sustantivo 'connection' describe el tipo de vuelo perfectamente.",
  "detected_structures": ["past simple", "possessive adjective"],
  "phrase_correction": {
    "original": "I missed my flight to Madrid for my connection",
    "corrected": "I missed my connection flight to Madrid",
    "explanation": "Reordenamiento para mayor claridad. 'Connection flight' especifica el tipo de vuelo.",
    "is_correct": false
  },
  "recommendations": [
    {
      "type": "vocabulary",
      "original_phrase": "missed my flight",
      "suggestion": "missed my connection",
      "reason": "Más específico en contexto aeroportuario"
    }
  ],
  "retry_suggestions": {
    "sentence_starter": "",
    "key_verbs": []
  }
}
```

**Response (PAUSE judgment):**
```json
{
  "comprehensibility_score": 45,
  "grammar_score": 35,
  "lexical_richness_score": 30,
  "judgment": "PAUSE",
  "feedback_text": "El agente no entendió bien — quedó confundido sobre qué exactamente pasó contigo.\n\nBien que mencionaste 'Madrid' — el agente sabe el destino pretendido.\n\nAhora agrega el verbo principal: 'I missed my flight' (primero la acción principal, luego los detalles). Eso lo hará mucho más claro.",
  "detected_structures": [],
  "phrase_correction": {
    "original": "Madrid flight me",
    "corrected": "I missed my flight to Madrid",
    "explanation": "Orden de palabras en inglés: sujeto (I) + verbo (missed) + objeto (flight) + destino (to Madrid)",
    "is_correct": false
  },
  "recommendations": [
    {
      "type": "grammar",
      "original_phrase": "Madrid flight me",
      "suggestion": "I missed my flight to Madrid",
      "reason": "Orden SVO (Sujeto-Verbo-Objeto) es obligatorio en inglés"
    }
  ],
  "retry_suggestions": {
    "sentence_starter": "Excuse me, I...",
    "key_verbs": ["missed", "need", "flight"]
  }
}
```

---

## 6. Current Stories in Database

| ID | Title | CEFR | Scenes | Minutes | Description |
|----|-------|------|--------|---------|-------------|
| story-001 | El Vuelo Perdido | A2 | 4 | 20 | Missing flight connection |
| story-002 | La Entrevista | B1 | 4 | 25 | Job interview at tech company |
| story-003 | La Ciudad Oscura | B2 | 5 | 30 | Mysterious night in unknown city |
| story-004 | Cita Médica | B1 | 4 | 20 | Medical appointment while traveling |
| story-005 | El Mercado Nocturno | A2 | 4 | 15 | Night market, try exotic food |
| story-006 | Primera Cita | B1 | 4 | 25 | First date at fancy restaurant |
| story-007 | Buscando Piso | A1 | 4 | 20 | Apartment rental viewing |
| story-008 | Misterio en el Expres | C1 | 5 | 35 | Diamond heist on night train |
| story-009 | Festival de Verano | B2 | 4 | 25 | Lost at music festival |

---

## 7. Key Points About Dialogue Storage

✅ **Stored directly in Scene objects** — No separate dialogue table
✅ **Three variants per scene** — opening, advance, pause
✅ **Variants shown based on evaluation score** — Not random
✅ **All dialogue in single db.json** — No external files
✅ **Evaluation service determines flow** — Via judgment call

❌ **NOT stored in missions table** — Missions are different from stories
❌ **NOT split into separate "dialogue" collection** — Embedded in scenes
❌ **NOT fetched from evaluation service** — Service only evaluates, doesn't return dialogue

---

## 8. Integration Points

### Frontend Components That Use Story Data
- `app/(student)/stories/page.tsx` — Story list display
- `components/GuidesList.tsx` — Referenced for similar pattern
- `app/(student)/story/[id]/page.tsx` — Individual story play view (if exists)

### API Routes That Serve Story Data
- [Frontend/app/api/stories/route.ts](frontend/app/api/stories/route.ts) — List all stories
- [Frontend/app/api/stories/[id]/route.ts](frontend/app/api/stories/%5Bid%5D/route.ts) — Get specific story + scenes
- [Frontend/app/api/stories/[id]/progress/route.ts](frontend/app/api/stories/%5Bid%5D/progress/route.ts) — Track progress

### Evaluation Service That Determines Dialogue
- [evaluation_service/main.py](evaluation_service/main.py) — POST /evaluate/story endpoint
- Threshold logic: Judgment="ADVANCE" if comprehensibility >= CEFR threshold
