# VOX

Plataforma de aprendizaje de inglés donde **escribir es el único camino para avanzar**.
Estudiantes completan misiones de conversación escritas, reciben evaluación de un LLM y
desbloquean guías de gramática; los docentes crean grupos, asignan misiones y siguen el progreso.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend + API | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Autenticación | JWT (`jose`) en cookie HttpOnly + `bcryptjs` |
| Base de datos 1 | **PostgreSQL local + Drizzle ORM** — usuarios, misiones, guías, estado narrativo |
| Base de datos 2 | **Archivo JSON local** (`frontend/data/db.json`) — respuestas, evaluaciones, grupos, progreso |
| Evaluación / chat LLM | OpenRouter (modelos Gemini) vía `frontend/lib/ai.ts` |
| Despliegue | Vercel |

> ⚠️ **La persistencia está dividida en dos almacenes.** Ver
> [Limitaciones conocidas](#limitaciones-conocidas).

---

## Estructura del repositorio

```
.
├── frontend/                 # Aplicación Next.js (aquí vive todo lo ejecutable)
│   ├── app/
│   │   ├── (auth)/           # /login, /signup
│   │   ├── (student)/        # /missions, /guides, /groups, /profile, /feedback...
│   │   ├── (teacher)/        # /dashboard, /group/...
│   │   └── api/              # Rutas de la API
│   ├── components/           # Componentes React
│   │   └── ui/               # Primitivas (button, card, tabs...)
│   ├── lib/
│   │   ├── ai.ts             # Cliente OpenRouter (único punto de llamada al LLM)
│   │   ├── auth.ts           # Firmado/verificación de JWT
│   │   ├── session.ts        # Guards de autorización para rutas de la API
│   │   ├── postgres.ts       # Cliente PostgreSQL (lazy, singleton)
│   │   ├── schema.ts         # Esquema Drizzle de las 4 tablas relacionales
│   │   ├── db.ts             # Acceso al archivo JSON
│   │   └── utils.ts          # Helpers compartidos (cn, CEFR, códigos...)
│   ├── data/
│   │   └── db.json           # Almacén JSON (se crea/usar en runtime)
│   ├── drizzle.config.ts     # Configuración de drizzle-kit
│   └── scripts/
│       └── seed.ts           # Migración puntual db.json -> PostgreSQL
├── scripts/                  # Utilidades de datos (no forman parte del build)
│   ├── lib/env.js            # Cargador de .env compartido
│   └── test_openrouter_connection.js
└── README.md
```

---

## Puesta en marcha

### 1. Instalar

```bash
cd frontend
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Ver [Variables de entorno](#variables-de-entorno).

### 3. Arrancar

```bash
npm run dev
# http://localhost:3000
```

---

## Variables de entorno

Plantilla: `frontend/.env.example`. **Ninguna** de estas variables está versionada.

| Variable | Obligatoria | Uso |
|----------|-------------|-----|
| `JWT_SECRET` | Sí | Firma de la cookie de sesión. `openssl rand -hex 32` |
| `DATABASE_URL` | Sí | PostgreSQL con las 4 tablas relacionales |
| `OPENROUTER_API_KEY` | Sí | Evaluación y chat con el tutor (`lib/ai.ts`) |
| `ADMIN_EMAILS` | No | Emails (separados por coma) permitidos en `/api/admin/metrics` |
| `NODE_ENV` | No | `development` \| `production` |

---

## Autenticación

- Registro y login con email/contraseña (`bcryptjs`, cost 12).
- Sesión en **cookie HttpOnly** con JWT firmado (7 días).
- `frontend/middleware.ts` valida el JWT y protege páginas + rutas `/api/*`.
- Además, **cada ruta de la API vuelve a validar la sesión** con
  `requireUser()` / `requireTeacher()` de `lib/session.ts`, y comprueba la
  propiedad del recurso antes de devolver datos. Ver `SECURITY.md`.

### Roles

| Rol | Acceso |
|-----|--------|
| `student` | Misiones, guías, feedback, resumen, grupos |
| `teacher` | Dashboard, crear grupos, asignar misiones, ver progreso |

---

## Base de datos

### PostgreSQL (`DATABASE_URL`)

Tablas: `users`, `missions`, `guides`, `narrative_states`.

Esquema: `frontend/lib/schema.ts` (Drizzle). Cliente: `frontend/lib/postgres.ts`.
Las claves JS se nombran **iguales que las columnas** (`cefr_level`,
`scene_context`, `cover_emoji`), así que la fila de la BD y el JSON de la API
son el mismo objeto y no hace falta capa de traducción.

**Puesta en marcha de la base:**

```bash
createdb vox                     # o desde pgAdmin
cd frontend
npx drizzle-kit push             # crea/actualiza las 4 tablas
node --env-file-if-exists=.env.local scripts/seed.ts   # db.json -> PostgreSQL
```

Se accede **siempre** desde `lib/postgres.ts`:

```typescript
import { getDb } from '@/lib/postgres'
import { missions } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const rows = await getDb().select().from(missions).where(eq(missions.id, id))
```

`lib/supabase.ts` y el paquete `@supabase/supabase-js` ya no existen.

> `scripts/seed.ts` es una **migración puntual**, no un seed diario. Una vez
> ejecutada, PostgreSQL es la fuente de verdad de esas 4 tablas y `db.json` ya
> no las contiene. Para reconstruirlas desde cero, recupera el `db.json`
> anterior desde el historial de git.

### Archivo JSON (`frontend/data/db.json`)

Colecciones: `responses`, `evaluations`, `groups`, `group_members`,
`mission_assignments`, `weekly_aggregates`, `guide_progress`,
`chat_messages`, `exercise_submissions`.

Se accede desde `lib/db.ts`:

```typescript
const db = readDB()
db.responses.push(newResponse)
writeDB(db)
```

Para resetear: `rm frontend/data/db.json` y reiniciar.

> No re-introduzcas `users`, `missions`, `guides` ni `narrative_states` en
> este archivo: ya viven en PostgreSQL.

---

## Limitaciones conocidas

| Limitación | Impacto | Solución |
|------------|---------|----------|
| **Dos almacenes a la vez**: auth/misiones/guías en PostgreSQL, pero grupos/evaluaciones en `db.json` | Un usuario creado en PostgreSQL no tiene fila en `db.json` si se resetea el archivo; algunos cruces leen de un almacén y escriben en otro | Unificar en PostgreSQL y eliminar `lib/db.ts` |
| `db.json` se lee y escribe completo | En Vercel el filesystem es efímero y las escrituras concurrentes pueden perderse | Migrar el resto de colecciones a PostgreSQL |
| Sin realtime | El dashboard docente refresca con polling | SSE o polling con caché |
| Alta de docentes abierta | Cualquiera puede registrarse como `teacher` | Invitación por código o aprobación |
| `narrative_states.group_id` no puede ser FK | Los grupos viven en `db.json`, así que ese apuntador no está protegido por integridad referencial | Migrar `groups`/`group_members` a PostgreSQL |

**Adecuado para:** pilotos institucionales pequeños, demos y desarrollo local.

---

## Scripts de datos

Todos viven en `scripts/` y comparten `scripts/lib/env.js` para leer `.env`.
No forman parte del build de Next.js.

| Script | Propósito |
|--------|-----------|
| `frontend/scripts/seed.ts` | Migración puntual `db.json` → PostgreSQL (ver [Base de datos](#base-de-datos)) |
| `test_openrouter_connection.js` | Smoke test de la API key de OpenRouter |

---

## Comandos

```bash
cd frontend
npm run dev      # desarrollo
npm run build    # build de producción
npm run start    # servir el build
npm run lint     # ESLint
npx tsc --noEmit # type-check
```

---

## Despliegue

```bash
cd frontend
npx vercel --prod
```

Variables en el dashboard de Vercel: las de la tabla anterior.

Ten en cuenta:

- **`DATABASE_URL` debe apuntar a un PostgreSQL accesible desde Vercel**
  (Neon, Supabase-Postgres, RDS...). `drizzle-kit push` se ejecuta una vez
  desde local, no en cada despliegue.
- El filesystem de Vercel es efímero: `db.json` no sirve como almacenamiento
  persistente en producción. Ver [limitaciones](#limitaciones-conocidas).
