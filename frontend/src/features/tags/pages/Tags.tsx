import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { Task } from '@/features/tasks/types/task'
import { tasksApi } from '@/features/tasks/api/tasks'
import { useTags, useTaskTags, useCreateTag, useUpdateTag, useDeleteTag, useAssignTag, useUnassignTag } from '../hooks/useTags'
import type { Tag } from '../types/tag'
import { AppLayout } from '@/shared/components/AppLayout'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import {
  Tags as TagsIcon,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  CheckSquare,
  X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#a855f7', '#d946ef', '#f43f5e', '#fb923c', '#facc15',
  '#4ade80', '#2dd4bf', '#22d3ee', '#60a5fa', '#c084fc',
]

const tagSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(30),
  color: z.string(),
})

type TagFormData = z.infer<typeof tagSchema>

export function TagsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [selectedColor, setSelectedColor] = useState('#6366f1')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [tagToDelete, setTagToDelete] = useState<string | null>(null)

  const { data: tags = [], isLoading: tagsLoading } = useTags()
  const { data: taskTags = {} } = useTaskTags()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const assignTag = useAssignTag()
  const unassignTag = useUnassignTag()

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  })

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: '', color: '#6366f1' },
  })

  const handleSubmit = (data: TagFormData) => {
    const tagData = { ...data, color: selectedColor }

    if (editingTag) {
      updateTag.mutate({ id: editingTag.id, data: tagData }, {
        onSuccess: () => {
          toast.success('Etiqueta atualizada com sucesso!')
          setShowForm(false)
          setEditingTag(null)
          form.reset()
        },
        onError: (error) => toast.error(error.message),
      })
    } else {
      createTag.mutate(tagData, {
        onSuccess: () => {
          toast.success('Etiqueta criada com sucesso!')
          setShowForm(false)
          setEditingTag(null)
          form.reset()
        },
        onError: (error) => toast.error(error.message),
      })
    }
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setSelectedColor(tag.color)
    form.reset({ name: tag.name, color: tag.color })
    setShowForm(true)
  }

  const handleDeleteTag = (id: string) => {
    setTagToDelete(id)
  }

  const confirmDeleteTag = () => {
    if (tagToDelete) {
      deleteTag.mutate(tagToDelete, {
        onSuccess: () => toast.success('Etiqueta excluída com sucesso!'),
        onError: (error) => toast.error(error.message),
      })
      setTagToDelete(null)
    }
  }

  const handleAssignTag = (taskId: string, tagId: string) => {
    const isAssigned = (taskTags[taskId] || []).includes(tagId)
    if (isAssigned) {
      unassignTag.mutate({ taskId, tagId })
    } else {
      assignTag.mutate({ taskId, tagId })
    }
  }

  const getTagsForTask = (taskId: string): Tag[] => {
    const tagIds = taskTags[taskId] || []
    return tags.filter((t) => tagIds.includes(t.id))
  }

  const getTagById = (id: string): Tag | undefined => {
    return tags.find((t) => t.id === id)
  }

  const filteredTasks = filterTag
    ? tasks?.filter((t) => (taskTags[t.id] || []).includes(filterTag))
    : tasks

  const tasksLoadingCount = tasksLoading ? 0 : filteredTasks?.length || 0

  if (tagsLoading || tasksLoading) {
    return (
      <AppLayout>
        <div className="tags-loading">
          <Loader2 className="spinner-lg" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ConfirmDialog
        isOpen={tagToDelete !== null}
        title="Excluir etiqueta"
        message="Tem certeza que deseja excluir esta etiqueta? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmDeleteTag}
        onCancel={() => setTagToDelete(null)}
      />
      <div className="tags-header">
          <h1 className="tags-title">Etiquetas</h1>
          <button className="btn btn-primary" onClick={() => { setEditingTag(null); setSelectedColor('#6366f1'); form.reset(); setShowForm(true); }}>
            <Plus className="h-4 w-4" />
            Nova Etiqueta
          </button>
        </div>

        {showForm && (
          <div className="tags-form">
            <div className="task-form-card">
              <div className="task-form-header">
                <h3 className="task-form-title">
                  {editingTag ? 'Editar Etiqueta' : 'Nova Etiqueta'}
                </h3>
              </div>
              <div className="task-form-content">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="auth-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="tag-name">Nome</label>
                    <input
                      id="tag-name"
                      type="text"
                      className="form-input"
                      placeholder="Nome da etiqueta"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="form-error">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cor</label>
                    <div className="color-picker">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="task-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={createTag.isPending || updateTag.isPending}>
                      {(createTag.isPending || updateTag.isPending) ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                      ) : editingTag ? 'Salvar' : 'Criar Etiqueta'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingTag(null); }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="tags-section">
          <h2 className="tags-section-title">Suas Etiquetas</h2>
          {tags.length === 0 ? (
            <div className="tags-empty">
              <TagsIcon className="tags-empty-icon" />
              <h3 className="tags-empty-title">Nenhuma etiqueta</h3>
              <p className="tags-empty-description">Crie etiquetas para organizar suas tarefas.</p>
            </div>
          ) : (
            <div className="tags-list">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={`tags-tag-item ${filterTag === tag.id ? 'active' : ''}`}
                  onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                >
                  <div className="tags-tag-color" style={{ backgroundColor: tag.color }} />
                  <span className="tags-tag-name">{tag.name}</span>
                  <div className="tags-tag-count">
                    {tasks?.filter((t) => (taskTags[t.id] || []).includes(tag.id)).length || 0}
                  </div>
                  <div className="tags-tag-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="task-action-btn" onClick={() => handleEditTag(tag)} title="Editar">
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button className="task-action-btn danger" onClick={() => handleDeleteTag(tag.id)} title="Excluir">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filterTag && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilterTag(null)}>
              <X className="h-4 w-4" />
              Limpar filtro
            </button>
          )}
        </div>

        <div className="tags-section">
          <h2 className="tags-section-title">
            Tarefas {filterTag && `— ${getTagById(filterTag)?.name || ''}`}
            <span className="tags-section-count">{tasksLoadingCount}</span>
          </h2>
          <div className="tags-tasks-list">
            {filteredTasks?.length === 0 ? (
              <div className="tags-tasks-empty">
                <CheckSquare className="h-8 w-8" />
                <p>{filterTag ? 'Nenhuma tarefa com esta etiqueta' : 'Nenhuma tarefa encontrada'}</p>
              </div>
            ) : (
              filteredTasks?.map((task) => {
                const taskTagList = getTagsForTask(task.id)
                return (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <input
                      type="checkbox"
                      className="checkbox-input task-checkbox"
                      checked={task.completed}
                      readOnly
                    />
                    <div className="task-content">
                      <h3 className="task-title">{task.title}</h3>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      <div className="tags-task-tags">
                        {taskTagList.map((tag) => (
                          <span
                            key={tag.id}
                            className="tags-task-badge"
                            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="tags-assign-dropdown">
                      {tags.map((tag) => {
                        const isAssigned = (taskTags[task.id] || []).includes(tag.id)
                        return (
                          <button
                            key={tag.id}
                            className={`tags-assign-option ${isAssigned ? 'assigned' : ''}`}
                            onClick={() => handleAssignTag(task.id, tag.id)}
                          >
                            <div className="tags-assign-dot" style={{ backgroundColor: tag.color }} />
                            <span>{tag.name}</span>
                            {isAssigned && <CheckSquare className="h-3 w-3" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
    </AppLayout>
  )
}
