import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicOnlyRoute, ProtectedRoute } from '../components/auth/AuthGate'
import { AuthProvider } from '../context/AuthContext'
import AdminLayout from '../layouts/AdminLayout'
import Dashboard from '../pages/Dashboard'
import EditProject from '../pages/EditProject'
import Login from '../pages/Login'
import NewProject from '../pages/NewProject'
import Projects from '../pages/Projects'

function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects/:id/edit" element={<EditProject />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default AppRouter
