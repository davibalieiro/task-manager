import type { Tag, CreateTagInput, UpdateTagInput } from '../types/tag'
import { apiRequest } from '@/shared/infrastructure/api/apiClient'

export const tagsApi = {
  list: () => apiRequest<Tag[]>('/listTags'),
  create: (data: CreateTagInput) => apiRequest<Tag>('/createTag', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateTagInput) => apiRequest<Tag>('/updateTag', {
    method: 'PATCH',
    body: JSON.stringify({ tagId: id, ...data }),
  }),
  delete: (id: string) => apiRequest<void>('/deleteTag', {
    method: 'DELETE',
    body: JSON.stringify({ tagId: id }),
  }),
  assign: (taskId: string, tagId: string) => apiRequest<void>('/assignTag', {
    method: 'POST',
    body: JSON.stringify({ taskId, tagId }),
  }),
  unassign: (taskId: string, tagId: string) => apiRequest<void>('/unassignTag', {
    method: 'DELETE',
    body: JSON.stringify({ taskId, tagId }),
  }),
  getForTask: (taskId: string) => apiRequest<string[]>(`/listTaskTags?taskId=${taskId}`),
  getTasksForTag: (tagId: string) => apiRequest<Record<string, string[]>>(`/listTaskTags?tagId=${tagId}`),
  getAllTaskTags: () => apiRequest<Record<string, string[]>>('/listTaskTags'),
}
