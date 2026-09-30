/**
 * Configuración de Vitest para los tests de integración del backend.
 *
 * Los tests usan una base de datos propia (`vox_test`) y la vacían entre
 * casos, por eso se ejecutan en serie (`fileParallelism: false`): dos ficheros
 * en paralelo se pisarían los datos.
 *
 * La BD de test se prepara una vez con:
 *   npm run db:push:test -w @vox/backend
 */
import { defineConfig } from 'vitest/config'

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://postgres@127.0.0.1:5432/vox_test'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      JWT_SECRET: 'test-jwt-secret-de-al-menos-32-caracteres',
      OPENROUTER_API_KEY: '',
      ADMIN_EMAILS: 'admin@vox.test',
    },
  },
})
