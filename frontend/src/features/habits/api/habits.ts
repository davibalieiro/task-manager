import type { Habit, CreateHabitInput, UpdateHabitInput } from '../types/habit'
import { apiRequest } from '@/shared/infrastructure/api/apiClient'

export const habitsApi = {
  list: () => apiRequest<Habit[]>('/listHabits'),
  create: (data: CreateHabitInput) => apiRequest<Habit>('/createHabit', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateHabitInput) => apiRequest<Habit>('/updateHabit', {
    method: 'PATCH',
    body: JSON.stringify({ habitId: id, ...data }),
  }),
  delete: (id: string) => apiRequest<void>('/deleteHabit', {
    method: 'DELETE',
    body: JSON.stringify({ habitId: id }),
  }),
  toggle: (id: string, direction: 'increment' | 'decrement' | 'reset', currentValue?: number, target?: number) => {
    let newCurrent = currentValue || 0
    if (direction === 'increment') newCurrent = Math.min((currentValue || 0) + 1, target || 0)
    else if (direction === 'decrement') newCurrent = Math.max((currentValue || 0) - 1, 0)
    else newCurrent = 0

    return apiRequest<Habit>('/updateHabit', {
      method: 'PATCH',
      body: JSON.stringify({ habitId: id, current: newCurrent }),
    })
  },
}
