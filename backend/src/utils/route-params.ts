import type { Request } from 'express'
import { HttpError } from './http-error.ts'

/* Obligatorio, si no esta, la peticion es incorrecta */
export function routeParam(req: Request, name: string): string {
  const value = req.params[name]
  if (typeof value !== 'string' || value === '') {
    throw new HttpError(400, `Parámetro ${name} requerido`)
  }
  return value
}

/* Query param de texto; devuelve null si falta o viene vacío. */
export function queryString(req: Request, name: string): string | null {
  const value = req.query[name]
  return typeof value === 'string' && value !== '' ? value : null
}

/* Query param entero; devuelve `fallback` si falta o no es un número válido. */
export function queryInt(req: Request, name: string, fallback = 0): number {
  const raw = queryString(req, name)
  if (raw === null) return fallback
  const value = Number.parseInt(raw, 10)
  return Number.isFinite(value) ? value : fallback
}
