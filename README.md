# SPEAK MVP — Sin Base de Datos Externa

Plataforma de aprendizaje de inglés donde escribir es el único camino para avanzar.  
**Esta versión no usa Supabase ni ninguna base de datos externa.** Todo se persiste en un archivo `data/db.json` local.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend + API | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Base de datos | Archivo JSON local (`data/db.json`) |
| Autenticación | JWT con `jose` + cookies HttpOnly (sin Supabase) |
| Evaluación LLM | FastAPI + LangChain + Claude claude-sonnet-4-20250514 |
| Despliegue | Vercel (Next.js) + Railway (FastAPI) |

---

## Cómo funciona la base de datos JSON

```
frontend/
└── data/
    ├── seed_missions.json   ← misiones iniciales (se carga una vez)
    └── db.json              ← se crea automáticamente al primer uso
```

`lib/db.ts` expone funciones simples:

```typescript
const db = readDB()          // leer todo
db.users.push(newUser)       // modificar
writeDB(db)                  // persistir
```

Todas las "queries" son arrays de JavaScript: `Array.filter`, `Array.find`, `Array.sort`.  
No hay ORM, no hay SQL, no hay conexión a internet para los datos.

---

## Setup Local (3 pasos)

### 1. Clonar e instalar

```bash
git clone https://github.com/yourorg/speak-mvp-json
cd speak-mvp-json/frontend
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
# Solo necesitas cambiar JWT_SECRET si vas a producción
```

### 3. Arrancar

```bash
npm run dev
# Abre http://localhost:3000
# El archivo data/db.json se crea automáticamente con las 15 misiones
```

¡Listo! No necesitas configurar ningún servicio externo para correr la app.

---

## Variables de Entorno

### `frontend/.env.local`

```env
# JWT Secret — cambiar en producción (usa una cadena aleatoria larga)
JWT_SECRET=speak-dev-secret-change-in-production-32chars

# URL del servicio de evaluación (FastAPI)
# Si no tienes el servicio corriendo, las misiones igual funcionan con feedback de fallback
EVALUATION_SERVICE_URL=http://localhost:8000

# Admin (para /api/admin/metrics)
ADMIN_EMAILS=tu@email.com
```

### `evaluation_service/.env`

```env
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Evaluation Service (Opcional)

El servicio de evaluación usa Claude para dar feedback real. Sin él, la app funciona con un mensaje de fallback genérico.

```bash
cd evaluation_service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # agregar ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

---

## Estructura del JSON (db.json)

```json
{
  "users": [...],
  "missions": [...],
  "responses": [...],
  "evaluations": [...],
  "groups": [...],
  "group_members": [...],
  "mission_assignments": [...],
  "narrative_states": [...],
  "weekly_aggregates": [...]
}
```

Para resetear todos los datos: `rm frontend/data/db.json` y reiniciar el servidor.  
Para ver los datos en cualquier momento: abre `frontend/data/db.json` en cualquier editor.

---

## Autenticación

- Registro y login vía email/contraseña (bcrypt)
- Sesión guardada en cookie HttpOnly con JWT firmado
- Middleware de Next.js verifica el JWT en cada request protegido
- Sin OAuth en esta versión (se puede agregar con NextAuth.js si se necesita)

---

## Roles

| Rol | Acceso |
|-----|--------|
| `student` | Misiones, feedback, resumen de sesión, unirse a grupos |
| `teacher` | Dashboard, crear grupos, asignar misiones, ver progreso |

---

## Limitaciones conocidas de la versión JSON

| Limitación | Impacto | Solución si escala |
|------------|---------|-------------------|
| Un solo proceso puede escribir a la vez | En Vercel serverless, cada función es independiente — puede haber conflictos de escritura con muchos usuarios simultáneos | Migrar a Supabase/PostgreSQL o usar un KV store (Redis, Vercel KV) |
| Sin realtime push | El dashboard docente hace polling cada 10s | Sin impacto para piloto. Para producción: Supabase Realtime o Server-Sent Events |
| Archivo crece con el tiempo | Sin paginación en db.json | Para > 1000 usuarios, migrar a DB real |

**Esta versión es ideal para:** pilotos institucionales con < 200 usuarios, demostraciones, desarrollo local.

---

## Despliegue en Vercel

```bash
npm install -g vercel
cd frontend
vercel --prod
```

Variables en Vercel Dashboard:
- `JWT_SECRET` → cadena aleatoria segura
- `EVALUATION_SERVICE_URL` → URL de Railway
- `ADMIN_EMAILS`

**Nota importante en Vercel:** El filesystem de Vercel es efímero entre deploys. Para que `db.json` persista en producción, configura `EVALUATION_SERVICE_URL` apuntando a Railway, y usa Vercel KV o Supabase para los datos. Para desarrollo local, el archivo JSON funciona perfecto.

### Alternativa recomendada para producción con JSON: Railway

Railway mantiene el filesystem persistente entre deploys:

```bash
railway login && railway init && railway up
```

---

## Misiones incluidas (15)

A1: Pedir direcciones · Pedir ayuda en tienda · Saludar y presentarse  
A2: Reservar vuelo · Llamar al médico · Ordenar en restaurante · Pedir información de curso  
B1: Problema técnico · Check-in hotel · Presentarse en trabajo nuevo · Reportar vecindad  
B2: Negociar precio · Reclamar paquete · Cancelar suscripción · Describir accidente
