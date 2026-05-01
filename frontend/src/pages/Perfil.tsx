import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Card, CardHeader, CardBody, Alert } from '../components/ui'
import { Layout } from '../components/Layout'

export function Perfil() {
  const { usuario, actualizarPerfil } = useAuth()
  const [nombreCompleto, setNombreCompleto] = useState(usuario?.nombre_completo ?? '')
  const [pais, setPais] = useState(usuario?.pais ?? 'BO')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  if (!usuario) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setCargando(true)
    const resultado = await actualizarPerfil({ nombre_completo: nombreCompleto, pais })
    setMensaje(resultado.exito
      ? { tipo: 'success', texto: 'Perfil actualizado correctamente' }
      : { tipo: 'error', texto: resultado.error.mensaje }
    )
    setCargando(false)
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card>
          <CardHeader><h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1></CardHeader>
          <CardBody>
            <div className="space-y-3 mb-6 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm"><span className="font-medium text-slate-700">Correo:</span> <span className="text-slate-600">{usuario.correo}</span></p>
              <p className="text-sm"><span className="font-medium text-slate-700">Usuario:</span> <span className="text-slate-600">@{usuario.nombre_usuario}</span></p>
              <p className="text-sm"><span className="font-medium text-slate-700">Rol:</span> <span className="text-slate-600 capitalize">{usuario.rol}</span></p>
              <p className="text-sm"><span className="font-medium text-slate-700">Plan:</span> <span className="text-slate-600 capitalize">{usuario.plan}</span></p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}
              <Input label="Nombre completo" value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)} placeholder="Tu nombre completo" />
              <Input label="País (código ISO)" value={pais}
                onChange={(e) => setPais(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2} placeholder="BO" />
              <Button type="submit" loading={cargando} fullWidth>Guardar cambios</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </Layout>
  )
}
