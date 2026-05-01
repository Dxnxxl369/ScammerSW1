import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../utils/supabase'
import { authService } from '../services/authService'
import { anonimoService } from '../services/anonimoService'
import type { Usuario, Anonimo, DatosRegistro, DatosLogin, ResultadoAuth } from '../types/auth'

interface AuthContextType {
  usuario: Usuario | null
  anonimo: Anonimo | null
  cargando: boolean
  registrar: (datos: DatosRegistro) => Promise<ResultadoAuth>
  iniciarSesion: (datos: DatosLogin) => Promise<ResultadoAuth>
  cerrarSesion: () => Promise<void>
  actualizarPerfil: (datos: Partial<Usuario>) => Promise<ResultadoAuth>
  recargarUsuario: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [anonimo, setAnonimo] = useState<Anonimo | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarSesion = async () => {
    setCargando(true)
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      const usuarioData = await authService.obtenerSesionActual()
      if (usuarioData) {
        setUsuario(usuarioData)
        setAnonimo(null)
        anonimoService.borrarCookie()
      }
    } else {
      const anonimoData = await anonimoService.asegurarSesion()
      setAnonimo(anonimoData)
      setUsuario(null)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarSesion()
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUsuario(null)
        cargarSesion()
      }
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  const registrar = async (datos: DatosRegistro) => {
    const idAnonimoPrevio = anonimoService.obtenerDeCookie()
    const resultado = await authService.registrar(datos)
    if (resultado.exito && resultado.datos && 'id_supabase' in resultado.datos) {
      if (idAnonimoPrevio) console.log(`[migracion] Anónimo ${idAnonimoPrevio} → Usuario registrado`)
      setUsuario(resultado.datos as Usuario)
      setAnonimo(null)
      anonimoService.borrarCookie()
    }
    return resultado
  }

  const iniciarSesion = async (datos: DatosLogin) => {
    const resultado = await authService.iniciarSesion(datos)
    if (resultado.exito && resultado.datos) {
      setUsuario(resultado.datos as Usuario)
      setAnonimo(null)
      anonimoService.borrarCookie()
    }
    return resultado
  }

  const cerrarSesion = async () => {
    await authService.cerrarSesion()
    setUsuario(null)
    await cargarSesion()
  }

  const actualizarPerfil = async (datos: Partial<Usuario>) => {
    const resultado = await authService.actualizarPerfil(datos)
    if (resultado.exito && resultado.datos) setUsuario(resultado.datos as Usuario)
    return resultado
  }

  const recargarUsuario = async () => {
    const usuarioData = await authService.obtenerSesionActual()
    if (usuarioData) setUsuario(usuarioData)
  }

  return (
    <AuthContext.Provider value={{ usuario, anonimo, cargando, registrar, iniciarSesion, cerrarSesion, actualizarPerfil, recargarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
