import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/ui'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    )
  }

  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.rol !== 'administrador') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
