import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import navbarLogo from '../assets/navbar.webp'
import useAuth from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSupabaseConfigured, isDevBypassAuthEnabled, setAuthSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  if (isDevBypassAuthEnabled) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isSupabaseConfigured || !supabase) {
      setFormError(
        'La autenticación todavía no está configurada. Agregá las variables de entorno requeridas para habilitar el inicio de sesión.',
      )
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (import.meta.env.DEV) {
        console.log({ data, error })
      }

      if (error) {
        setFormError(
          import.meta.env.DEV
            ? error.message
            : 'Email o contraseña inválidos. Probá nuevamente.',
        )
        return
      }

      if (!data?.session) {
        setFormError(
          'La respuesta fue validada, pero no devolvió una sesión activa. Revisá si el usuario necesita confirmar el email o si el acceso con email y contraseña está habilitado.',
        )
        return
      }

      setAuthSession(data.session)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error inesperado durante el inicio de sesión.', error)
      }

      setFormError(
        'No se pudo completar el inicio de sesión. Probá nuevamente en unos segundos.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-card__intro">
          <img src={navbarLogo} alt="WACH" className="auth-card__logo" />
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          <div className="auth-fields-card">
            <label className="auth-field">
              <span>Email</span>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@wachstudio.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span>Contraseña</span>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresá tu contraseña"
                autoComplete="current-password"
                required
              />
            </label>

            <button className="button-primary auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Entrar al panel'}
            </button>
          </div>

          {formError ? (
            <p className="auth-message auth-message--error">{formError}</p>
          ) : null}

          {!isSupabaseConfigured ? (
            <p className="auth-message">
              Falta configurar la autenticación para habilitar el inicio de
              sesión.
            </p>
          ) : null}

        </form>
      </section>
    </div>
  )
}

export default Login
