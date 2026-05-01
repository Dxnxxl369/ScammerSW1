import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAnonimo } from '../hooks/useAnonimo'
import { Layout } from '../components/Layout'
import { Button, Card, CardBody } from '../components/ui'

export function Home() {
  const { usuario } = useAuth()
  const { intentosRestantes, limiteAlcanzado } = useAnonimo()

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <h1 className="text-5xl font-bold text-slate-900 leading-tight">
            Detecta fraudes en segundos
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Analiza transacciones y detecta actividad sospechosa con inteligencia artificial.
            Sin configuración, sin esperas.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            {usuario ? (
              <Link to="/dashboard">
                <Button size="lg">Ir al dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/prueba">
                  <Button size="lg">
                    {limiteAlcanzado
                      ? 'Límite alcanzado — Regístrate gratis'
                      : `Probar gratis (${intentosRestantes} análisis disponibles)`}
                  </Button>
                </Link>
                <Link to="/registro">
                  <Button size="lg" variant="secondary">Crear cuenta</Button>
                </Link>
              </>
            )}
          </div>

          {!usuario && !limiteAlcanzado && (
            <p className="text-sm text-slate-400">
              Sin registro · Sin tarjeta · {intentosRestantes} análisis gratuitos como visitante
            </p>
          )}
        </div>
      </section>

      {/* Planes */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
          Elige tu plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Visitante */}
          <Card>
            <CardBody className="space-y-4 text-center">
              <h3 className="text-lg font-semibold text-slate-700">Visitante</h3>
              <p className="text-4xl font-bold text-slate-900">Gratis</p>
              <ul className="text-sm text-slate-600 space-y-2 text-left">
                <li>✓ 3 análisis por sesión</li>
                <li>✓ Sin registro</li>
                <li className="text-slate-400">✗ Sin historial</li>
                <li className="text-slate-400">✗ Sin soporte</li>
              </ul>
              <Link to="/prueba" className="block">
                <Button variant="secondary" fullWidth>Empezar ahora</Button>
              </Link>
            </CardBody>
          </Card>

          {/* Gratis registrado */}
          <Card>
            <CardBody className="space-y-4 text-center">
              <h3 className="text-lg font-semibold text-slate-700">Cuenta gratis</h3>
              <p className="text-4xl font-bold text-slate-900">$0</p>
              <ul className="text-sm text-slate-600 space-y-2 text-left">
                <li>✓ 10 análisis por día</li>
                <li>✓ Historial guardado</li>
                <li>✓ Dashboard personal</li>
                <li className="text-slate-400">✗ Sin soporte prioritario</li>
              </ul>
              <Link to="/registro" className="block">
                <Button fullWidth>Registrarse gratis</Button>
              </Link>
            </CardBody>
          </Card>

          {/* Pro */}
          <Card>
            <CardBody className="space-y-4 text-center ring-2 ring-indigo-500 rounded-xl">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                Recomendado
              </span>
              <h3 className="text-lg font-semibold text-slate-700">Pro</h3>
              <p className="text-4xl font-bold text-slate-900">$9<span className="text-lg text-slate-500">/mes</span></p>
              <ul className="text-sm text-slate-600 space-y-2 text-left">
                <li>✓ 500 análisis por día</li>
                <li>✓ Historial completo</li>
                <li>✓ API access</li>
                <li>✓ Soporte prioritario</li>
              </ul>
              <Link to="/registro" className="block">
                <Button fullWidth>Empezar Pro</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </section>
    </Layout>
  )
}
