
# 📚 ANÁLISIS: GUÍAS DE APRENDIZAJE (Learning Guides Module)

## 📋 RESUMEN EJECUTIVO

El archivo `db.json` contiene **8 guías de aprendizaje** (Learning Guides) diseñadas para enseñar gramática, vocabulario y habilidades de conversación en inglés. Estas guías están organizadas por niveles CEFR (A2, B1, B2) y están vinculadas a las misiones de conversación.

---

## 📊 ESTRUCTURA GENERAL

### Tabla: `guides`

Cada guía contiene los siguientes campos:

```json
{
  "id": "guide-001",                           // ID único
  "title": "⏰ Present Perfect - The Quest",   // Título con emoji
  "description": "...",                        // Descripción breve
  "cover_emoji": "⏰",                         // Emoji de portada
  "cefr_level": "A2",                         // Nivel: A1, A2, B1, B2, C1
  "concept_tags": [...],                      // Etiquetas de conceptos
  "estimated_minutes": 25,                    // Tiempo estimado
  "xp_reward": 150,                           // Puntos de experiencia
  "progress": {
    "status": "in_progress|not_started|completed",
    "score": 0-100,
    "exercises_completed": 6,
    "exercises_total": 10,
    "current_streak": 2,
    "max_streak": 5
  },
  "content": {...},                            // Contenido detallado
  "mission_connection": "m-001",              // Misión vinculada
  "story_connection": "story-001",            // Historia vinculada
  "scene_concepts": [...],                    // Conceptos de escenas
  "created_at": "2026-03-18T10:00:00Z",      // Fecha de creación
  "is_published": true,                       // Publicado
  "enable_chat_assistant": true               // Chat de IA habilitado
}
```

---

## 🎯 GUÍAS DISPONIBLES

### 1️⃣ **Present Perfect - The Quest** (guide-001)
- **Nivel:** A2 (Beginner+)
- **XP:** 150
- **Estado:** In Progress
- **Conceptos:** Grammar, Verb Tenses
- **Duración:** 25 minutos
- **Misión:** m-001 (Booking a flight)
- **Contenido:**
  - Definición del Present Perfect
  - Fórmula: Subject + HAVE/HAS + Past Participle
  - 3 ejercicios de opción múltiple
  - Expresiones comunes: "have you ever", "just"

---

### 2️⃣ **Phrasal Verbs - Master Edition** (guide-002)
- **Nivel:** B1 (Intermediate)
- **XP:** 175
- **Estado:** Not Started
- **Conceptos:** Vocabulary, Phrasal Verbs
- **Duración:** 30 minutos
- **Misión:** m-004 (Negotiate a price)
- **Contenido:**
  - Explicación: Verb + Preposition/Adverb
  - Phrasal verbs separables e inseparables
  - 3 ejercicios
  - Ejemplos: "log in", "back up", "shut down"

---

### 3️⃣ **Conditional Sentences - The Challenge** (guide-003)
- **Nivel:** B1 (Intermediate)
- **XP:** 200
- **Estado:** In Progress (82%)
- **Conceptos:** Grammar, Conditionals, Hypothetical
- **Duración:** 30 minutos
- **Misión:** m-002 (Tech support)
- **Contenido:**
  - 4 tipos de condicionales (Type 0-3)
  - Fórmulas para cada tipo
  - 3 ejercicios
  - Expresiones: "as long as", "unless"

---

### 4️⃣ **Passive Voice - Pro Mode** (guide-004)
- **Nivel:** B1 (Intermediate)
- **XP:** 250
- **Estado:** Completed (100%)
- **Conceptos:** Grammar, Verb Structures
- **Duración:** 25 minutos
- **Contenido:**
  - Estructura: Object + To Be + Past Participle
  - Tiempos en pasiva (Present, Past, Future, Perfect)
  - 3 ejercicios
  - Expresiones: "It is believed", "It is reported"

---

### 5️⃣ **Modals of Deduction - Logic Puzzle** (g-005)
- **Nivel:** B1 (Intermediate)
- **XP:** 200
- **Tipo:** Tema (Mystery)
- **Dificultad:** Intermediate
- **Unlock Level:** 3
- **Contenido:**
  - MUST (100% certeza): "The server must be down"
  - MIGHT/COULD (50% posibilidad): "The error might be a bug"
  - CAN'T (imposible): "That can't be right"
  - 4 ejercicios interactivos

---

### 6️⃣ **Future Forms - Time Traveler** (g-006)
- **Nivel:** A2 (Beginner+)
- **XP:** 150
- **Tipo:** Tema (Sci-Fi)
- **Dificultad:** Beginner
- **Unlock Level:** 2
- **Contenido:**
  - WILL: Predicciones espontáneas
  - GOING TO: Planes con evidencia
  - Present Continuous: Arreglos fijos
  - 4 ejercicios

---

### 7️⃣ **Reported Speech - The Informant** (g-007)
- **Nivel:** B2 (Advanced)
- **XP:** 250
- **Tipo:** Tema (Espionage)
- **Dificultad:** Upper Intermediate
- **Unlock Level:** 4
- **Contenido:**
  - Backshifting (retroceso temporal)
  - Direct vs Reported Speech
  - Say vs Tell
  - 4 ejercicios

---

### 8️⃣ **Relative Clauses - Network Builder** (g-008)
- **Nivel:** B1 (Intermediate)
- **XP:** 200
- **Tipo:** Tema (Networking)
- **Dificultad:** Intermediate
- **Unlock Level:** 3
- **Contenido:**
  - WHO (personas) vs WHICH (objetos)
  - THAT (universal) vs WHERE (lugares)
  - Defining vs Non-Defining
  - 4 ejercicios

---

## 📈 ESTADÍSTICAS

| Métrica | Valor |
|---------|-------|
| **Total de Guías** | 8 |
| **Nivel A2** | 2 guías |
| **Nivel B1** | 5 guías |
| **Nivel B2** | 1 guía |
| **XP Total Disponible** | 1,445 XP |
| **Tiempo Total Estimado** | 210 minutos (~3.5 horas) |
| **Guías Completadas** | 1 |
| **Guías En Progreso** | 2 |
| **Guías No Iniciadas** | 5 |

---

## 🔗 ESTRUCTURA DE CONTENIDO

### Campo: `content`

Cada guía tiene un objeto `content` con:

```json
{
  "definition": "Definición corta del concepto",
  "explanation": "Explicación detallada",
  "formula": "Estructura gramatical o patrón",
  "key_structures": [
    {
      "structure": "Estructura gramatical",
      "explanation": "Explicación",
      "example": "Ejemplo de uso"
    }
  ],
  "common_expressions": [
    {
      "expression": "Expresión",
      "meaning": "Significado",
      "example": "Ejemplo"
    }
  ],
  "real_life_examples": [
    {
      "context": "Contexto",
      "example": "Ejemplo",
      "explanation": "Explicación"
    }
  ],
  "exercises": [
    {
      "id": "e1",
      "type": "multiple_choice|fill_in_the_blank",
      "question": "Pregunta",
      "options": ["Opción 1", "Opción 2"],
      "correct_answer": "Respuesta correcta",
      "explanation": "Explicación de la respuesta"
    }
  ],
  "introduction": "Bienvenido a la simulación interactiva..."
}
```

---

## 🎮 CARACTERÍSTICAS INTERACTIVAS

### Guías Tipo "Tema" (g-005 a g-008)

Introducen elementos adicionales:

- **theme**: "mystery", "sci-fi", "espionage", "networking"
- **difficulty**: "Beginner", "Intermediate", "Upper Intermediate"
- **unlock_level**: Requisito de nivel para acceder
- **interactive_elements**: Elementos interactivos especiales

---

## 🔄 VINCULACIONES

### Conexión con Misiones

Cada guía está vinculada a una misión de conversación:

```
guide-001 → m-001 (Booking a flight)
guide-002 → m-004 (Negotiate a price)
guide-003 → m-002 (Tech support call)
guide-004 → No especificada en detalle
```

### Conexión con Historias

Cada guía conecta con historias narrativas (story-001, story-003, etc.)

---

## 💾 INSERCIÓN EN SQL

### Tabla Recomendada:

```sql
CREATE TABLE guides (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_emoji VARCHAR(10),
  cefr_level VARCHAR(5), -- A1, A2, B1, B2, C1, C2
  concept_tags JSON,
  concepts JSON, -- Para guías de tema
  theme VARCHAR(50), -- mystery, sci-fi, espionage, networking
  difficulty VARCHAR(50), -- Beginner, Intermediate, Upper Intermediate
  estimated_minutes INT,
  xp_reward INT,
  unlock_level INT,
  interactive_elements JSON,
  
  -- Progress tracking
  progress_status VARCHAR(50), -- in_progress, not_started, completed
  progress_score INT,
  exercises_completed INT,
  exercises_total INT,
  current_streak INT,
  max_streak INT,
  
  -- Content
  definition TEXT,
  explanation TEXT,
  formula TEXT,
  content JSON, -- Objeto completo de contenido
  
  -- Relationships
  mission_connection VARCHAR(50),
  story_connection VARCHAR(50),
  scene_concepts JSON,
  
  -- Metadata
  created_at TIMESTAMP,
  is_published BOOLEAN,
  enable_chat_assistant BOOLEAN,
  
  INDEX idx_cefr_level (cefr_level),
  INDEX idx_theme (theme),
  INDEX idx_xp_reward (xp_reward)
);
```

---

## 🚀 PRÓXIMOS PASOS

1. **Revisar la estructura SQL** según tu motor de BD
2. **Ejecutar los INSERT statements** del archivo `GUIDES_SQL_INSERTS.sql`
3. **Validar datos** con consultas de verificación
4. **Crear relaciones** con la tabla de usuarios para tracking
5. **Implementar progress tracking** para cada estudiante

---

## ⚠️ NOTAS IMPORTANTES

- Las guías están diseñadas para ser **progresivas** en dificultad
- El **XP reward** es el total máximo si se completa la guía
- Las **misiones** son prérequisitos contextuales para las guías
- El sistema de **streaks** incentiva práctica consistente
- Las **etiquetas de conceptos** pueden usarse para buscar y filtrar
- El campo **theme** crea una diferenciación visual y de experiencia

