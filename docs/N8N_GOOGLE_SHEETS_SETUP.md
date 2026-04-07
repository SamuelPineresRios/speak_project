# Configuración de n8n + Google Sheets para Exportar Actividades

## Descripción General
Este sistema captura automáticamente todas las actividades completadas (misiones, historias, guías) y las envía a Google Sheets. Cada grupo tiene su propio Sheet que se actualiza en tiempo real.

## Arquitectura
```
1. Estudiante completa actividad en Speak MVP
   ↓
2. Frontend llama a `/api/events/activity-completed`
   ↓
3. Backend envía evento a webhook de n8n
   ↓
4. n8n procesa datos y agrega fila a Google Sheets del grupo
```

## Pasos de Configuración

### 1. Crear Google Service Account
Para que n8n acceda a Google Sheets:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto: "Speak MVP"
3. Habilita la API: **Google Sheets API**
4. Crea una Service Account:
   - Ir a "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Nombre: `speak-automation`
   - Dale acceso a Editor del proyecto
5. Crea una clave JSON:
   - En la Service Account, ve a "Keys"
   - Crea una nueva clave de tipo JSON
   - Descargala (la necesitarás en n8n)

### 2. Instalar y Configurar n8n

#### Opción A: Docker (Recomendado)
```bash
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8napp/n8n
```

Luego accede a: http://localhost:5678

#### Opción B: NPM
```bash
npm install n8n -g
n8n start
```

### 3. Configurar Credenciales en n8n

1. En n8n, ve a **Credentials** (lado izquierdo)
2. Click **New Credential** → "Google Sheets"
3. Pega el contenido del JSON descargado
4. Guarda como: `Google Sheets Service Account`

### 4. Crear el Workflow en n8n

1. Click **New Workflow**
2. Busca y agrega el nodo inicial: **Webhook**
   - Path: `/speak-activity`
   - Authentication: None
   - HTTP Method: POST

3. Agrega nodo **Google Sheets**:
   - Credencial: `Google Sheets Service Account`
   - Operation: "Append or insert rows"
   - Spreadsheet ID: [verás cómo obtenerlo abajo]
   - Sheet: El nombre de la hoja (ej: "Actividades")
   - Columns to send:
     ```
     Tipo: activityType
     Nombre: activityName
     Estudiante: studentName
     Email: studentEmail
     Nivel: studentLevel
     Fecha: completedAt
     Duración (min): {{ $json.duration_seconds / 60 }}
     Respuestas: studentResponses
     Feedback: feedbacks
     Calificación: averageRating
     Progreso %: progressPercentage
     ```

4. Connect Webhook → Google Sheets
5. Click **Save**
6. En el Webhook, copia tu **Webhook URL**: 
   ```
   https://[tu-n8n-url]/webhook/speak-activity
   ```

### 5. Configurar Variable de Entorno

En tu aplicación Next.js (`.env.local`):
```env
N8N_WEBHOOK_URL=https://[tu-n8n-url]/webhook/speak-activity
```

### 6. Crear Google Sheets por Grupo

Para cada grupo creado por un profesor:

1. Crear un nuevo Google Sheet
2. Compartir con el profesor (si está usando su cuenta personal)
3. Obtener el Spreadsheet ID de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

**Actualización de base de datos:**
Guardar el Spreadsheet ID en la tabla `groups`:
```sql
ALTER TABLE groups ADD COLUMN google_sheet_id VARCHAR(255);
-- Luego asignar el ID a cada grupo
UPDATE groups SET google_sheet_id = 'xxx' WHERE id = 'yyy';
```

O en db.json (si usas JSON):
```json
{
  "groups": [
    {
      "id": "group-123",
      "teacher_id": "teacher-456",
      "name": "Mi Grupo A2",
      "google_sheet_id": "1A2B3C4D5E6F...",
      ...
    }
  ]
}
```

### 7. Dónde Llamar al Evento en el Frontend

En `components/MissionScreen.tsx`, cuando la misión se completa:

```typescript
// Cuando mission_completed = true
if (data.mission_completed) {
  // Registrar en n8n
  await fetch('/api/events/activity-completed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activityType: 'mission',
      activityId: mission.id,
      activityName: mission.title,
      studentId: user?.id,
      studentEmail: user?.email,
      studentName: user?.full_name,
      studentLevel: user?.cefr_level || mission.cefr_level,
      groupId: group?.id, // necesitas pasar el grupo desde props
      groupName: group?.name,
      completedAt: new Date().toISOString(),
      duration_seconds: Math.floor((Date.now() - startTime) / 1000),
      studentResponses: messages
        .filter(m => m.role === 'user')
        .map(m => m.content),
      aiResponses: messages
        .filter(m => m.role === 'assistant')
        .map(m => m.content),
      feedbacks: messages
        .filter(m => m.feedback)
        .map(m => m.feedback),
      ratings: messages
        .filter(m => m.rating)
        .map(m => m.rating),
      averageRating: messages.length > 0 
        ? messages.filter(m => m.rating).reduce((a, b) => a + (b.rating || 0), 0) / 
          messages.filter(m => m.rating).length
        : 0,
      progressPercentage: data.progress || 100,
      isCompleted: true
    })
  })
}
```

## Estructura del Google Sheet

El Sheet se crear con estas columnas:
| Tipo | Nombre | Estudiante | Email | Nivel | Fecha | Duración (min) | Respuestas | Feedback | Calificación | Progreso % |
|------|--------|-----------|-------|-------|-------|---|----------|----------|---|---|

## Troubleshooting

### El webhook no recibe datos
- Verifica la URL de n8n en `.env.local`
- Asegúrate de que n8n está corriendo
- Revisa los logs de n8n en la consola

### No aparecen datos en Google Sheets
- Verifica que el Spreadsheet ID sea correcto
- Asegúrate de que la Service Account tiene acceso al Sheet
- Comparte el Sheet con el email de la Service Account

### Errores de CORS
- n8n necesita permitir solicitudes desde tu dominio Next.js
- Configura CORS en n8n si es necesario

## Integración en Producción

Para producción (con n8n alojado):
1. Usa n8n Cloud: https://n8n.cloud/
2. O despliega n8n en un servidor (Railway, Render, etc.)
3. Usa servicios como Zapier como alternativa si prefieres

## Estructura de datos enviados a n8n

```typescript
{
  activityType: "mission" | "story" | "guide",
  activityId: string,
  activityName: string,
  studentId: string,
  studentEmail: string,
  studentName: string,
  studentLevel: "A1" | "A2" | "B1" | "B2" | "C1",
  groupId: string,
  groupName: string,
  completedAt: ISO8601 timestamp,
  duration_seconds: number,
  studentResponses: string[],   // Todas las respuestas del estudiante
  aiResponses: string[],        // Todas las respuestas del AI
  feedbacks: string[],          // Feedback brindado
  ratings: number[],            // Calificaciones 1-5
  averageRating: number,        // Promedio
  progressPercentage: number,   // 0-100
  isCompleted: boolean,
  comprehensibilityScore?: number,
  grammarScore?: number,
  lexicalRichnessScore?: number,
  xpAwarded?: number
}
```

---

**¿Necesitas ayuda?** Este sistema está diseñado para ser flexible. Puedes:
- Modificar las columnas del Sheet según necesites
- Agregar más filtros o transformaciones en n8n
- Conectar a otras herramientas (Slack, email, etc.)
