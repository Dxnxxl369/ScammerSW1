import { supabase } from '../utils/supabase'
import { api } from './api'
import type { Usuario, DatosRegistro, DatosLogin, ResultadoAuth, RespuestaApi } from '../types/auth'

export const authService = {
  async registrar(datos: DatosRegistro): Promise<ResultadoAuth> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: datos.correo,
      password: datos.password,
      options: { data: { nombre_usuario: datos.nombre_usuario } },
    })

    if (authError) {
      const mensaje = authError.message.toLowerCase().includes('invalid')
        ? 'El correo electrónico no es válido o no está permitido por el proveedor de autenticación.'
        : authError.message
      return { exito: false, error: { codigo: 'SUPABASE_ERROR', mensaje } }
    }

    if (!authData.session) {
      return { exito: true, datos: { mensaje: 'Verifica tu correo para activar la cuenta' } }
    }

    try {
      const response = await api.post<RespuestaApi<Usuario>>('/auth/registro/', {
        correo: datos.correo,
        nombre_usuario: datos.nombre_usuario,
        nombre_completo: datos.nombre_completo,
        pais: datos.pais || 'BO',
      })
      return { exito: true, datos: response.data.datos }
    } catch (error: any) {
      await supabase.auth.signOut()
      const errorData = error.response?.data?.error
      return {
        exito: false,
        error: errorData || { codigo: 'BACKEND_ERROR', mensaje: 'No se pudo completar el registro' },
      }
    }
  },

  async iniciarSesion(datos: DatosLogin): Promise<ResultadoAuth> {
    const { error } = await supabase.auth.signInWithPassword({
      email: datos.correo,
      password: datos.password,
    })

    if (error) {
      return { exito: false, error: { codigo: 'CREDENCIALES_INVALIDAS', mensaje: 'Correo o contraseña incorrectos' } }
    }

    try {
      const response = await api.get<RespuestaApi<Usuario>>('/auth/yo/')
      return { exito: true, datos: response.data.datos }
    } catch {
      return { exito: false, error: { codigo: 'NO_REGISTRADO', mensaje: 'Debe completar el registro' } }
    }
  },

  async cerrarSesion(): Promise<void> {
    await supabase.auth.signOut()
  },

  async obtenerSesionActual(): Promise<Usuario | null> {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
    try {
      const response = await api.get<RespuestaApi<Usuario>>('/auth/yo/')
      return response.data.datos || null
    } catch {
      return null
    }
  },

  async actualizarPerfil(datos: Partial<Usuario>): Promise<ResultadoAuth> {
    try {
      const response = await api.patch<RespuestaApi<Usuario>>('/auth/yo/', datos)
      return { exito: true, datos: response.data.datos }
    } catch (error: any) {
      return {
        exito: false,
        error: error.response?.data?.error || { codigo: 'ERROR', mensaje: 'No se pudo actualizar' },
      }
    }
  },

  async recuperarPassword(correo: string): Promise<ResultadoAuth> {
    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/recuperar-password/confirmar`,
    })
    if (error) {
      return { exito: false, error: { codigo: 'ERROR', mensaje: error.message } }
    }
    return { exito: true }
  },
}
