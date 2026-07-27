import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project'
import { apiRequest } from '@/shared/infrastructure/api/apiClient'

export const projectsApi = {
  list: () => apiRequest<Project[]>('/listProjects'),
  get: (id: string) => apiRequest<Project>(`/getProject?projectId=${id}`),
  create: (data: CreateProjectInput) => apiRequest<Project>('/createProject', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateProjectInput) => apiRequest<Project>('/updateProject', {
    method: 'PATCH',
    body: JSON.stringify({ projectId: id, ...data }),
  }),
  delete: (id: string) => apiRequest<void>('/deleteProject', {
    method: 'DELETE',
    body: JSON.stringify({ projectId: id }),
  }),
}
