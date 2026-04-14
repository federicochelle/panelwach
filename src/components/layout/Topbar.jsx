import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const titleByPath = {
  '/dashboard': 'Panel',
  '/projects': 'Proyectos',
  '/projects/new': 'Nuevo proyecto',
}

function getPageTitle(pathname) {
  if (titleByPath[pathname]) {
    return titleByPath[pathname]
  }

  if (pathname.startsWith('/projects/') && pathname.endsWith('/edit')) {
    return 'Editar proyecto'
  }

  return 'WACH Admin'
}

function Topbar({ onOpenSidebar }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isUsingBypassAuth } = useAuth()
  const title = getPageTitle(location.pathname)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
    setIsLoggingOut(false)
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__menu-button"
          onClick={onOpenSidebar}
          aria-label="Abrir navegación"
        >
          <span />
          <span />
          <span />
        </button>

        <div>
          <p className="topbar__label">WACH Admin</p>
          <h1 className="topbar__title">{title}</h1>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__user">
          <span className="topbar__avatar">{initials}</span>
          <div>
            <strong>{email}</strong>
            <span>{isUsingBypassAuth ? 'Modo desarrollo' : 'Administrador'}</span>
          </div>
        </div>

        <button
          type="button"
          className="topbar__logout"
          onClick={handleLogout}
          disabled={isLoggingOut || isUsingBypassAuth}
        >
          {isUsingBypassAuth
            ? 'Bypass activo'
            : isLoggingOut
              ? 'Cerrando sesión...'
              : 'Cerrar sesión'}
        </button>
      </div>
    </header>
  )
}

export default Topbar
