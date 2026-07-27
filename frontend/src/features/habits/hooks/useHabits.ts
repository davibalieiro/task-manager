import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { habitsApi } from '../api/habits'
import type { CreateHabitInput, UpdateHabitInput } from '../types/habit'

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: habitsApi.list,
  })
}

export function useCreateHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHabitInput) => habitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

export function useUpdateHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitInput }) => habitsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

export function useDeleteHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

export function useToggleHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, direction, currentValue, target }: { id: string; direction: 'increment' | 'decrement' | 'reset'; currentValue?: number; target?: number }) =>
      habitsApi.toggle(id, direction, currentValue, target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}
