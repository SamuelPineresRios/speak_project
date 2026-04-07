# 📑 Story Mode - Índice Maestro de Entregables

## 🎯 Empezar Aquí

**PRIMERO**: Lee este archivo (5 minutos)
**SEGUNDO**: Decide tu ruta de lectura (elige A, B o C abajo)
**TERCERO**: Sigue los documentos en orden

---

## 📚 Los 7 Documentos Entregados

### 📍 Ubicación Archivo: Directorio raíz

```
c:\Users\samue\Downloads\speak\backup\speak-mvp-json\
├── STORY_MODE_QUICK_START.md              ← Resumen ejecutivo (LEER PRIMERO)
├── STORY_MODE_ARCHITECTURE.md             ← Visión técnica completa
├── STORY_MODE_IMPLEMENTATION_GUIDE.md     ← Pasos de implementación
├── STORY_MODE_FAQ.md                      ← Preguntas respondidas
├── STORY_MODE_TYPES.ts                    ← Interfaces TypeScript
├── STORY_MODE_COMPONENTS.tsx              ← Código React (componentes)
├── STORY_MODE_API_ROUTES.ts               ← Código Backend (API routes)
│
└── frontend/data/stories.json             ← Contenido de historias (3 historias, 5-7 escenas cada una)

```

---

## 🧭 Rutas de Lectura Recomendadas

### Ruta 1️⃣: "Ejecutor" (Developer que implementará)

**Tiempo total**: 4-5 horas
**Objetivo**: Implementar en <1 semana

```
1. STORY_MODE_QUICK_START.md (20 min)
   ├─ Resumen ejecutivo
   ├─ Arquitectura en 60 seg
   ├─ Ejemplo completo de Story 1
   └─ Métricas de éxito

2. STORY_MODE_ARCHITECTURE.md (40 min)
   ├─ Estructura de datos completa
   ├─ Componentes frontend requeridos
   ├─ Rutas API y lógica
   └─ Criterios CEFR

3. STORY_MODE_COMPONENTS.tsx (60 min)
   ├─ StoryModeEntry (página de lista)
   ├─ PreResponseGuidanceModal (educativo)
   ├─ Utilidades de evaluación
   └─ Copy/paste código funcional

4. STORY_MODE_IMPLEMENTATION_GUIDE.md (90 min)
   ├─ Fase 1: Preparación (tipos + datos)
   ├─ Fase 2: Componentes React
   ├─ Fase 3: Sidebar integration
   ├─ Fase 4: Persistencia
   ├─ Fase 5: Testing
   └─ Checklist completo

5. STORY_MODE_API_ROUTES.ts (45 min)
   ├─ Implementación de /api/story/evaluate
   ├─ Helper functions
   ├─ Error handling
   └─ OpenRouter integration

6. STORY_MODE_FAQ.md (30 min - como referencia)
   ├─ Respuestas a preguntas comunes
   ├─ Decisiones de diseño
   └─ Troubleshooting

7. frontend/data/stories.json (15 min)
   ├─ Verificar estructura
   ├─ Entender ejemplo Story 1
   └─ Usar como template para Historia 2

└─→ RESULTADO: Listo para comenzar implementación
```

### Ruta 2️⃣: "Arquitecto" (Tech Lead / Reviewer)

**Tiempo total**: 2-3 horas
**Objetivo**: Comprender diseño+decisiones

```
1. STORY_MODE_QUICK_START.md (20 min)
   └─→ Overview ejecutivo

2. STORY_MODE_ARCHITECTURE.md (60 min) - Secciones claves:
   ├─ Visión General
   ├─ Estructura de Datos
   ├─ Lógica de Evaluación
   └─ Integración en Sidebar

3. STORY_MODE_FAQ.md (40 min)
   ├─ Decisiones de Diseño (6 decisiones principales)
   ├─ Preguntas sobre Arquitectura
   └─ Performance & Escalabilidad

4. STORY_MODE_COMPONENTS.tsx (20 min)
   └─→ Skim solo para entender patrones

5. Opcionalmente: STORY_MODE_IMPLEMENTATION_GUIDE.md (30 min)
   └─→ Para entender timeline y roadmap

└─→ RESULTADO: Comprensión completa de visión, capaz de revisar código
```

### Ruta 3️⃣: "Gestor de Producto" (PM / Educational Designer)

**Tiempo total**: 1-2 horas
**Objetivo**: Entender capacidades, roadmap, cambiar requisitos

```
1. STORY_MODE_QUICK_START.md (25 min)
   ├─ Resumen ejecutivo
   ├─ Características implementadas
   ├─ Métricas de éxito
   └─ Timeline

2. STORY_MODE_ARCHITECTURE.md (25 min) - Secciones claves:
   ├─ Visión General
   ├─ Componentes Frontend (qué ve el user)
   ├─ Consideraciones de Diseño Narrativo
   └─ Contenido Narrativo Inicial

3. STORY_MODE_FAQ.md (15 min)
   ├─ Preguntas sobre UX
   ├─ Integración con Missions
   └─ Roadmap Post-MVP

4. frontend/data/stories.json (10 min)
   ├─ Revisar estructura y tono
   ├─ Considerar ajustes educativos
   └─ Pensar en historias adicionales

5. (Opcional) STORY_MODE_IMPLEMENTATION_GUIDE.md (10 min)
   └─→ Roadmap y timeline

└─→ RESULTADO: Capacidad de tomar decisiones sobre features/contenido
```

---

## 📖 Descripción de Cada Documento

### 1. STORY_MODE_QUICK_START.md
**Lectura**: 15-25 minutos
**Contenido**:
- Resumen ejecutivo (¿QUÉ es Story Mode?)
- Arquitectura en diagrama ASCII
- Ejemplo completo de Historia 1
- Checklist de características
- Métricas de éxito
- Cómo empezar (3 opciones)
- Troubleshooting común

**Cuándo usar**: 
- ✅ Primera lectura (hoy)
- ✅ Referencia rápida
- ✅ Para presentar a stakeholders

---

### 2. STORY_MODE_ARCHITECTURE.md
**Lectura**: 40-60 minutos
**Contenido** (por sección):
- Visión General (¿QUÉ + ¿POR QUÉ?)
- Estructura de Datos (tipos TypeScript detallados)
- Componentes Frontend (UI architecture)
- Backend - Rutas API (endpoints implementados)
- Lógica de Evaluación (cómo valida respuestas)
- Integración Sidebar (cómo se conecta)
- Contenido Narrativo Inicial (ejemplo completo de Story 1)
- Flujo de Usuario (Step-by-step what happens)

**Cuándo usar**:
- ✅ Segunda lectura (después de Quick Start)
- ✅ Referencia técnica durante implementación
- ✅ Para design reviews

---

### 3. STORY_MODE_IMPLEMENTATION_GUIDE.md
**Lectura**: 30-45 minutos
**Contenido** (organizado por fases):
- Fase 1: Preparación (1-2 días)
  - Agregar tipos TypeScript
  - Crear datos de historias
  - Crear rutas API
  - Crear utilidades
- Fase 2: Componentes Frontend (2-3 días)
  - Página principal (lista)
  - Página de escena (experiencia)
  - Modal de orientación
  - Modal de retroalimentación
- Fase 3: Integración Sidebar (1 día)
- Fase 4: Base de Datos (1 día)
- Fase 5: Testing & Refinamiento (1-2 días)
- Estructura de carpetas final
- Timeline estimado

**Cuándo usar**:
- ✅ Durante implementación (sigue paso a paso)
- ✅ Para estimaciones de tiempo
- ✅ Como checklist de progreso

---

### 4. STORY_MODE_FAQ.md
**Lectura**: 30-45 minutos (como referencia, no necesariamente de corrida)
**Contenido**:
- 20+ Preguntas respondidas
- 6 Decisiones de Diseño (y alternativas consideradas)
- Performance & Escalabilidad
- Troubleshooting común
- Roadmap post-MVP

**Cuándo usar**:
- ✅ Como referencia durante desarrollo
- ✅ Cuando tienes una pregunta
- ✅ Para entender por qué ciertas decisiones

---

### 5. STORY_MODE_TYPES.ts
**Lectura**: 10-15 minutos
**Contenido**:
- Story interface (metadatos de historia)
- Scene interface (estructura de escena completa)
- StoryProgress interface (tracking de progreso)
- SceneResponse interface (respuestas almacenadas)
- GrammarConjugation interface (verbos con conjugaciones)

**Cuándo usar**:
- ✅ Copy → frontend/lib/types.ts
- ✅ Como referencia de estructura de datos
- ✅ Para validación de tipos en componentes

---

### 6. STORY_MODE_COMPONENTS.tsx
**Lectura**: 45-60 minutos (skimmable, bastante código)
**Contenido**:
1. StoryModeEntry (~150 líneas)
   - Lista de historias disponibles
   - Grid responsivo
   - Progress bars
   - Botones de acción

2. PreResponseGuidanceModal (~200 líneas)
   - 4 tabs (Verbs, Adjectives, Nouns, Grammar)
   - Acordeones expandibles
   - Ejemplos en contexto
   - Copypaste listo

3. Story Evaluation Hook (~100 líneas)
   - evaluateStoryResponse()
   - shouldApproveResponse()
   - Helpers de utilidad

**Cuándo usar**:
- ✅ Copiar/pegar componentes
- ✅ Como referencia de implementación React
- ✅ Para entender patrones de componentes

**Nota**: Parcialmente pseudocódigo + pseudocodigo, ver IMPLEMENTATION_GUIDE para detalles

---

### 7. STORY_MODE_API_ROUTES.ts
**Lectura**: 40-50 minutos (bastante código)
**Contenido**:
1. POST /api/story/evaluate (~200 líneas)
   - Validación de respuestas
   - OpenRouter API call
   - Cálculo de scores
   - Lógica de aprobación

2. POST /api/story/guidance (~40 líneas)
   - Generación de modal educativa

3. POST /api/story/progress (~60 líneas)
   - Actualización de progreso
   - Carga de siguiente escena

Plus helpers y utilidades

**Cuándo usar**:
- ✅ Copiar rutas a app/api/story/
- ✅ Como referencia de integración OpenRouter
- ✅ Para entender flujo de evaluación

---

### 8. frontend/data/stories.json
**Lectura**: 20-30 minutos para skim, luego referencia
**Contenido**:
- 3 historias completas con metadata
- 18 escenas totales (5-7 por historia)
- Cada escena tiene:
  - Contexto narrativo
  - Diálogos del NPC
  - Criterios de evaluación
  - Guía completacompleta de verbos (conjugaciones)
  - Adjetivos y sustantivos
  - Consejos gramaticales
  - Respuestas esperadas
  - Reacciones del personaje

**Por leer**:
- Story 1: "Crisis en la Estación" (COMPLETA, A1→B2)
- Story 2: "Mercado Digital" (SKÍM, A2)
- Story 3: "Reunión de Negocios" (SKIM, B1)

**Cuándo usar**:
- ✅ Copy/paste directamente al proyecto
- ✅ Como template para crear nuevas historias
- ✅ Referencia de tonación y contexto

---

## 🎯 Decisiones Clave Documentadas

### ¿Por qué separar Story Mode de Missions?
→ Ver STORY_MODE_QUICK_START.md (Diferencia Key con Missions)
→ Ver STORY_MODE_FAQ.md (P: "¿Story Mode reemplaza Missions?")

### ¿Cómo funciona la evaluación contextual?
→ Ver STORY_MODE_ARCHITECTURE.md (Lógica de Evaluación)
→ Ver STORY_MODE_API_ROUTES.ts (buildEvaluationPrompt fonction)

### ¿Cómo se progresa A1 → B2?
→ Ver STORY_MODE_ARCHITECTURE.md (Contenido Narrativo Inicial)
→ Ver STORY_MODE_FAQ.md (Decisión 6: Una Historia Linear vs Branching)
→ Ver frontend/data/stories.json (Scene 1 vs Scene 5 comparison)

### ¿Por qué OpenRouter + Gemini?
→ Ver STORY_MODE_FAQ.md (Decisión 5: OpenRouter vs Local LLM)

### ¿Cómo se evita abuso de retries?
→ Ver STORY_MODE_FAQ.md (P: "¿Qué pasa si estudiante retinta 10 veces?")

---

## ✅ Validación Checklist

Antes de empezar implementación, verifica:

- [ ] Todos 7 documentos están en workspace
- [ ] Conoces la diferencia entre cada docto
- [ ] Has elegido una ruta de lectura (Ejecutor/Arquitecto/PM)
- [ ] Entiendes por qué es diferente de Missions
- [ ] Sabes cómo funciona la evaluación contextual
- [ ] Has revisado al menos una escena en stories.json completa
- [ ] OpenRouter API key está disponible
- [ ] Tienes 7-10 días estimados para MVP

---

## 🚀 Quick Links (Para Buscar Después)

| Necesito... | Busco... |
|------------|----------|
| Entender qué es Story Mode | STORY_MODE_QUICK_START.md + STORY_MODE_ARCHITECTURE.md Visión General |
| Estructura de datos | STORY_MODE_TYPES.ts + STORY_MODE_ARCHITECTURE.md Estructura de Datos |
| Implementar StoryModeEntry (lista) | STORY_MODE_COMPONENTS.tsx (StoryModeEntry) |
| Implementar PreResponseModal | STORY_MODE_COMPONENTS.tsx (PreResponseGuidanceModal) |
| Implementar evaluación | STORY_MODE_API_ROUTES.ts (POST /api/story/evaluate) |
| Agregar al sidebar | STORY_MODE_IMPLEMENTATION_GUIDE.md Fase 3 |
| Entender flujo de usuario | STORY_MODE_ARCHITECTURE.md Flujo de Usuario |
| Responder preguntas| STORY_MODE_FAQ.md |
| Ver ejemplo completo | frontend/data/stories.json (Story 1) |
| Timeline de implementación | STORY_MODE_IMPLEMENTATION_GUIDE.md Timeline |
| Troubleshoot un problema | STORY_MODE_FAQ.md Troubleshooting |
| Entender decisiones de diseño | STORY_MODE_FAQ.md Decisiones de Diseño |

---

## 💡 Tips de Lectura

1. **No necesitas leerlo TODO de corrida**
   - Usa este índice como mapa
   - Lee según tu ruta
   - Referencias son hiperenlaces conceptuales

2. **Skim primero, lee detallado después**
   - Primera lectura: Skim rápido (tablespoon contents)
   - Segunda lectura: Deep dive en secciones clave
   - Tercera lectura: Referencias mientras implementas

3. **El código es pseudocódigo + explicado**
   - STORY_MODE_COMPONENTS.tsx y STORY_MODE_API_ROUTES.ts tienen código FUNCIONAL
   - Pero algunos detalles están simplificados para claridad
   - STORY_MODE_IMPLEMENTATION_GUIDE.md explica cómo adaptar

4. **Consulta durante desarrollo**
   - Ten abierto STORY_MODE_IMPLEMENTATION_GUIDE.md (checklist)
   - Referencia STORY_MODE_FAQ.md cuando tengas dudas
   - Copia código de STORY_MODE_COMPONENTS.tsx según necesites

---

## 🎓 Convenciones Usadas

- **→** denota "ver también" o "relacionado con"
- **✅/❌** indica aprobación o rechazo
- `código en backticks` = código JavaScript/TypeScript
- **CAPS** = archivo o concepto importante
- [Bracketed] = sección o referencia

---

## 📞 Si Necesitas Ayuda

1. **Pregunta sobre contenido**: Busca en STORY_MODE_FAQ.md
2. **Pregunta sobre implementación**: Consulta STORY_MODE_IMPLEMENTATION_GUIDE.md
3. **Pregunta sobre arquitectura**: Consulta STORY_MODE_ARCHITECTURE.md
4. **No encuentras respuesta**: 
   - Revisa índice arriba ("Quick Links")
   - Skim todos los documentos
   - Pregunta directamente (estás cubierto 😊)

---

## 🎉 Estás Listo

**Tienes todo.**

- Documentación exhaustiva ✅
- Código de ejemplo ✅
- Datos de contenido ✅
- Pipeline claro ✅
- FAQ respondidas ✅

**Empezar:**
1. Lee STORY_MODE_QUICK_START.md (20 min)
2. Elige tu ruta (Ejecutor/Arquitecto/PM)
3. Sigue la lectura recomendada
4. Implementa siguiendo STORY_MODE_IMPLEMENTATION_GUIDE.md

**Tiempo a MVP: ~1 semana**
**Tiempo a Production: ~2 semanas**

---

**¡Ahora sí, vamos! 🚀📖**

*Preguntas? Revisa los docs. Todos están diseñados para ser exhaustivos pero navegables.*

