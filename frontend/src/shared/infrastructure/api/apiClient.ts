import { getSessionCookie } from '../config/auth'

const runBase = import.meta.env.VITE_RUN_BASE || ''

function getFunctionUrl(endpoint: string): string {
  if (runBase) {
    const functionName = endpoint.split('?')[0].replace(/^\//, '').toLowerCase()
    return `https://${functionName}-${runBase}`
  }
  return `/api${endpoint}`
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getSessionCookie()
  const url = getFunctionUrl(endpoint)
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw new Error(error.message || 'Erro na requisicao')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}
