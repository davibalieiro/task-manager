import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'
import { apiRequest } from '@/shared/infrastructure/api/apiClient'

export const tasksApi = {
  list: () => apiRequest<Task[]>('/listTasks'),
  create: (data: CreateTaskInput) => apiRequest<Task>('/createTask', {
    method: 'POST',
    body: JSON.stringify({
      title: data.title,
      description: data.description || '',
      projectId: data.projectId,
      status: data.status,
      position: data.position,
      dueDate: data.dueDate,
    }),
  }),
  update: (id: string, data: UpdateTaskInput) => apiRequest<Task>('/updateTask', {
    method: 'PATCH',
    body: JSON.stringify({ taskId: id, ...data }),
  }),
  delete: (id: string) => apiRequest<void>('/deleteTask', {
    method: 'DELETE',
    body: JSON.stringify({ taskId: id }),
  }),
  toggle: (id: string) => apiRequest<Task>('/toggleTask', {
    method: 'PATCH',
    body: JSON.stringify({ taskId: id }),
  }),
}
