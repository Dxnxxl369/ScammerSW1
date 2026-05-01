import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Card, CardHeader, CardBody, Alert } from '../components/ui'
import { Layout } from '../components/Layout'

export function Login() {
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const resultado = await iniciarSesion({ correo, password })
    if (resultado.exito) {
      navigate('/dashboard')
    } else {
      setError(resultado.error.mensaje)
    }
    setCargando(false)
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
            <p className="text-sm text-slate-600 mt-1">Bienvenido de vuelta</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert variant="error">{error}</Alert>}
              <Input label="Correo electrónico" type="email" value={correo}
                onChange={(e) => setCorreo(e.target.value)} required autoComplete="email" placeholder="tu@correo.com" />
              <Input label="Contraseña" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              <div className="flex justify-end">
                <Link to="/recuperar-password" className="text-sm text-indigo-600 hover:text-indigo-700">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Button type="submit" loading={cargando} fullWidth>Iniciar sesión</Button>
            </form>
            <p className="text-center text-sm text-slate-600 mt-6">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-indigo-600 hover:text-indigo-700 font-medium">Regístrate</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </Layout>
  )
}
