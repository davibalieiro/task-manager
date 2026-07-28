import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '../api/tags'
import type { CreateTagInput, UpdateTagInput } from '../types/tag'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.list,
  })
}

export function useTaskTags() {
  return useQuery({
    queryKey: ['taskTags'],
    queryFn: tagsApi.getAllTaskTags,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTagInput) => tagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagInput }) => tagsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['taskTags'] })
    },
  })
}

export function useAssignTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) => tagsApi.assign(taskId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTags'] })
    },
  })
}

export function useUnassignTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) => tagsApi.unassign(taskId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTags'] })
    },
  })
}
