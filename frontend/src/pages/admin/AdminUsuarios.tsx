import { useEffect, useState, useCallback } from 'react'
import { Layout } from '../../components/Layout'
import { Card, CardBody, Button, Input, Spinner, Alert } from '../../components/ui'
import { adminService } from '../../services/adminService'
import type { FiltrosUsuarios, ListadoUsuarios } from '../../services/adminService'
import type { Usuario } from '../../types/auth'

export function AdminUsuarios() {
  const [listado, setListado] = useState<ListadoUsuarios | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({ pagina: 1 })

  const cargar = useCallback(async () => {
    setCargando(true)
    const data = await adminService.listarUsuarios(filtros)
    setListado(data)
    setCargando(false)
  }, [filtros])

  useEffect(() => {
    cargar()
  }, [cargar])

  const accion = async (fn: () => Promise<boolean>, ok: string) => {
    const exito = await fn()
    if (exito) {
      setMensaje(ok)
      cargar()
    }
  }

  const toggleBloqueo = (u: Usuario) =>
    u.bloqueado
      ? accion(() => adminService.desbloquear(u.id_supabase), `${u.nombre_usuario} desbloqueado`)
      : accion(() => adminService.bloquear(u.id_supabase), `${u.nombre_usuario} bloqueado`)

  const togglePlan = (u: Usuario) =>
    accion(
      () => adminService.cambiarPlan(u.id_supabase, u.plan === 'gratis' ? 'pro' : 'gratis'),
      `Plan de ${u.nombre_usuario} actualizado`
    )

  const toggleRol = (u: Usuario) =>
    accion(
      () => adminService.cambiarRol(u.id_supabase, u.rol === 'usuario' ? 'administrador' : 'usuario'),
      `Rol de ${u.nombre_usuario} actualizado`
    )

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Gestión de usuarios</h1>

        {mensaje && (
          <Alert variant="success" onClose={() => setMensaje(null)}>
            {mensaje}
          </Alert>
        )}

        {/* Filtros */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-48">
                <Input
                  label="Buscar"
                  placeholder="Nombre, correo o usuario..."
                  value={filtros.q ?? ''}
                  onChange={(e) => setFiltros({ ...filtros, q: e.target.value, pagina: 1 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={filtros.rol ?? ''}
                  onChange={(e) => setFiltros({ ...filtros, rol: (e.target.value as 'administrador' | 'usuario') || undefined, pagina: 1 })}
                >
                  <option value="">Todos</option>
                  <option value="administrador">Admin</option>
                  <option value="usuario">Usuario</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                <select
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={filtros.plan ?? ''}
                  onChange={(e) => setFiltros({ ...filtros, plan: (e.target.value as 'gratis' | 'pro') || undefined, pagina: 1 })}
                >
                  <option value="">Todos</option>
                  <option value="gratis">Gratis</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={filtros.bloqueado === undefined ? '' : String(filtros.bloqueado)}
                  onChange={(e) => setFiltros({
                    ...filtros,
                    bloqueado: e.target.value === '' ? undefined : e.target.value === 'true',
                    pagina: 1,
                  })}
                >
                  <option value="">Todos</option>
                  <option value="false">Activos</option>
                  <option value="true">Bloqueados</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabla */}
        {cargando ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : listado ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Nombre', 'Correo', 'Rol', 'Plan', 'Estado', 'Registro', 'Acciones'].map((col) => (
                      <th key={col} className="px-4 py-3 text-left font-medium text-slate-700">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {listado.usuarios.map((u) => (
                    <tr key={u.id_supabase} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{u.nombre_usuario}</td>
                      <td className="px-4 py-3 text-slate-600">{u.correo}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.rol === 'administrador'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.plan === 'pro'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.bloqueado
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.bloqueado ? 'Bloqueado' : 'Activo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(u.fecha_creacion).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => toggleBloqueo(u)}>
                            {u.bloqueado ? 'Desbloquear' : 'Bloquear'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => togglePlan(u)}>
                            → {u.plan === 'gratis' ? 'Pro' : 'Gratis'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => toggleRol(u)}>
                            → {u.rol === 'usuario' ? 'Admin' : 'Usuario'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {listado.total_paginas > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {listado.total} usuarios — página {listado.pagina} de {listado.total_paginas}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={(filtros.pagina ?? 1) <= 1}
                    onClick={() => setFiltros({ ...filtros, pagina: (filtros.pagina ?? 1) - 1 })}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={(filtros.pagina ?? 1) >= listado.total_paginas}
                    onClick={() => setFiltros({ ...filtros, pagina: (filtros.pagina ?? 1) + 1 })}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-500">No se pudieron cargar los usuarios.</p>
        )}
      </div>
    </Layout>
  )
}
