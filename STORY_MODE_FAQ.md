# Story Mode - Preguntas Frecuentes & Decisiones de Diseño

## Preguntas sobre la Arquitectura

### P: ¿Por qué separar Story Mode de Missions?
**R**: Aunque ambos son contextos de práctica, tienen objetivos diferentes:
- **Missions**: Ejercicios puntuales, evaluación de tareas específicas, completables en 5-10 min
- **Story Mode**: Narrativa cohesiva, múltiples escenas, práctica comunicativa sostenida, 20-45 min

La separación permite diseño UX optimizado para cada experiencia. Story Mode enfatiza narrativa e inmersión; Missions enfatiza tarea y feedback inmediato.

---

### P: ¿Cómo se maneja la evaluación de respuestas "creativas"?
**R**: La validación contextual es tolerante pero exigente:

**Tolerancia (Flexible)**:
- Variaciones de vocabulario (si mantienen significado)
- Estructuras alternativas válidas
- Cambios de registro durante aprendizaje

**Exigencia (Contextual)**:
- Debes responder a la pregunta específica del NPC
- Respuestas off-topic o sin relevancia → RECHAZAR
- Nivel B1+ requires pensamiento coherente, no solo gramática

Ejemplo:
```
NPC: "¿Adónde viajas?"

✅ Aprobado: "Voy a Madrid" (simple pero correcto)
✅ Aprobado: "Mi destino es Madrid" (alternativa válida)
❌ Rechazado: "Me gusta el viaje" (no responde la pregunta)
❌ Rechazado: "El cielo es azul" (completely off-topic)
```

---

### P: ¿Qué pasa si OpenRouter API falla?
**R**: Implementar fallback graceful:

```typescript
try {
  const evaluation = await OpenRouter call
  return evaluation
} catch (error) {
  // Simple evaluation based on local rules
  const basicEval = simpleLocalEvaluation(userResponse, scene)
  return basicEval
}

// simpleLocalEvaluation checks:
// 1. Min word count for level
// 2. Key vocabulary presence
// 3. Grammar patterns
// 4. Length heuristics
//
// Returns: conservative approval (lower threshold)
```

Esto permite que la app siga funcionando aunque la IA falle.

---

### P: ¿Cómo manejas estudiantes que abusan del "reintentar"?
**R**: Estrategias:

1. **Registro de intentos**: Trackear `attempt_number` en SceneResponse
2. **Limit suave**: Después de 3 intentos permitidos, ofrecer:
   - Mostrar respuesta modelo
   - O: "Pausa y vuelve después" (learning psychology)
3. **Analytics**: Teachers ven retry patterns (indicador de dificultad)
4. **Ajuste dinámico**: Si muchos retries en escena X → quizás es muy difícil

---

### P: ¿Cómo aseguras que cada escena progresa bien desde A1 a B2?
**R**: Varias capas:

1. **Diseño manual**: Cada escena tiene `cefr_level` explícito
2. **Contexto evolutivo**: La narrativa misma escala (diálogo simple → negociación profesional)
3. **Vocabulary escalation**: Verbos, adjetivos, sustantivos aumentan complejidad
4. **Estructura de oración**: A1 frases simples → B2 oraciones complejas
5. **Grammar structures**: A1 presente → B2 subjuntivo/condicional perfecto

Ejemplo progresión verbal en "Crisis en la Estación":
- Escena 1 (A1): "ir", "viajar", "buscar" (presente simple)
- Escena 2 (A1-A2): Agregar "tener", "estar" (pronombres posesivos)
- Escena 3 (A2): "salir", "tardar" (números y tiempo)
- Escena 4 (B1): "considerar", "colaborar" (condicional, argumentación)
- Escena 5 (B2): "argumentar", "transformar" (subjuntivo, sofisticación)

---

### P: ¿Qué ocurre si el estudiante completa una historia en 10 minutos?
**R**: Nada malo. Es una victoria. El tiempo estimado es una guía, no un límite:

- Si completa rápido pero con buena calidad → felicitaciones, badge de velocidad
- Si completa rápido pero mala calidad → system detecta y ofrece "revisit para mejorar"
- Analytics muestran: "Completed in 10 min (vs est. 25 min)" → indica student es más avanzado de lo pensado

---

### P: ¿Cómo se diferencian A2 vs B1 en evaluación?
**R**: La rubrica clave es diferente:

| Aspecto | A2 | B1 |
|---------|----|----|
| Min Words | 5 | 15 |
| Grammar Threshold | 3/5 | 3.5/5 |
| Context Relevance | 0.6+ | 0.8+ |
| Naturalness | 0.6+ | 0.8+ |
| Approval Bar | 75% | 80% |
| Complexity Expected | Basic Structures | Complex Sentences |

Así que una respuesta que pasa A2 puede fallar B1 (apropiadamente).

---

### P: ¿Puede estudiante ver sus respuestas anteriores en una escena?
**R**: NO en MVP.

Razones:
1. Complejidad UI/UX
2. Puede crear procrastinación ("Let me check my last attempt")
3. La evaluación feedback es suficiente

Post-MVP: Poder agregar historial en perfil:
- "Intento 1: ... (score 3.2)"
- "Intento 2: ... (score 4.5) ✓ APROBADO"

---

## Decisiones de Diseño

### Decisión 1: Pre-Response Modal vs. Contextual Hints
**Elegida**: Pre-Response Modal + Optional Hints During

**Razón**: Modal es menos "intrusive" que interrupciones durante la respuesta. Estudiante elige cuándo mirar, mantiene flow narrativo después de leerlo.

**Alternativa rechazada**: Pop-up hints aparecen mientras escribes. Demasiado ruido, interrumpe concentración.

---

### Decisión 2: Una Historia Linear vs. Branching Paths
**Elegida**: Linear (5 escenas secuenciales)

**Razón MVP**: 
- Más fácil de construir y evaluar
- Predecible para estudiantes
- Narrativa clara y progresiva

**Post-MVP**: Considerar "choice points":
```
Scene 4: "María te ofrece 2 opciones:"
- Option A: "Ir directamente a presentación"
- Option B: "Tomar café primero y charlar"
→ Lleva a dos ramas diferentes
```

---

### Decisión 3: Evaluación Automática Total vs. Humano-en-Loop
**Elegida**: Evaluación automática (OpenRouter) con confidence scores

**Razón**: 
- Feedback en tiempo real (crucial para learning)
- Humano-en-loop sería 24-48h de delay
- LLMs modernos (Gemini 2.0) son bastante precisos

**Fallback humano**: Teachers pueden marcar respuestas como "incorrectly rejected" → data para mejorar rubric

---

### Decisión 4: Historia Única vs. Múltiples Raíles por Nivel
**Elegida**: Historia única, pero con evaluación adaptativa por nivel

**Razón**:
- Estudiantes A1 y B1 pueden hacer la misma historia
- Criterios de aprobación se adaptan (A1: `threshold 0.7`, B1: `threshold 0.8`)
- Économico en curatorial effort

Ejemplo:
```
Misma Escena 1: NPC pregunta "¿Adónde vas?"

A1 Student: "Voy Madrid"
→ Evaluación: ✓ Aprobado (simple es ok)
→ Score: 4.0

B1 Student: "Voy Madrid"
→ Evaluación: ✓ Aprobado pero con advice
→ "Podría ser: 'Voy a Madrid' o 'Me dirijo a Madrid'"
→ Score: 3.5 (menos puntos por not complex enough)
```

---

### Decisión 5: OpenRouter vs. Local LLM
**Elegida**: OpenRouter (API cloud)

**Ventajas**:
- Modelo último (Gemini 2.0)
- Infraestructura escalable
- Sin GPU requiero localmente
- Requerimientos simples

**Alternativa local**: Ollama + Mistral. Pre-MVP pero: más infraestructura, menor calidad evaluación, más lento.

---

### Decisión 6: Almacenamiento Stories
**Elegida**: JSON en `frontend/data/stories.json` + Cache en cliente

**MVP**:
- Rápido de iterar
- Facilita A/B testing
- Fácil de versionar en git

**Post-MVP**: Migrar a DB:
```typescript
// Fase 1: JSON (MVP)
const scenes = await readJSON('/data/stories.json')

// Fase 2: PostgreSQL
const scenes = await db.query('SELECT * FROM scenes WHERE story_id = ?')
```

---

## Preguntas sobre User Experience

### P: ¿Timer es visible? ¿Crea presión?
**R**: Timer VISIBLE pero no punitive:
- Estimado: sugerencia ("~60 seg esperado")
- Sin time-out: puedes responder después
- Para A1 extra-lentos: no penalización

Propósito: Calibración de auto-expectativa, no presión.

---

### P: ¿Qué si estudiante habla en idioma nativo (código switching)?
**R**: Depende de objetivo:

**Opción 1**: Rechazar, pedir "Intenta en español"
```
Student: "I think that you should..."
Feedback: "Excelente pensamiento, pero intenta expresarlo en español. 
Comienza: 'Creo que debería...'"
→ RECHAZAR, permitir reintento
```

**Opción 2**: Aceptar con feedback
```
Student: "I think... Bueno, creo que debería ir"
Feedback: "¡Buen intento de code-switching! En conversación real es común.
Pero en clase, intenta: 'Creo que debería...'"
→ ACEPTAR CON NOTA
```

**Recomendación**: Opción 1 (stricter, para motivar Spanish practice).

---

### P: ¿Cuál es el "feel" visual ideal?
**R**: Inmersivo pero funcional:
- **NOT videogame**: No queremos distracción tipo RPG
- **NOT academic**: Toolbar de educación formal sería aburrida

**Target**: Sensación de "conversation with purpose"
- Dark background (concentración)
- Character avatar simple pero memorable
- Dialogue en bubble clara (lo que dijeron)
- Tu input box prominente
- Feedback modal que proporciona información sin dramatismo

Ver mockup en: (Wireframes deberían estar en GAMIFICATION_WIREFRAMES.md)

---

### P: ¿Mobile-first o Desktop-first?
**R**: Desktop-first para MVP (versión 1.0)

**Razón**: Pruebas más simples, evaluación más clara
**Post-MVP**: Mobile-responsive (80-90% del código ya lo es)

---

## Integración con Misiones Existentes

### P: ¿Story Mode reemplaza Missions?
**R**: NO. Complementan:

- **Missions**: Práctica puntual de habilidades específicas (pronunciación, gramática, vocabulario)
- **Story Mode**: Práctica integrada de comunicación holística

Estudiante ideal:
```
Lunes: Mission "Tiempos verbales"
Martes: Story Mode Escena 2
Miércoles: Mission "Comprensión auditiva"
Jueves: Story Mode Escena 3
```

---

### P: ¿Puedo asignar Story Mode como Missions desde Teacher Dashboard?
**R**: Sí, post-MVP.

MVP: Story Mode es auto-acceso
Post-MVP: Agregar:
```
Teacher Dashboard → Stories
- [ ] Crisis en la Estación (asignar)
- [ ] Mercado Digital
- [ ] Reunión de Negocios

Asignado a: Grupo A1 | Due: 2026-04-20
```

---

## Performance & Escalabilidad

### P: ¿Qué pasa con 1000 estudiantes en Story Mode simultaneamente?
**R**: 

**OpenRouter API**:
- Rate limiting: ~10-50 requests/segundo típicamente
- Si todos evalúan simultáneamente → queue necesario
- Cost: Gemini 2.0 es $0.075/MTok entrada, $0.3/MTok salida
- 1000 estudiantes × 5 evaluaciones = $2-3 totales

**Solución escalable**:
```typescript
// Implementar job queue
import Bull from 'bull'

const evaluationQueue = new Bull('story-evaluations')

// En route:
evaluationQueue.add({ 
  userId, sceneId, response 
}, { delay: random(500, 2000) })

// Workers procesar en batch
evaluationQueue.process(5, async (job) => {
  return await evaluateStoryResponse(job.data)
})
```

---

### P: ¿Stories.json va a ser MUY grande?
**R**: No significantemente:

- 3 historias × 5-7 escenas = 15-21 escenes
- Por escena: ~2KB (guidance + dialogue + criteria)
- Total: ~50KB → negligible

Cuando llegues a 50+ historias → migrar a DB.

---

## Troubleshooting

### Problema: Modal de Orientación no aparece
**Debug**:
1. Check console: `setShowGuidanceModal(true)` llamado?
2. Scene data cargada? `console.log(scene.guidance)`
3. Tailwind styles son importados?
4. Dialog component disponible?

---

### Problema: Evaluación siempre devuelve "low scores"
**Verificar**:
1. OpenRouter API key es válida?
2. Prompt es claro y específico?
3. Modelo es correcto (gerini-2.0-flash)?
4. JSON parsing funciona? Agregar console.error para debug
5. Rubric thresholds son muy altos para nivel del estudiante?

---

### Problema: Estudiante queda atrapado en escena X
**Solución**:
1. Permitir "Skip scene" con warning ("Perderás"progress")?
2. Ofrecer "See model answer"?
3. Dashboard admin: Override escena como completada?

---

## Roadmap Post-MVP

### Mes 1 Después de MVP
- [ ] Voice input (Web Speech API)
- [ ] Más historias (3 nuevas)
- [ ] Mobile optimización

### Mes 2
- [ ] Teacher dashboard
- [ ] Assignments de stories
- [ ] Analytics detalladas

### Mes 3
- [ ] Branching paths
- [ ] Achievements/Badges
- [ ] Story authoring tool (para teachers crear sus propias historias)

### Mes 6+
- [ ] Multiplayer stories (colaborar con otros estudiantes)
- [ ] AI character con voz
- [ ] VR/Immersive version

---

## Contact & Support

Para preguntas de implementación:
1. Revisa esta FAQ
2. Consulta `STORY_MODE_ARCHITECTURE.md` para visión general
3. Revisa `STORY_MODE_IMPLEMENTATION_GUIDE.md` para pasos específicos
4. Busca ejemplos en `STORY_MODE_COMPONENTS.tsx`

Buena suerte! 🚀
