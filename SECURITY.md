# Seguridad de VOX

Documento único de referencia. Sustituye a los anteriores `SECURITY_*`, `README_SECURITY`
y `START_HERE_SEGURIDAD`.

---

## 1. Autenticación

**Implementación:** `frontend/lib/auth.ts`

- Registro y login con email/contraseña.
- Hash de contraseña con `bcryptjs` (cost 12).
- JWT firmado con `JWT_SECRET` (`jose`, HS256), expiración 7 días.
- La sesión se entrega en una **cookie HttpOnly + SameSite=Lax** con `Secure`
  cuando `NODE_ENV=production`. La clave no se expone nunca al JavaScript
  del cliente.
- Logout limpia la cookie (`clearCookieOptions`).

```typescript
// lib/auth.ts
createSessionToken(user)   -> firma
getSessionFromRequest(req) -> payload | null
sessionCookieOptions()     // HttpOnly, SameSite, Secure en producción
```

---

## 2. Autorización en páginas y rutas

**Implementación:** `frontend/middleware.ts`

- Valida el JWT de la cookie en cada request.
- Sin token válido → redirect a `/login` (páginas) o `401` (`/api/*`).
- **No inyecta headers `x-user-*`**: el frontend nunca es la fuente de identidad.

---

## 3. Autorización en cada endpoint (fuente de verdad)

**Implementación:** `frontend/lib/session.ts`

Toda ruta de la API de datos debe empezar con uno de los guards. Ninguna lee
`x-user-id` / `x-user-role` de las headers.

```typescript
type SessionResult = SessionPayload | NextResponse

requireUser(req): SessionResult            // cualquier sesión válida
requireTeacher(req): SessionResult         // sólo rol teacher
ownsResource(dbId, payload, ['teacher'])   // propiedad/rol del recurso
isAuthFailure(result)                      // 401/403 -> devolver directo
```

Patrón obligatorio en cada ruta:

```typescript
export async function GET(req: NextRequest) {
  const session = await requireUser(req)
  if (isAuthFailure(session)) return session

  // session es SessionPayload -> session.id, session.email, session.role
}
```

Todas las rutas de `frontend/app/api/` (28) cumplen este patrón.

---

## 4. Control de acceso a recursos (IDOR)

Toda consulta por ID **filtra por el propietario** en servidor; el `id` del
path no basta.

Ejemplos implementados:

| Ruta | Comprobación |
|------|--------------|
| `GET/PUT /api/evaluations/[id]` | `ownsResource(eval.userId, session, ['teacher'])` |
| `GET/POST /api/responses/[id]` | `ownsResource(resp.userId, session, ['teacher'])` |
| `GET /api/guides/[id]` | guía pública, pero el progreso se lee por `session.id` |
| `POST /api/missions/[id]/submit` | la respuesta se escribe con `userId = session.id` |
| `GET /api/admin/metrics` | `session.email ∈ ADMIN_EMAILS` (allowlist) |
| `/api/teachers/*` | `requireTeacher` |
| `/api/students/*` | `requireUser` + `session.id` como identidad |

No se confía en ningún parámetro `userId` enviado por el cliente.

---

## 5. Modelo de amenazas / controles

| Amenaza | Control |
|---------|---------|
| Sesión falsificada | JWT firmado + verificación en middleware y en cada ruta |
| Suplantación de identidad (`x-user-*`) | Headers eliminadas; identidad sale de la cookie |
| IDOR / escalada de privilegios | Filtro por propietario + `requireTeacher` en servidor |
| SQL injection | Drizzle/Postgres: consultas parametrizadas siempre; JSON: sin SQL |
| XSS | React (escape por defecto) + CSP y headers de `next.config.js` |
| CSRF | SameSite=Lax + validación de origen en mutation |
| Fuga de secretos | Todo en `.env.local` (gitignored); ninguna clave versionada |
| Contraseñas débiles | `bcryptjs` cost 12; validación de email y longitud |

**Headers de seguridad** — `frontend/next.config.js`, aplicados a `/api/*`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

No hay todavía CSP, `Strict-Transport-Security` ni `Referrer-Policy`
(ver §8).

---

## 6. Configuración

### Variables

Plantilla: `frontend/.env.example`. Ver `README.md → Variables de entorno`.

- `.env`, `.env.local` están en `.gitignore`.
- **Ninguna credencial está en el repositorio.** Verificación:
  ```bash
  git grep -nE "(sk-or-v1|sk-ant|eyJhbGciOi.*\.|service_role)"
  ```

### Rotación de credenciales

Antes de publicar, rota manualmente las claves que pudieron haberse filtrado
en documentación histórica:

1. **OpenRouter**: `https://openrouter.ai/settings/keys`
2. `JWT_SECRET`: generar uno nuevo con `openssl rand -hex 32` (invalida todas
   las sesiones activas — esperado)
3. **PostgreSQL**: si `DATABASE_URL` llegó a versionarse, cambiar la contraseña
   del rol y actualizar el `DATABASE_URL`

---

## 7. Verificación

```bash
cd frontend
npx tsc --noEmit
npx next lint
```

Comprobaciones manuales:

| Caso | Esperado |
|------|----------|
| `GET /api/missions` sin cookie | `401` |
| `GET /api/missions` con JWT inválido | `401` |
| `GET /api/evaluations/<id-otro-usuario>` | `403` |
| `GET /api/admin/metrics` con alumno | `403` |
| `GET /api/admin/metrics` con `ADMIN_EMAILS` | `200` |
| Página `/missions` sin cookie | redirect a `/login` |

> Verificado el 29/09/2026 contra el dev server: las 14 comprobaciones de
> autenticación, IDOR y control de roles pasan. Las incidencias observadas
> eran de datos, no de autorización — ver §8.
>
> **Re-verificado el 29/09/2026 tras migrar a PostgreSQL/Drizzle**: suite de
> 51 comprobaciones E2E (registro/login/logout, misiones, guías, filtros,
> asignación de misiones, unión a grupos, propiedad de recursos, control de
> roles, claves foráneas) — 51/51 en verde.

---

## 8. Deuda técnica conocida

| Elemento | Estado |
|----------|--------|
| Sin rate limiting | Los endpoints de auth y de IA (`/api/chat`, `guides/[id]/chat`) pueden ser abusados. Añadir en el borde (Vercel WAF / `@upstash/ratelimit`) antes de producción. |
| Alta de `teacher` abierta | Cualquiera puede registrarse como docente en `/signup`. Requiere código de invitación o aprobación. |
| Headers incompletos | Falta CSP, `Strict-Transport-Security` y `Referrer-Policy` (ver §5). |
| Sin rotación automática de claves | Ver §6. |
| **Autorización sólo a nivel de API** | El backend se conecta a PostgreSQL con un único rol compartido: la base de datos no puede distinguir estudiantes, así que ninguna política a nivel de BD puede impedir que un proceso comprometido lea filas ajenas. El aislamiento real lo garantiza hoy `lib/session.ts` (guards + propiedad del recurso) en cada ruta. Solución a medio plazo: rol/`SET ROLE` por usuario o row-level security. |
| **Mitad del modelo sigue en JSON** | `groups`, `group_members`, `mission_assignments`, `responses` y `evaluations` viven en `db.json`, escrito completo y sin transacciones. Rotar la API key no basta aquí: en Vercel el filesystem es efímero (ver README). |
