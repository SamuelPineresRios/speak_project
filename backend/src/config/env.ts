/**
 * Configuración de entorno del backend.
 *
 * Se valida al importar el módulo: si falta una variable obligatoria el proceso
 * muere al arrancar con un mensaje concreto, en lugar de fallar más tarde con
 * un error confuso en mitad de una petición.
 */

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia backend/.env.example a ` +
        'backend/.env.local y rellénala.',
    )
  }
  return value
}

const nodeEnv = process.env.NODE_ENV ?? 'development'

function parsePort(value: string | undefined): number {
  const port = Number(value ?? 4000)
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT no es un puerto válido: ${value}`)
  }
  return port
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: parsePort(process.env.PORT),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  /**
   * Opcional: mientras esté vacía, las rutas que llaman al proveedor de IA
   * responden 503 (`Servicio de IA no configurado`) en lugar de reventar.
   */
  anthropicApiKey: process.env.ANTHROPIC_API_KEY?.trim() || null,
  /** Modelo de Claude; por defecto Haiku 4.5 con snapshot fijado. */
  anthropicModel: process.env.ANTHROPIC_MODEL?.trim() || null,
  /** Emails con acceso a las métricas de administración (minúsculas). */
  adminEmails: (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
}
