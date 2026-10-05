/**
 * Tests del historial de actividad diaria.
 *
 * Las respuestas se insertan con fechas conocidas en lugar de pasar por el
 * envío (que depende de la IA): así se comprueba el agrupado por día, el
 * recuento sin repetir misión y el efecto de la zona horaria.
 */
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.ts'
import { db } from '../src/db/client.ts'
import { responses, type ResponseStatus } from '../src/db/schema.ts'
import { resetDb } from './helpers/db.ts'
import { createMission, signupActor, type Actor } from './helpers/fixtures.ts'

const app = createApp()

/** Inserta una respuesta con fecha y estado concretos. */
async function addResponse(
  student: Actor,
  missionId: string,
  submittedAt: string,
  status: ResponseStatus,
  seconds = 60,
): Promise<void> {
  await db.insert(responses).values({
    id: randomUUID(),
    mission_id: missionId,
    student_id: student.id,
    text_content: 'Hello, this is a test response.',
    input_mode: 'text',
    transcript: null,
    time_taken_seconds: seconds,
    submitted_at: new Date(submittedAt),
    status,
  })
}

beforeEach(async () => {
  await resetDb()
})

describe('GET /api/students/:id/activity', () => {
  it('exige sesión', async () => {
    const res = await request(app).get(
      '/api/students/quien-sea/activity?from=2026-03-01&to=2026-03-31',
    )
    expect(res.status).toBe(401)
  })

  it('un alumno no puede ver la actividad de otro', async () => {
    const student = await signupActor(app, 'student')
    const other = await signupActor(app, 'student')

    const res = await other.agent.get(
      `/api/students/${student.id}/activity?from=2026-03-01&to=2026-03-31`,
    )
    expect(res.status).toBe(403)
  })

  it('valida las fechas', async () => {
    const student = await signupActor(app, 'student')
    const base = `/api/students/${student.id}/activity`

    expect((await student.agent.get(base)).status).toBe(400)
    expect((await student.agent.get(`${base}?from=10-03-2026&to=2026-03-31`)).status).toBe(400)
    expect((await student.agent.get(`${base}?from=2026-03-31&to=2026-03-01`)).status).toBe(400)
    expect((await student.agent.get(`${base}?from=2025-01-01&to=2026-03-01`)).status).toBe(400)
  })

  it('agrupa por día sin repetir misión completada', async () => {
    const student = await signupActor(app, 'student')
    const missionA = await createMission({ cefr_level: 'A2' })
    const missionB = await createMission({ cefr_level: 'A2' })

    // Dos envíos de la misma misión el mismo día: una misión, dos intentos.
    await addResponse(student, missionA, '2026-03-10T09:00:00Z', 'completed', 100)
    await addResponse(student, missionA, '2026-03-10T10:00:00Z', 'completed', 200)
    await addResponse(student, missionB, '2026-03-10T11:00:00Z', 'completed', 300)
    // Un intento que no llegó al umbral: suma intentos, no misiones.
    await addResponse(student, missionA, '2026-03-11T09:00:00Z', 'in_progress', 50)
    // Fuera del rango pedido: no debe aparecer.
    await addResponse(student, missionB, '2026-02-01T09:00:00Z', 'completed', 10)

    const res = await student.agent.get(
      `/api/students/${student.id}/activity?from=2026-03-10&to=2026-03-11&tz=UTC`,
    )

    expect(res.status).toBe(200)
    expect(res.body.activity).toEqual([
      { date: '2026-03-10', missions: 2, attempts: 3, seconds: 600 },
      { date: '2026-03-11', missions: 0, attempts: 1, seconds: 50 },
    ])
  })

  it('usa la zona horaria del cliente para decidir el día', async () => {
    const student = await signupActor(app, 'student')
    const mission = await createMission({ cefr_level: 'A2' })
    // 02:00 UTC del día 11 son las 21:00 del día 10 en Bogotá.
    await addResponse(student, mission, '2026-03-11T02:00:00Z', 'completed')

    const enUtc = await student.agent.get(
      `/api/students/${student.id}/activity?from=2026-03-01&to=2026-03-31&tz=UTC`,
    )
    const enBogota = await student.agent.get(
      `/api/students/${student.id}/activity?from=2026-03-01&to=2026-03-31&tz=America/Bogota`,
    )

    expect(enUtc.body.activity[0].date).toBe('2026-03-11')
    expect(enBogota.body.activity[0].date).toBe('2026-03-10')
  })

  it('con una zona horaria inválida responde igual (sin romperse)', async () => {
    const student = await signupActor(app, 'student')
    const res = await student.agent.get(
      `/api/students/${student.id}/activity?from=2026-03-01&to=2026-03-31&tz=No/Existe`,
    )
    expect(res.status).toBe(200)
  })
})
