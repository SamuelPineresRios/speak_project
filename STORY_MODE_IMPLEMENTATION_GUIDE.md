# Story Mode - Guía de Implementación MVP

## Resumen Ejecutivo

Este documento proporciona pasos concretos para implementar el Story Mode en la aplicación Speak MVP. El Sistema permitirá a estudiantes practicar lenguaje español dentro de narrativas interactivas progresivas (A1→B2) con evaluación contextual y retroalimentación en tiempo real.

---

## Fase 1: Preparación (1-2 días)

### 1.1 Agregar Tipos TypeScript
**Archivo**: `frontend/lib/types.ts`

Copiar el contenido de `STORY_MODE_TYPES.ts` y agregar al final del archivo `types.ts` existente:

```typescript
// Agregar al final de types.ts
export interface Story { /* ... */ }
export interface GrammarConjugation { /* ... */ }
export interface Scene { /* ... */ }
export interface StoryProgress { /* ... */ }
export interface SceneResponse { /* ... */ }
```

### 1.2 Crear Datos de Historias
**Archivo**: `frontend/data/stories.json`

Este archivo YA EXISTE (ver `STORY_MODE_COMPONENTS.tsx`). Contiene:
- 3 historias iniciales (Crisis en la Estación, Mercado Digital, Reunión de Negocios)
- 5 escenas para la primera historia (A1→B2)
- Guía de orientación pre-respuesta para cada escena
- Rúbricas de evaluación por nivel CEFR

**Acciones**:
- Copiar contenido de `STORY_MODE_TYPES.ts` (sección "stories.json")
- Crear/actualizar archivo en `frontend/data/stories.json`
- Verificar que las 5 escenas estén completas

### 1.3 Crear Rutas API
**Ubicación**: `frontend/app/api/story/`

Debe contener:
- `evaluate.ts` - Validación de respuestas
- `guidance.ts` - Generación de modal pre-respuesta
- `progress.ts` - Actualización de progreso
- `list.ts` - Listado de historias disponibles
- `start.ts` - Iniciar/reanudar historia (opcional en MVP)

Copiar de `STORY_MODE_API_ROUTES.ts` y adaptarlas al directorio.

### 1.4 Crear Utilidades
**Archivo**: `frontend/lib/story-evaluator.ts`

Contiene funciones helper para:
- Evaluar respuestas
- Calcular scores
- Determinar aprobación según nivel CEFR
- Cargar datos de escenas

Copiar de `STORY_MODE_COMPONENTS.tsx` (sección "3. Story Evaluation Hook").

---

## Fase 2: Componentes Frontend (2-3 días)

### 2.1 Página Principal de Story Mode
**Archivo**: `frontend/app/(student)/story/page.tsx`

Importar y adaptarDel código en `STORY_MODE_COMPONENTS.tsx` (sección "1. StoryModeEntry").

**Cambios/Consideraciones**:
- Usar `useAuth()` para obtener `user.id` ✓
- Fetch de `/api/story/list` para stories
- Fetch de `/api/story/progress?student_id={id}` para mostrar progreso
- Grid responsivo con tarjetas de historias
- Mostrar botones "Iniciar", "Continuar", "Repetir" según estado

**Componentes Reutilizables**:
- Tailwind gradients (ya usados en tu app)
- Lucide icons (Play, RotateCcw, BookOpen)
- Dialog/Tabs de lucide-react UI

### 2.2 Página de Experiencia de Escena
**Archivo**: `frontend/app/(student)/story/[storyId]/page.tsx`

Esta es la experiencia principal. Estructura:

```typescript
export default function StoryScenePage({ params }: { params: { storyId: string } }) {
  const { user } = useAuth()
  const [scene, setScene] = useState<Scene | null>(null)
  const [progress, setProgress] = useState<StoryProgress | null>(null)
  const [userResponse, setUserResponse] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [showGuidanceModal, setShowGuidanceModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)

  // Load scene on mount
  useEffect(() => {
    loadScene()
  }, [params.storyId, user?.id])

  // Render scene + input + buttons
  return (
    <div className="min-h-screen bg-black/40">
      {/* Header: Story Title, Scene X/Y, Timer */}
      <Header scene={scene} />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-8">
        {/* Background + Narrative */}
        <NarrativeContext scene={scene} />

        {/* Character + Dialogue */}
        <CharacterDialogue scene={scene} />

        {/* User Input */}
        <InputArea 
          value={userResponse}
          onChange={setUserResponse}
          onSubmit={handleSubmit}
          showHelpButton={() => setShowGuidanceModal(true)}
        />
      </div>

      {/* Modals */}
      <PreResponseGuidanceModal
        isOpen={showGuidanceModal}
        onClose={() => setShowGuidanceModal(false)}
        scene={scene}
      />
      <EvaluationFeedbackModal
        isOpen={showFeedbackModal}
        evaluation={evaluation}
        onRetry={handleRetry}
        onContinue={handleContinue}
      />
    </div>
  )
}
```

**Funcionalidades Clave**:
- Timer de escena
- Input de texto (+ opción voz futuro)
- Botones: Ver Ayuda, Enviar
- Validación pre-envío (check vacío/mínimo tokens)
- Llamada a `/api/story/evaluate`
- Mostrar feedback modal
- Manejo de aprobación/rechazo
- Navegación a siguiente escena si aprobado

### 2.3 Modal de Orientación Pre-Respuesta
**Archivo**: `frontend/components/PreResponseGuidanceModal.tsx`

YA CODIFICADO en `STORY_MODE_COMPONENTS.tsx`.

Copiar completo. Características:
- 4 tabs: Verbos | Adjetivos | Sustantivos | Gramática
- Acordeón expandible en cada verbo
- Conjugaciones en todos los tiempos
- Ejemplos en contexto + otros contextos
- Consejo gramatical con ejemplos
- Frases de apertura sugeridas

### 2.4 Modal de Retroalimentación
**Archivo**: `frontend/components/EvaluationFeedbackModal.tsx`

A crear (similar a PreResponseGuidanceModal):

```typescript
interface EvaluationFeedbackModalProps {
  isOpen: boolean
  evaluation: EvaluationResult
  onRetry: () => void
  onContinue: () => void
}

export function EvaluationFeedbackModal({
  isOpen,
  evaluation,
  onRetry,
  onContinue,
}: EvaluationFeedbackModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {evaluation.is_approved ? '✅ ¡Excelente!' : '⚠️ Intentemos de nuevo'}
          </DialogTitle>
        </DialogHeader>

        {/* Scores */}
        <ScoreDisplay evaluation={evaluation} />

        {/* Character Reaction */}
        <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-4 rounded-lg">
          <p className="text-cyan-100 italic">"{evaluation.character_reaction}"</p>
        </div>

        {/* Feedback Sections */}
        {evaluation.feedback.positive_aspects.length > 0 && (
          <div className="bg-green-900/30 p-3 rounded">
            <h4 className="text-green-300 font-bold">✓ Lo que salió bien:</h4>
            <ul className="text-sm text-green-200">
              {evaluation.feedback.positive_aspects.map((aspect, i) => (
                <li key={i}>- {aspect}</li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.feedback.areas_to_improve.length > 0 && (
          <div className="bg-yellow-900/30 p-3 rounded">
            <h4 className="text-yellow-300 font-bold">~ Áreas a mejorar:</h4>
            <ul className="text-sm text-yellow-200">
              {evaluation.feedback.areas_to_improve.map((area, i) => (
                <li key={i}>- {area}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Specific Corrections */}
        {evaluation.feedback.specific_corrections.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-cyan-300">🔧 Correcciones:</h4>
            {evaluation.feedback.specific_corrections.map((correction, i) => (
              <div key={i} className="bg-slate-800 p-2 rounded text-sm">
                <p className="text-red-400 line-through mb-1">
                  "{correction.original}"
                </p>
                <p className="text-green-400 mb-1">
                  "{correction.corrected}"
                </p>
                <p className="text-slate-400 text-xs">{correction.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Native-like Suggestions */}
        {evaluation.feedback.nativelike_suggestions.length > 0 && (
          <div className="space-y-2 bg-purple-900/30 p-3 rounded">
            <h4 className="font-bold text-purple-300">🌟 Suena más nativo:</h4>
            {evaluation.feedback.nativelike_suggestions.map((sug, i) => (
              <div key={i} className="text-sm">
                <p className="text-slate-300">
                  En lugar de: "{sug.current_phrase}"
                </p>
                <p className="text-purple-300 font-semibold">
                  Intenta: "{sug.native_alternative}"
                </p>
                <p className="text-slate-400 text-xs mt-1">{sug.explanation}</p>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          {!evaluation.is_approved && (
            <button
              onClick={onRetry}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg"
            >
              ↺ Intentar de Nuevo
            </button>
          )}
          {evaluation.is_approved && (
            <button
              onClick={onContinue}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg"
            >
              → Siguiente Escena
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Fase 3: Integración del Sidebar (1 día)

### 3.1 Modificar StudentSidebar
**Archivo**: `frontend/components/StudentSidebar.tsx`

Cambio simple - Agregar a `links` array:

```typescript
// ANTES:
const links = [
  { href: '/missions', label: 'MISIONES', icon: Radio },
  { href: '/guides', label: 'GUÍAS DE APRENDIZAJE', icon: Lightbulb },
  { href: '/groups', label: 'GRUPOS', icon: Users },
  { href: '/profile', label: 'PERFIL', icon: User },
]

// DESPUÉS:
import { BookOpen } from 'lucide-react' // Agregar import

const links = [
  { href: '/story', label: 'STORY MODE', icon: BookOpen },  // ← NUEVO
  { href: '/missions', label: 'MISIONES', icon: Radio },
  { href: '/guides', label: 'GUÍAS DE APRENDIZAJE', icon: Lightbulb },
  { href: '/groups', label: 'GRUPOS', icon: Users },
  { href: '/profile', label: 'PERFIL', icon: User },
]
```

**Nota**: Decidir posición (primera vs después de misiones). Recomendación: Primera posición si Story Mode es prioritario.

---

## Fase 4: Base de Datos (Persistencia)

### 4.1 Agregar Sección a db.json
**Archivo**: `frontend/data/db.json`

Agregar dos nuevas secciones:

```json
{
  "users": [ /* existing */ ],
  "missions": [ /* existing */ ],
  
  "storyProgress": [
    {
      "id": "unique-id",
      "student_id": "student-id",
      "story_id": "story-estacion-crisis",
      "current_scene_id": "scene-estacion-1",
      "current_scene_order": 1,
      "status": "in_progress",
      "scenes_completed": [1],
      "total_attempts": 1,
      "successful_attempts": 1,
      "average_quality_score": 4.2,
      "started_at": "2026-04-06T10:00:00Z",
      "completed_at": null,
      "last_accessed_at": "2026-04-06T10:15:00Z",
      "updated_at": "2026-04-06T10:15:00Z"
    }
  ],
  
  "sceneResponses": [
    {
      "id": "response-id",
      "student_id": "student-id",
      "scene_id": "scene-estacion-1",
      "story_id": "story-estacion-crisis",
      "attempt_number": 1,
      "user_text": "Hola, ¿adónde vas?",
      "evaluation": { /* EvaluationResult */ },
      "submitted_at": "2026-04-06T10:10:00Z",
      "evaluated_at": "2026-04-06T10:10:30Z"
    }
  ]
}
```

### 4.2 Crear Helper para Persistencia
**Archivo**: `frontend/lib/db.ts` (actualizar si ya existe)

```typescript
// Agr	egar funciones:
export async function updateStoryProgress(studentId: string, progress: StoryProgress) {
  // Update db.json storyProgress array
  // Or make POST to API endpoint that updates persistent DB
}

export async function saveSceneResponse(response: SceneResponse) {
  // Save response to db.json sceneResponses
  // Or make POST to API endpoint
}

export async function getStudentStoryProgress(studentId: string, storyId: string) {
  // Fetch from db.json
  // Or GET from API
}
```

---

## Fase 5: Testing & Refinamiento (1-2 días)

### 5.1 Test Scenarios

#### A1 Level Test (Scene 1)
- Student: "Hola, yo ir Madrid"
- Expected: APPROVE (simple, answers question)
- Feedback: Suggest "Voy a Madrid" but don't penalize

#### A2 Level Test (Scene 2)
- Student: "Viajo con mi hermana. Una semana."
- Expected: APPROVE (answers both questions, correct grammar)

#### B1 Level Test (Scene 4)
- Student: "Me encantaría colaborar. Sin embargo, necesitaría entender..."
- Expected: APPROVE (natural, complex, professional)

#### B1 Off-Topic Test
- Student: "El cielo es azul" (in response to meeting question)
- Expected: REJECT (off-topic, not contextually relevant)

### 5.2 Validation Checklist

- [ ] Story list page loads without errors
- [ ] Clicking a story opens the scene view
- [ ] "Ver Ayuda" modal displays correct guidance
- [ ] Submitting response shows feedback modal
- [ ] Approved responses show character positive reaction + Continue button
- [ ] Rejected responses show areas to improve + Retry button
- [ ] Continuing takes you to next scene
- [ ] Sidebar "Story Mode" link appears and works
- [ ] Progress persists across sessions
- [ ] Scores display correctly (1-5 scale)

---

## Fase 6: Extensiones Futuras (Post-MVP)

### 6.1 Voz (Speech-to-Text)
- Integrar Web Speech API o similar
- Button "🎙️ Hablar" en StorySceneView
- Transcribir a texto y pasar a evaluación

### 6.2 Más Historias
- Escenas adicionales (B2 finale, nuevas historias)
- Temas diversos (viaje, negocio, vida social, academia)
- Personalización por interés del estudiante

### 6.3 Achievements & Gamification
- Badges por historia completada
- Streaks (días consecutivos)
- Leaderboards
- XP points

### 6.4 Analytics
- Time spent per scene
- Retry counts
- Score trends
- Common mistakes tracking

### 6.5 Teacher Dashboard
- Ver progreso de estudiantes en Story Mode
- Asignar historias específicas
- Ver evaluaciones detalladas

---

## Checklist de Implementación

### Preparación
- [ ] Copia tipos TypeScript a `lib/types.ts`
- [ ] Crea/actualiza `frontend/data/stories.json`
- [ ] Crea rutas API en `app/api/story/`
- [ ] Crea utilidades en `lib/story-evaluator.ts`

### Frontend
- [ ] Crea `app/(student)/story/page.tsx` (lista)
- [ ] Crea `app/(student)/story/[storyId]/page.tsx` (escena)
- [ ] Crea componentes en `components/`:
  - [ ] `PreResponseGuidanceModal.tsx`
  - [ ] `EvaluationFeedbackModal.tsx`
  - [ ] `StorySceneView.tsx` (o dentro de page.tsx)

### Integración
- [ ] Actualiza `components/StudentSidebar.tsx`
- [ ] Agrega progress tracking a `db.json`
- [ ] Prueba links de navegación

### Testing
- [ ] Test A1-B2 respuestas
- [ ] Test contexto validación
- [ ] Test progreso persistencia
- [ ] Test UI/UX en móvil


### Versión en Producción
- [ ] Migra `stories.json` a DB real
- [ ] Configura variables de ambiente (OPENROUTER_API_KEY)
- [ ] Optimiza imágenes/backdrop URLs
- [ ] Configura logging y error tracking
- [ ] Deploy a staging
- [ ] Pruebas de carga
- [ ] Deploy a producción

---

## Consideraciones Técnicas Importantes

### 1. OpenRouter API Key
- Asegurar que esté en `.env.local` (no en código)
- La llamada a OpenRouter debe ser desde backend (no frontend inmediatamente)
- Considerar rate limiting y costo

### 2. Evaluación Contextual
- El prompt para OpenRouter es crítico
- Incluye: level guidelines, expected responses, scene context
- JSON parsing debe ser robusto (añadir try-catch)

### 3. Persistencia
- MVP: usar `db.json`
- Producción: migrar a PostgreSQL / MongoDB / Firebase
- Mantener estructura compatible

### 4. Caché de Datos
- Stories y scenes son estáticas → cache en cliente
- Progress es dinámica → siempre fetch fresh

### 5. Error Handling
- OpenRouter API calls pueden fallar → fallback graceful
- Scene loading errors → mostrar mensaje de error amigable
- Network errors → retry logic

---

## Estructura de Carpetas Final

```
frontend/
├── app/
│   ├── (student)/
│   │   └── story/
│   │       ├── page.tsx                (lista de historias)
│   │       └── [storyId]/
│   │           └── page.tsx            (experiencia de escena)
│   └── api/
│       └── story/
│           ├── evaluate.ts
│           ├── guidance.ts
│           ├── progress.ts
│           └── list.ts
├── components/
│   ├── PreResponseGuidanceModal.tsx
│   ├── EvaluationFeedbackModal.tsx
│   └── StudentSidebar.tsx              (modificado)
├── data/
│   └── stories.json                    (nuevo)
├── lib/
│   ├── types.ts                        (actualizado)
│   └── story-evaluator.ts              (nuevo)
└── ...
```

---

## Timeline Estimado

| Fase | Duración | Dependencias |
|------|----------|-------------|
| 1. Preparación | 1-2 días | Ninguna |
| 2. Componentes | 2-3 días | Fase 1 completa |
| 3. Sidebar | 1 día | Fase 2 parcial |
| 4. Base de Datos | 1 día | Fase 2 completa |
| 5. Testing | 1-2 días | Fase 4 completa |
| **Total MVP** | **~1 semana** | - |
| 6. Extensiones | Flexible | MVP completo |

---

## Recursos & Referencias

- **OpenRouter Docs**: https://openrouter.ai/docs
- **CEFR Level Definitions**: https://www.coe.int/en/web/common-european-framework-reference-levels/level-descriptions
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Tailwind CSS**: https://tailwindcss.com/
- **Lucide React Icons**: https://lucide.dev/

---

## Soporte & Preguntas

Si tienes preguntas durante la implementación:
1. Revisa la arquitectura en `STORY_MODE_ARCHITECTURE.md`
2. Consulta ejemplos de componentes en `STORY_MODE_COMPONENTS.tsx`
3. Verifica datos en `STORY_MODE_TYPES.ts` y `frontend/data/stories.json`
4. Revisa rutas API en `STORY_MODE_API_ROUTES.ts`

Good luck! 🚀
