export interface Usuario {
  id: string
  id_supabase: string
  correo: string
  nombre_usuario: string
  nombre_completo: string | null
  rol: 'administrador' | 'usuario'
  plan: 'gratis' | 'pro'
  pais: string
  activo: boolean
  bloqueado: boolean
  intentos_usados: number
  fecha_creacion: string
}

export interface Anonimo {
  id: string
  id_sesion: string
  ip: string | null
  navegador: string | null
  pais: string | null
  intentos_usados: number
  fecha_creacion: string
  fecha_expiracion: string
}

export interface DatosRegistro {
  correo: string
  password: string
  nombre_usuario: string
  nombre_completo?: string
  pais?: string
}

export interface DatosLogin {
  correo: string
  password: string
}

export type ResultadoAuth =
  | { exito: true; datos?: any }
  | { exito: false; error: { codigo: string; mensaje: string } }

export interface RespuestaApi<T = any> {
  exito: boolean
  datos?: T
  mensaje?: string
  error?: {
    codigo: string
    mensaje: string
  }
}
