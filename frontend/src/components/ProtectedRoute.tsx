import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/hooks/useAuth'

/**
 * Guardia de rutas del SPA (sustituye al middleware de Next.js).
 *
 * Mientras la sesión se resuelve muestra un spinner: redirigir antes de saber
 * si hay sesión expulsaría al usuario al login en cada recarga.
 */
export function ProtectedRoute({ teacherOnly = false }: { teacherOnly?: boolean }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (teacherOnly && user.role !== 'teacher') return <Navigate to="/missions" replace />

  return <Outlet />
}
