import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Card, CardHeader, CardBody, Alert } from '../components/ui'
import { Layout } from '../components/Layout'

interface ErroresForm {
  correo?: string
  nombre_usuario?: string
  password?: string
  confirmar_password?: string
  general?: string
}

export function Registro() {
  const navigate = useNavigate()
  const { registrar } = useAuth()
  const [datos, setDatos] = useState({ correo: '', nombre_usuario: '', nombre_completo: '', password: '', confirmar_password: '' })
  const [errores, setErrores] = useState<ErroresForm>({})
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState<string | null>(null)

  const validar = (): boolean => {
    const nuevos: ErroresForm = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) nuevos.correo = 'Correo inválido'
    if (!/^[a-z0-9_]{3,30}$/.test(datos.nombre_usuario)) nuevos.nombre_usuario = 'Solo minúsculas, números y _ (3-30 caracteres)'
    if (datos.password.length < 8) nuevos.password = 'Mínimo 8 caracteres'
    else if (!/\d/.test(datos.password)) nuevos.password = 'Debe contener al menos un número'
    if (datos.password !== datos.confirmar_password) nuevos.confirmar_password = 'Las contraseñas no coinciden'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setExito(null)
    if (!validar()) return
    setCargando(true)
    const resultado = await registrar({
      correo: datos.correo,
      password: datos.password,
      nombre_usuario: datos.nombre_usuario,
      nombre_completo: datos.nombre_completo || undefined,
    })
    if (resultado.exito) {
      if (resultado.datos?.mensaje) setExito(resultado.datos.mensaje)
      else navigate('/dashboard')
    } else {
      setErrores({ general: resultado.error.mensaje })
    }
    setCargando(false)
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card>
          <CardHeader><h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errores.general && <Alert variant="error">{errores.general}</Alert>}
              {exito && <Alert variant="success">{exito}</Alert>}
              <Input label="Nombre completo" value={datos.nombre_completo}
                onChange={(e) => setDatos({ ...datos, nombre_completo: e.target.value })} placeholder="Juan Pérez" />
              <Input label="Nombre de usuario" value={datos.nombre_usuario}
                onChange={(e) => setDatos({ ...datos, nombre_usuario: e.target.value.toLowerCase() })}
                error={errores.nombre_usuario} required placeholder="juan_perez"
                helperText="Solo minúsculas, números y guion bajo" />
              <Input label="Correo electrónico" type="email" value={datos.correo}
                onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
                error={errores.correo} required autoComplete="email" />
              <Input label="Contraseña" type="password" value={datos.password}
                onChange={(e) => setDatos({ ...datos, password: e.target.value })}
                error={errores.password} required autoComplete="new-password"
                helperText="Mínimo 8 caracteres con al menos un número" />
              <Input label="Confirmar contraseña" type="password" value={datos.confirmar_password}
                onChange={(e) => setDatos({ ...datos, confirmar_password: e.target.value })}
                error={errores.confirmar_password} required />
              <Button type="submit" loading={cargando} fullWidth>Crear cuenta</Button>
            </form>
            <p className="text-center text-sm text-slate-600 mt-6">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Inicia sesión</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </Layout>
  )
}
