import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAnonimo } from '../hooks/useAnonimo'
import { Button } from './ui'

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, cerrarSesion } = useAuth()
  const { anonimo, intentosRestantes } = useAnonimo()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-slate-900">SW1 Proyecto</Link>
          <nav className="flex items-center gap-4">
            {usuario ? (
              <>
                {usuario.rol === 'administrador' && (
                  <Link to="/admin" className="text-sm font-medium text-indigo-600">Admin</Link>
                )}
                <Link to="/dashboard" className="text-sm text-slate-700 hover:text-slate-900">Dashboard</Link>
                <Link to="/perfil" className="text-sm text-slate-700 hover:text-slate-900">Perfil</Link>
                <span className="text-sm text-slate-600">{usuario.nombre_usuario}</span>
                <Button variant="ghost" size="sm" onClick={cerrarSesion}>Cerrar sesión</Button>
              </>
            ) : (
              <>
                {anonimo && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-md font-medium ${
                      intentosRestantes === 0
                        ? 'bg-red-100 text-red-700'
                        : intentosRestantes === 1
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {intentosRestantes} / 3 intentos disponibles
                    </span>
                  </div>
                )}
                <Link to="/login"><Button variant="ghost" size="sm">Iniciar sesión</Button></Link>
                <Link to="/registro"><Button size="sm">Registrarse</Button></Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">© 2026 SW1 Proyecto Grupal</div>
      </footer>
    </div>
  )
}
