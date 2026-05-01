import { useEffect, useState } from 'react'
import { Layout } from '../../components/Layout'
import { Card, CardHeader, CardBody, Spinner } from '../../components/ui'
import { adminService } from '../../services/adminService'
import type { Estadisticas } from '../../services/adminService'

interface StatCardProps {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-medium text-slate-600">{label}</h3>
      </CardHeader>
      <CardBody>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </CardBody>
    </Card>
  )
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Estadisticas | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    adminService.estadisticas().then((data) => {
      setStats(data)
      setCargando(false)
    })
  }, [])

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Panel de administración</h1>

        {cargando ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Total usuarios" value={stats.total_usuarios} />
            <StatCard label="Administradores" value={stats.administradores} />
            <StatCard label="Usuarios normales" value={stats.usuarios_normales} />
            <StatCard label="Plan gratis" value={stats.plan_gratis} />
            <StatCard label="Plan pro" value={stats.plan_pro} />
            <StatCard label="Bloqueados" value={stats.bloqueados} />
            <StatCard label="Activos" value={stats.activos} />
          </div>
        ) : (
          <p className="text-slate-500">No se pudieron cargar las estadísticas.</p>
        )}
      </div>
    </Layout>
  )
}
