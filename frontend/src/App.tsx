import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'
import { Login } from './pages/Login'
import { Registro } from './pages/Registro'
import { Dashboard } from './pages/Dashboard'
import { Perfil } from './pages/Perfil'
import { RecuperarPassword } from './pages/RecuperarPassword'
import HealthCheck from './pages/HealthCheck'
import { DesignSystem } from './pages/DesignSystem'
import { Prueba } from './pages/Prueba'
import { Home } from './pages/Home'
import { AdminRoute } from './routes/AdminRoute'
import { AdminDashboard } from './pages/admin/AdminDashboard'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/health" element={<HealthCheck />} />
            <Route path="/design-system" element={<DesignSystem />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/registro" element={<PublicOnlyRoute><Registro /></PublicOnlyRoute>} />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/prueba" element={<Prueba />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
