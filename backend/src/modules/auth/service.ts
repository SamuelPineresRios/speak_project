/**
 * Lógica de dominio del módulo de autenticación.
 *
 * Los handlers HTTP viven en `routes.ts`; aquí sólo está lo que no depende de
 * Express: acceso a datos, hash de contraseñas y reglas de alta de usuario.
 */
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from '../../db/client.ts'
import { UNIQUE_VIOLATION, sqlStateOf } from '../../db/errors.ts'
import { users } from '../../db/schema.ts'
import type { CefrLevel, UserRole } from '@vox/shared'
import { HttpError } from '../../utils/http-error.ts'

const BCRYPT_ROUNDS = 12

/** Columnas de usuario que se pueden exponer al cliente. */
const publicColumns = {
  id: users.id,
  email: users.email,
  role: users.role,
  full_name: users.full_name,
  cefr_level: users.cefr_level,
} as const

export interface SignupInput {
  email: string
  password: string
  full_name: string
  role: UserRole
  /** Sólo se aplica a estudiantes; para profesores siempre queda a null. */
  cefr_level: CefrLevel | null
}

export type PublicUser = {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  cefr_level: CefrLevel | null
}

/**
 * Verifica las credenciales y devuelve el usuario público, o null.
 *
 * Nunca devuelve `password_hash`: el campo se descarta aquí para que no pueda
 * viajar a una respuesta por despiste.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const [row] = await db
    .select({ ...publicColumns, password_hash: users.password_hash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!row) return null

  const valid = await bcrypt.compare(password, row.password_hash)
  if (!valid) return null

  const { password_hash: _passwordHash, ...user } = row
  return user
}

export async function findPublicUserById(id: string): Promise<PublicUser | null> {
  const [user] = await db.select(publicColumns).from(users).where(eq(users.id, id)).limit(1)
  return user ?? null
}

/**
 * Crea la cuenta.
 *
 * No se comprueba antes si el email existe: la restricción única sobre
 * `users.email` es la garantía real (la comprobación previa tiene una carrera
 * entre el SELECT y el INSERT). Un duplicado se traduce a 409.
 */
export async function registerUser(input: SignupInput): Promise<PublicUser> {
  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)

  try {
    const [user] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email: input.email,
        password_hash,
        role: input.role,
        full_name: input.full_name,
        cefr_level: input.role === 'student' ? (input.cefr_level ?? 'B1') : null,
        language_preference: 'es',
        created_at: new Date(),
      })
      .returning(publicColumns)

    if (!user) throw new Error('El INSERT de usuario no devolvió la fila creada')
    return user
  } catch (err) {
    if (sqlStateOf(err) === UNIQUE_VIOLATION) {
      throw new HttpError(409, 'Ya existe una cuenta con este email')
    }
    throw err
  }
}

export async function updateFullName(id: string, fullName: string): Promise<PublicUser | null> {
  const [user] = await db
    .update(users)
    .set({ full_name: fullName })
    .where(eq(users.id, id))
    .returning(publicColumns)

  return user ?? null
}
