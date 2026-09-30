import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // El navegador sólo habla con Vite: /api se reenvía al backend. Al ser
    // mismo origen, la cookie HttpOnly de sesión viaja sin CORS ni ajustes.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: false,
        // Si el backend está caído o reiniciándose, el proxy devolvía un 502
        // SIN cuerpo y el frontend reventaba al parsearlo. Se responde JSON
        // para que el error llegue como un mensaje normal de la API.
        configure: proxy => {
          proxy.on('error', (error, _req, res) => {
            console.error('[proxy] El backend no respondió:', error.message)
            if ('writeHead' in res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'El servidor no está disponible' }))
            }
          })
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
