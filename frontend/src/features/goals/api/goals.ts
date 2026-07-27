import type { Goal, CreateGoalInput, UpdateGoalInput } from '../types/goal'
import { apiRequest } from '@/shared/infrastructure/api/apiClient'

export const goalsApi = {
  list: () => apiRequest<Goal[]>('/listGoals'),
  create: (data: CreateGoalInput) => apiRequest<Goal>('/createGoal', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateGoalInput) => apiRequest<Goal>('/updateGoal', {
    method: 'PATCH',
    body: JSON.stringify({ goalId: id, ...data }),
  }),
  delete: (id: string) => apiRequest<void>('/deleteGoal', {
    method: 'DELETE',
    body: JSON.stringify({ goalId: id }),
  }),
}
