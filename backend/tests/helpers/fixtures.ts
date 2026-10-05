/**
 * Helpers de los tests de integración: actores autenticados y contenido.
 */
import request from 'supertest'
import type { Express } from 'express'
import { randomUUID } from 'node:crypto'
import { db } from '../../src/db/client.ts'
import { missions } from '../../src/db/schema.ts'

export const TEST_PASSWORD = 'contrasena-segura'

export interface Actor {
  id: string
  email: string
  agent: ReturnType<typeof request.agent>
}

/** Crea una cuenta y devuelve un agente con su cookie de sesión. */
export async function signupActor(
  app: Express,
  role: 'student' | 'teacher',
  overrides: { email?: string; full_name?: string; cefr_level?: string } = {},
): Promise<Actor> {
  const email = overrides.email ?? `${role}-${randomUUID()}@vox.test`
  const agent = request.agent(app)

  const response = await agent.post('/api/auth/signup').send({
    email,
    password: TEST_PASSWORD,
    full_name: overrides.full_name ?? (role === 'teacher' ? 'Docente Prueba' : 'Alumno Prueba'),
    role,
    cefr_level: role === 'student' ? (overrides.cefr_level ?? 'B1') : undefined,
  })

  if (response.status !== 201) {
    throw new Error(`signup falló: ${response.status} ${JSON.stringify(response.body)}`)
  }

  return { id: response.body.user.id, email: response.body.user.email, agent }
}

export async function createMission(
  overrides: Partial<typeof missions.$inferInsert> = {},
): Promise<string> {
  const id = overrides.id ?? `mission-${randomUUID()}`

  await db.insert(missions).values({
    id,
    title: 'Presentarse en una entrevista',
    description: 'Descripción de prueba',
    objective: 'Introduce yourself: say your name and where you are from.',
    scene_context: 'A job interview in London',
    character_name: 'Alex',
    cefr_level: 'B1',
    base_duration_seconds: 120,
    ...overrides,
  })

  return id
}

export async function createGroup(app: Express, teacher: Actor, name = 'Grupo Prueba') {
  const response = await teacher.agent
    .post('/api/teachers/groups/create')
    .send({ name, institution_name: 'Colegio Letoura', parental_consent_confirmed: true })

  if (response.status !== 201) {
    throw new Error(`createGroup falló: ${response.status} ${JSON.stringify(response.body)}`)
  }

  return response.body as { id: string; access_code: string; name: string }
}
