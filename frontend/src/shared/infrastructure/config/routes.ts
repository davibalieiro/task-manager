// Route configuration for Mova
// Based on serview architecture

export interface RouteConfig {
  path: string;
  isPublic: boolean;
  requiresAuth: boolean;
  requiresCompany?: boolean;
  redirect?: string;
}

export const routes: Record<string, RouteConfig> = {
  // Public routes
  login: {
    path: '/login',
    isPublic: true,
    requiresAuth: false,
    redirect: '/',
  },
  register: {
    path: '/register',
    isPublic: true,
    requiresAuth: false,
    redirect: '/',
  },
  forgotPassword: {
    path: '/forgot-password',
    isPublic: true,
    requiresAuth: false,
    redirect: '/',
  },

  // Protected routes
  home: {
    path: '/',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },
  dashboard: {
    path: '/dashboard',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },
  tasks: {
    path: '/tasks',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },
  projects: {
    path: '/projects',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },
  habits: {
    path: '/habits',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },
  board: {
    path: '/board',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },
  calendar: {
    path: '/calendar',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },
  goals: {
    path: '/goals',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },
  reports: {
    path: '/reports',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },

  settings: {
    path: '/settings',
    isPublic: false,
    requiresAuth: true,
    redirect: '/login',
  },
}

export function getRouteConfig(pathname: string): RouteConfig | undefined {
  return Object.values(routes).find(
    (route) => route.path === pathname || pathname.startsWith(route.path + '/')
  )
}

export function isPublicRoute(pathname: string): boolean {
  const config = getRouteConfig(pathname)
  return config?.isPublic ?? false
}

export function requiresAuth(pathname: string): boolean {
  const config = getRouteConfig(pathname)
  return config?.requiresAuth ?? true
}
