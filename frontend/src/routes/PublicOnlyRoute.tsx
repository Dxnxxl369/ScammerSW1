import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (usuario) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
