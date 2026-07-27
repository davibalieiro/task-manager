import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/shared/context/AuthContext'
import { requiresAuth, isPublicRoute, getRouteConfig } from '@/shared/infrastructure/config/routes'

export function useAuthMiddleware() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuthContext()

  useEffect(() => {
    if (loading) return

    const { pathname } = location
    const routeConfig = getRouteConfig(pathname)

    // If user is not authenticated and route requires auth
    if (!user && requiresAuth(pathname)) {
      const redirect = routeConfig?.redirect || '/login'
      navigate(redirect, { replace: true })
      return
    }

    // If user is authenticated and trying to access public route
    if (user && isPublicRoute(pathname)) {
      const redirect = routeConfig?.redirect || '/'
      navigate(redirect, { replace: true })
      return
    }
  }, [user, loading, location, navigate])

  return { user, loading }
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthMiddleware()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthMiddleware()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return <>{children}</>
}
