import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import navbarLogo from '../../assets/navbar.webp'

const navigationItems = [
  { label: 'Panel', to: '/dashboard' },
  { label: 'Proyectos', to: '/projects' },
]

function Sidebar({ isOpen, onClose, onNavigate }) {
  const navigate = useNavigate()
  const { user, isUsingBypassAuth } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const email = user?.email || 'admin@wachstudio.com'
  const initials = email.slice(0, 2).toUpperCase()

  async function handleLogout() {
    if (isUsingBypassAuth) {
      return
    }

    if (!supabase) {
      navigate('/login', { replace: true })
      return
    }

    setIsLoggingOut(true)
    setLogoutError('')

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      navigate('/login', { replace: true })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('No se pudo cerrar sesión.', error)
      }

      setLogoutError('No se pudo cerrar sesión. Probá nuevamente.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar__brand">
          <img src={navbarLogo} alt="WACH" className="sidebar__logo" />
        </div>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' is-active' : ''}`
              }
              onClick={onNavigate}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <span className="sidebar__avatar">{initials}</span>
            <div>
              <strong>{email}</strong>
              <span>{isUsingBypassAuth ? 'Modo desarrollo' : 'Administrador'}</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar__logout"
            onClick={handleLogout}
            disabled={isLoggingOut || isUsingBypassAuth}
          >
            {isUsingBypassAuth
              ? 'Bypass activo'
              : isLoggingOut
                ? 'Cerrando sesión...'
                : 'Cerrar sesión'}
          </button>
          {logoutError ? (
            <p className="sidebar__logout-error">{logoutError}</p>
          ) : null}
        </div>
      </aside>

      <button
        type="button"
        className={`sidebar__backdrop ${isOpen ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-label="Cerrar navegación"
      />
    </>
  )
}

export default Sidebar
