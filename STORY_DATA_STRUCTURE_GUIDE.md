# SPEAK Story Data Structure & Dialogue System

## Overview
Stories in SPEAK are structured as **narrative containers** with multiple **scenes**, where each scene contains detailed **dialogue states** for different interaction outcomes. The system uses a state-based dialogue model where character responses vary based on student performance.

---

## 1. Story Data Structure

### Story Entity
Located in: `frontend/data/db.json` → `stories` array

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

**Story Fields:**
- `id`: Unique identifier (pattern: `story-XXX`)
- `title`: Display name of the story
- `description`: Context/premise of the narrative
- `cover_emoji`: Visual identifier
- `cefr_level`: Language proficiency level (A1, A2, B1, B2)
- `total_scenes`: Total number of scenes in this story
- `estimated_minutes`: Estimated time to complete
- `created_at`: Timestamp

**CEFR Levels Currently in Database:**
- A1: "Buscando Piso" (Story-007)
- A2: "El Vuelo Perdido" (Story-001), "El Mercado Nocturno" (Story-005)
- B1: "La Entrevista" (Story-002), "Cita Médica" (Story-004), "Primera Cita" (Story-006)
- B2: "La Ciudad Oscura" (Story-003), "Festival de Verano" (Story-009)
- C1: "Misterio en el Expreso" (Story-008)

---

## 2. Scene Data Structure (Dialogue Container)

Located in: `frontend/data/db.json` → `scenes` array

Each story contains multiple **scenes**, each with complete dialogue branching based on student performance.

### Scene Entity
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

**Scene Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique scene identifier (pattern: `scene-{story#}-{scene#}`) |
| `story_id` | string | Parent story reference |
| `order` | number | Position in story sequence (1, 2, 3, ...) |
| `title` | string | Scene name |
| `narrative_context` | string | Setup/scenario description |
| `situation` | string | Current state when scene starts |
| `objective` | string | What student must accomplish |
| `character_name` | string | NPC/character name |
| `character_role` | string | Character description |
| **Dialogue Variants** | | (See next section) |
| `base_duration_seconds` | number | Expected interaction time |
| `atmosphere` | string | Mood/tone (urgent, warm, tense, happy, etc.) |
| `background_description` | string | Visual context for UI rendering |
| `is_final_scene` | boolean | Whether this concludes the story |
| `guidance` | object | Educational hints (key_verbs, tenses, examples) |

---

## 3. Dialogue Branching System

**KEY CONCEPT:** Each scene has **THREE dialogue states** that trigger based on student performance:

### Three-State Dialogue Model

```
Student Response
        ↓
   Evaluation Service
        ↓
   ┌───────────────────────┐
   ├─ ADVANCE              ├─ character_advance_dialogue
   ├─ PAUSE (confused)     ├─ character_pause_dialogue
   └─ OPENING (first turn) ├─ character_opening_dialogue
       (initial prompt)    │
```

### Dialogue Fields in Scene

1. **`character_opening_dialogue`** (string)
   - Initial prompt when scene starts
   - Sets up the scenario
   - **Triggered:** First interaction of the scene
   - Example: `"Next! Oh... your flight departed 20 minutes ago. I'm sorry, there's nothing I can—"`

2. **`character_advance_dialogue`** (string)
   - Positive/supportive response
   - Story progresses to next scene
   - **Triggered:** When evaluation judgment = **"ADVANCE"**
   - Example: `"Okay, okay. Let me check... there IS one seat left on flight 847 to Madrid. But you need to run — gate C12, NOW."`

3. **`character_pause_dialogue`** (string)
   - Confused/stalled response
   - Prompts student to try again
   - **Triggered:** When evaluation judgment = **"PAUSE"**
   - Example: `"Sir/Ma'am, I can't help you if I don't understand what you need. Please slow down and tell me clearly."`

---

## 4. Database Schema (TypeScript Interfaces)

From `frontend/lib/db.ts`:

```typescript
export interface Story {
  id: string
  title: string
  description: string
  cover_emoji: string
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2'
  total_scenes: number
  estimated_minutes: number
  created_at: string
}

export interface Scene {
  id: string
  story_id: string
  order: number
  title: string
  narrative_context: string
  situation: string
  objective: string
  character_name: string
  character_role: string
  character_opening_dialogue: string
  character_advance_dialogue: string
  character_pause_dialogue: string
  base_duration_seconds: number
  atmosphere: 'neutral' | 'tense' | 'dark' | 'warm' | 'urgent' | 'mysterious' | 'happy' | 'danger'
  background_description: string
  is_final_scene: boolean
  created_at: string
  guidance?: {
    key_verbs: string[]
    tenses: string[]
    example_opening: string
    grammar_tip: string
  }
}

export interface StoryProgress {
  id: string
  student_id: string
  story_id: string
  current_scene_id: string
  current_scene_order: number
  status: 'not_started' | 'in_progress' | 'completed'
  scenes_completed: number[]
  started_at: string
  completed_at: string | null
  updated_at: string
}
```

---

## 5. API Endpoints for Fetching Story Content

### Endpoint: GET `/api/stories`
**Purpose:** Fetch all available stories

**Response:**
```json
[
  {
    "id": "story-001",
    "title": "El Vuelo Perdido",
    "description": "...",
    "cover_emoji": "✈️",
    "cefr_level": "A2",
    "total_scenes": 4,
    "estimated_minutes": 20,
    "created_at": "2026-03-18T10:00:00Z"
  },
  ...
]
```

**Location:** `frontend/app/api/stories/route.ts`

```typescript
export async function GET() {
  const db = readDB()
  const stories = db.stories || []
  return NextResponse.json(stories)
}
```

---

### Endpoint: GET `/api/stories/:id`
**Purpose:** Fetch a specific story with its scenes

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
      "order": 1,
      "title": "El Mostrador",
      "character_name": "Sophie",
      "objective": "Pide que te busquen alternativas y menciona tu vuelo final.",
      "base_duration_seconds": 90,
      "is_final_scene": false
      // Note: narrative_context, situation, and full dialogues are excluded from this response
    },
    ...
  ]
}
```

**Location:** `frontend/app/api/stories/[id]/route.ts`

```typescript
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = readDB()
  const story = db.stories.find(s => s.id === params.id)
  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }
  const scenes = db.scenes.filter(s => s.story_id === story.id)
  return NextResponse.json({ 
    ...story, 
    scenes: scenes.map(s => ({
      ...s, 
      narrative_context: undefined,  // Excluded
      situation: undefined            // Excluded
    }))
  })
}
```

**Note:** The API intentionally excludes full narrative context and dialogue details from this endpoint to force clients to fetch scene details separately.

---

### Endpoint: GET `/api/stories/:id/progress`
**Purpose:** Fetch user's progress through a story

**Response:**
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
  "updated_at": "2026-03-20T16:15:00Z"
}
```

If no progress exists:
```json
{
  "status": "not_started",
  "scenes_completed": []
}
```

**Location:** `frontend/app/api/stories/[id]/progress/route.ts`

```typescript
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const studentId = 'current-user-id'  // Mock
  const db = readDB()
  const progress = db.story_progress.find(p => 
    p.story_id === params.id && p.student_id === studentId
  )
  return NextResponse.json(progress || { status: 'not_started', scenes_completed: [] })
}
```

---

## 6. Evaluation Service Endpoints

### Endpoint: POST `/evaluate/story`
**Purpose:** Evaluate student response and get dialogue/feedback

**Backend:** `evaluation_service/main.py`

**Request:**
```json
{
  "response_text": "Excuse me, I missed my flight to Madrid...",
  "mission_id": "story-001",
  "mission_context": "Perdiste tu vuelo de conexión...",
  "objective": "Pide que te busquen alternativas y menciona tu vuelo final",
  "student_cefr_level": "A2"
}
```

**Response:**
```json
{
  "comprehensibility_score": 85,
  "grammar_score": 75,
  "lexical_richness_score": 70,
  "judgment": "ADVANCE",
  "feedback_text": "¡Vuelo reservado! El agente entendió...\n\n¡Bien! Dijiste 'March 15'...\n\nPara sonar más natural...",
  "detected_structures": ["past simple", "imperative"],
  "phrase_correction": {
    "original": "Excuse me, I missed my flight to Madrid",
    "corrected": "Excuse me, I missed my flight to Madrid",
    "explanation": "Perfecto — no hay correcciones necesarias",
    "is_correct": true
  },
  "recommendations": [
    {
      "type": "naturalness",
      "original_phrase": "I missed my flight",
      "suggestion": "I've missed my connection",
      "reason": "Más natural en contexto de conexiones de vuelo"
    }
  ],
  "retry_suggestions": {
    "sentence_starter": "",
    "key_verbs": []
  }
}
```

**Backend Logic:**
1. Takes student response
2. Runs Claude evaluation against scene objective
3. Determines `judgment` ("ADVANCE" or "PAUSE")
4. Evaluation scores drive which dialogue to show:
   - ADVANCE threshold by CEFR: A1≥60, A2≥70, B1≥80, B2≥85
   - Above threshold → `character_advance_dialogue`
   - Below threshold → `character_pause_dialogue`

---

## 7. Dialogue Fetching Flow

### Client-Side Flow

```
1. Student views story list
   ↓ GET /api/stories
   ← Receive story summaries (no detailed dialogue)

2. Student selects a story
   ↓ GET /api/stories/:id
   ← Receive story + scene list (no full dialogue)

3. Student starts scene
   ↓ GET /api/stories/:id/progress (optional)
   ← Determine if at scene start or mid-scene

4. Frontend renders scene with:
   - narrative_context (fetched from local state or db)
   - situation (fetched from local state or db)
   - character_opening_dialogue (from scene data)
   
5. Student submits response
   ↓ POST /evaluate/story (to evaluation_service)
   ← Receive judgment + feedback

6. Based on judgment:
   - If "ADVANCE": Show character_advance_dialogue + move to next scene
   - If "PAUSE": Show character_pause_dialogue + stay in scene

7. Repeat from step 5
```

---

## 8. Data Storage Location

| Data Type | Location |
|-----------|----------|
| Story definitions | `frontend/data/db.json` → `stories[]` |
| Scene definitions (with dialogue) | `frontend/data/db.json` → `scenes[]` |
| Student story progress | `frontend/data/db.json` → `story_progress[]` |
| Scene seed data | `frontend/data/seed_missions.json` (if initialized) |

**Note:** The evaluation service (`evaluation_service/`) does NOT store story data—it only reads `mission_context` and `objective` from requests to inform its evaluation prompts.

---

## 9. Example: Complete Story Flow

### Story: "El Vuelo Perdido" (Story-001)

**Scenes:** 4 total
1. **Scene 1-1 (El Mostrador)** - Check-in counter
   - Character: Sophie (check-in agent)
   - Objective: Ask for alternatives, mention final destination

2. **Scene 1-2 (Seguridad)** - Security checkpoint
   - Character: Marcus (security officer)
   - Objective: Explain situation, show new ticket

3. **Scene 1-3 (La Cafetería)** - Airport café
   - Character: Elena (Colombian traveler)
   - Objective: Tell what happened, ask where she's from

4. **Scene 1-4 (El Gate)** - Departure gate
   - Character: James (gate agent)
   - Objective: Confirm seats, ask about baggage space
   - **is_final_scene: true**

### Interaction Example

**Step 1:** Student reads:
```
NARRATOR: Acabas de aterrizar y corres al mostrador de conexiones.
SOPHIE: "Next! Oh... your flight departed 20 minutes ago. I'm sorry, 
         there's nothing I can—"
[Student types response]
```

**Step 2:** POST evaluation with response: "I miss my flight to Madrid!"
- Evaluation returns: `judgment: "PAUSE"` (comprehensibility < 70)

**Step 3:** Character shows pause dialogue:
```
SOPHIE: "Sir/Ma'am, I can't help you if I don't understand what you 
         need. Please slow down and tell me clearly."
[Student tries again]
```

**Step 4:** Student resubmits: "Excuse me, I missed my flight to Madrid."
- Evaluation returns: `judgment: "ADVANCE"` (comprehensibility ≥ 70)

**Step 5:** Character shows advance dialogue:
```
SOPHIE: "Okay, okay. Let me check... there IS one seat left on flight 847 
         to Madrid. But you need to run — gate C12, NOW."
[SCENE COMPLETE - Advance to Scene 1-2]
```

---

## 10. Summary Table

| Concept | Storage | Fetching | Purpose |
|---------|---------|----------|---------|
| **Story Metadata** | db.json `stories[]` | GET /api/stories | Browse available narrative challenges |
| **Scene Details + Dialogue** | db.json `scenes[]` | Implicit (embedded) | Full narrative with branching dialogue |
| **Dialogue Variants** | `Scene.character_*_dialogue` fields | Selected by evaluation | Dynamic conversation flow |
| **Student Progress** | db.json `story_progress[]` | GET /api/stories/:id/progress | Track where student is in story |
| **Evaluation** | evaluation_service | POST /evaluate/story | Determines which dialogue to show next |

---

## Notes

- **Dialogue is not fetched separately**—it's embedded in Scene objects in the database
- **Evaluation service determines which dialogue to display** based on student performance
- **Three-state model** (opening, advance, pause) handles all narrative branches
- **No external dialogue storage**—everything is in the single `scenes[]` array
- **Guidance field** provides educators/tutor prompts for grammar instruction during scenes
