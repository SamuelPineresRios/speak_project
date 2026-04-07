# 📚 Guías Mejoradas - Manual de Usuario

## ✨ Lo que se ha implementado

### 1. **Guías Ricas y Detalladas**
Cada guía ahora incluye:
- ✅ **Definición Clara**: Explicación concisa del concepto
- ✅ **Explicación Profunda**: Contexto y uso del concepto
- ✅ **Fórmula/Estructura**: Reglas gramaticales con formato visual
- ✅ **Estructuras Clave**: Múltiples patrones con ejemplos (4-5 por guía)
- ✅ **Expresiones Comunes**: Vocabulario y frases útiles contextualizadas
- ✅ **Casos de Vida Real**: Ejemplos prácticos (noticias, trabajo, medicina, etc.)
- ✅ **Ejercicios Interactivos**: 10-12 ejercicios por guía

### 2. **Ejercicios Interactivos**
Los ejercicios ahora tienen:
- ✅ Múltiple choice con feedback inmediato
- ✅ Explicações detalladas de por qué es correcta/incorrecta
- ✅ Try Again (reintentar si fallas)
- ✅ Seguimiento de progreso
- ✅ Badges por tipo (grammar, vocabulary, etc.)

### 3. **Asistente Claude Integrado** 🤖
- ✅ Tab dedicado "Tutoría" en cada guía
- ✅ Chat en vivo con Claude
- ✅ Responde preguntas sobre el contenido
- ✅ Puede dar ejemplos adicionales
- ✅ Conecta con el servicio Python de evaluación

### 4. **Interfaz Mejorada**
- ✅ 4 tabs por guía:
  1. **Contenido** - Todo el material estructurado
  2. **Ejercicios** - Con contador de progreso
  3. **Tutoría** - Chat con Claude (cuando habilitado)
  4. **Resumen** - Estadísticas y conceptos cubiertos

### 5. **Guías Disponibles**
Actualmente con contenido completo:
1. **Present Perfect** ⏰ - A2 level
2. **Phrasal Verbs** 🔄 - B1 level
3. **Conditional Sentences** ❓ - B1 level
4. **Passive Voice** 🔄 - B1 level

## 🚀 Cómo Usar las Guías

### Para Estudiantes
1. Navega a `/guides` desde el sidebar
2. Elige una guía
3. Lee el **Contenido** completamente
4. Haz los **Ejercicios** (se graban automáticamente)
5. Usa **Tutoría** para preguntas
6. Revisa tu **Resumen** final

### Para Profesores
- Monitorea el progreso en `/api/guides/[id]` (próximamente en dashboard)
- Las respuestas se graban en `guide_progress` en db.json
- Los ejercicios completados se rastrean en `exercise_submissions`

## 📊 Datos Almacenados

### En `db.json`:
```
- guides[] - Definiciones y contenido
- guide_progress[] - Progreso del estudiante
- chat_messages[] - Historial de chat con Claude
- exercise_submissions[] - Registro de ejercicios
```

### Struktura de una Guía:
```json
{
  "id": "guide-001",
  "title": "Nombre",
  "content": {
    "definition": "...",
    "explanation": "...",
    "formula": "...",
    "key_structures": [...],
    "common_expressions": [...],
    "real_life_examples": [...],
    "exercises": [...]
  },
  "enable_chat_assistant": true
}
```

## 🔧 Endpoints API

### GET `/api/guides`
Lista todas las guías disponibles

### GET `/api/guides/:id`
Obtiene detalles completos de una guía

### POST `/api/guides/:id/mark-completed`
Marca una guía como completada
```json
{ "score": 85 }
```

### GET `/api/guides/:id/chat`
Obtiene historial de chat

### POST `/api/guides/:id/chat`
Envía un mensaje (get Claude response)
```json
{ "content": "¿Qué es...?" }
```

### POST `/api/guides/:id/exercise-submission`
Registra un ejercicio completado
```json
{ 
  "exercise_id": "ex-001",
  "selected_answer": "have seen",
  "is_correct": true
}
```

### POST `/api/guides/:id/ai-evaluation`
Evalúa una respuesta libre con Claude
```json
{
  "user_response": "I have been studying for 2 years",
  "guide_title": "Present Perfect",
  "concept": "present-perfect"
}
```

## 🎨 Características del UI

### Colores por Sección
- 🔵 **Cyan**: Estructuras clave y contenido principal
- 🟢 **Emerald**: Expresiones y definiciones
- 🟣 **Violet**: Casos de vida real
- 🟡 **Amber**: Explicaciones y ejemplos

### Iconos Utilizados
- 📖 Contenido
- ✏️ Ejercicios
- 🤖 Tutoría con Claude
- 📊 Resumen
- ⏱ Tiempo estimado
- 📌 Expresiones importantes

## 📝 Próximas Mejoras

1. **Más Guías**:
   - Modal Verbs (B1)
   - Reported Speech (B2)
   - Question Formation (A2)
   - Advanced Tenses (B2)

2. **Gamification**:
   - Badges por completar guías
   - Puntos y rankings
   - Desafíos semanales

3. **Recomendaciones Inteligentes**:
   - Sugerir guías basadas en concepto detectado
   - Recomendaciones personalizadas por nivel

4. **Analytics**:
   - Dashboard de progreso del estudiante
   - Análisis de debilidades
   - Reporte para profesores

## 🐛 Troubleshooting

### "Claude no responde"
- Verifica que el servicio de evaluación está corriendo: `python evaluation_service/main.py`
- Comprueba la env var: `EVALUATION_SERVICE_URL`

### "Ejercicios no se guardan"
- Verifica que el middleware está inyectando `x-user-id`
- Revisa que estés autenticado

### "Guía vacía"
- Asegúrate que la guía está en db.json con estructura completa
- Recarga la página (limpia caché)

## 💡 Tips

1. **Para Profesores**: Exporta `db.json` regularmente para backups
2. **Para Estudiantes**: Usa Tutoría cuando estés confundido
3. **Para Desarrolladores**: Agrega más guías editando `update_guides.py`

---

**Creado**: Marzo 19, 2026
**Versión**: 1.0
**Status**: ✅ Activo y en producción
