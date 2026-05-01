import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { Button, Input, Card, CardHeader, CardBody, Alert } from '../components/ui'
import { Layout } from '../components/Layout'

export function RecuperarPassword() {
  const [correo, setCorreo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError(null)
    const resultado = await authService.recuperarPassword(correo)
    if (resultado.exito) setEnviado(true)
    else setError(resultado.error.mensaje)
    setCargando(false)
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-slate-900">Recuperar contraseña</h1>
            <p className="text-sm text-slate-600 mt-1">Te enviaremos un enlace a tu correo</p>
          </CardHeader>
          <CardBody>
            {enviado ? (
              <div className="space-y-4">
                <Alert variant="success" title="Correo enviado">
                  Revisa tu bandeja de entrada y sigue las instrucciones.
                </Alert>
                <Link to="/login"><Button variant="secondary" fullWidth>Volver al login</Button></Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <Alert variant="error">{error}</Alert>}
                <Input label="Correo electrónico" type="email" value={correo}
                  onChange={(e) => setCorreo(e.target.value)} required placeholder="tu@correo.com" />
                <Button type="submit" loading={cargando} fullWidth>Enviar enlace</Button>
                <Link to="/login" className="block text-center text-sm text-indigo-600 hover:text-indigo-700">
                  Volver al login
                </Link>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  )
}
