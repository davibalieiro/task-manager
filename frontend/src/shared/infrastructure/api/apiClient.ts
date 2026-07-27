import { getSessionCookie } from '../config/auth'

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getSessionCookie()
  const res = await fetch(`/api${endpoint}`, {
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
