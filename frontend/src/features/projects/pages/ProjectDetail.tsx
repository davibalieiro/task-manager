import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useProject, useUpdateProject } from '../hooks/useProjects'
import type { ProjectStatus } from '../types/project'
import { tasksApi } from '@/features/tasks/api/tasks'
import type { Task } from '@/features/tasks/types/task'
import { AppLayout } from '@/shared/components/AppLayout'
import { ArrowLeft, Loader2, Plus, Trash2, Edit2, CheckSquare } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluído' },
]

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100),
  description: z.string().max(500).optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { data: project, isLoading: projectLoading } = useProject(id || '')
  const updateProject = useUpdateProject()

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks', 'project', id],
    queryFn: async () => {
      const allTasks = await tasksApi.list()
      return allTasks.filter((t) => t.projectId === id)
    },
    enabled: !!id,
  })

  const createTask = useMutation({
    mutationFn: (data: TaskFormData) => tasksApi.create({ ...data, projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] })
      setShowTaskForm(false)
    },
    onError: (error) => toast.error(error.message),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskFormData }) =>
      tasksApi.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] })
      setEditingTask(null)
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] })
    },
    onError: (error) => toast.error(error.message),
  })

  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.toggle(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] })
    },
    onError: (error) => toast.error(error.message),
  })

  const taskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '' },
  })

  const updateTaskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '' },
  })

  const handleStatusChange = (status: ProjectStatus) => {
    if (!id) return
    updateProject.mutate({ id, data: { status } })
  }

  const handleCreateTask = (data: TaskFormData) => {
    createTask.mutate(data, { onSuccess: () => taskForm.reset() })
  }

  const handleUpdateTask = (data: TaskFormData) => {
    if (!editingTask) return
    updateTaskMutation.mutate({ taskId: editingTask.id, data }, { onSuccess: () => updateTaskForm.reset() })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    updateTaskForm.reset({ title: task.title, description: task.description || '' })
    setShowTaskForm(true)
  }

  const completedCount = tasks?.filter((t) => t.completed).length || 0
  const totalCount = tasks?.length || 0
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (projectLoading || tasksLoading) {
    return (
      <AppLayout>
        <div className="projects-loading">
          <Loader2 className="spinner-lg" />
        </div>
      </AppLayout>
    )
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="projects-error">Projeto não encontrado</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="project-detail-header">
          <button className="btn btn-ghost" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>

        <div className="project-detail-info">
          <div className="project-detail-color" style={{ backgroundColor: project.color }} />
          <div className="project-detail-text">
            <h1 className="project-detail-name">{project.name}</h1>
            {project.description && (
              <p className="project-detail-description">{project.description}</p>
            )}
            <p className="project-detail-date">
              Criado em {format(new Date(project.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="project-detail-status">
          <span className="project-detail-status-label">Status:</span>
          <div className="project-detail-status-buttons">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`status-btn ${project.status === opt.value ? 'active' : ''}`}
                onClick={() => handleStatusChange(opt.value)}
                disabled={updateProject.isPending}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="project-detail-progress">
          <div className="progress-header">
            <span className="progress-label">Progresso</span>
            <span className="progress-count">{completedCount}/{totalCount} tarefas</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="project-detail-tasks">
          <div className="project-tasks-header">
            <h2 className="project-tasks-title">
              <CheckSquare className="h-5 w-5" />
              Tarefas do Projeto
            </h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setShowTaskForm(true); setEditingTask(null); taskForm.reset(); }}
            >
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </button>
          </div>

          {(showTaskForm || editingTask) && (
            <div className="task-form">
              <div className="task-form-card">
                <div className="task-form-header">
                  <h3 className="task-form-title">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
                </div>
                <div className="task-form-content">
                  <form
                    onSubmit={editingTask ? updateTaskForm.handleSubmit(handleUpdateTask) : taskForm.handleSubmit(handleCreateTask)}
                    className="auth-form"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="task-title">Título</label>
                      <input
                        id="task-title"
                        type="text"
                        className="form-input"
                        placeholder="Título da tarefa"
                        {...(editingTask ? updateTaskForm.register('title') : taskForm.register('title'))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="task-desc">Descrição (opcional)</label>
                      <textarea
                        id="task-desc"
                        className="form-input form-textarea"
                        placeholder="Descrição da tarefa"
                        rows={2}
                        {...(editingTask ? updateTaskForm.register('description') : taskForm.register('description'))}
                      />
                    </div>
                    <div className="task-form-actions">
                      <button type="submit" className="btn btn-primary" disabled={createTask.isPending || updateTaskMutation.isPending}>
                        {createTask.isPending || updateTaskMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                        ) : editingTask ? 'Salvar' : 'Criar'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => { setShowTaskForm(false); setEditingTask(null); }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="tasks-list">
            {tasks?.length === 0 ? (
              <div className="tasks-empty">
                <CheckSquare className="tasks-empty-icon" />
                <h3 className="tasks-empty-title">Nenhuma tarefa neste projeto</h3>
                <p className="tasks-empty-description">Adicione tarefas ao projeto.</p>
              </div>
            ) : (
              tasks?.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    className="checkbox-input task-checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskMutation.mutate(task.id)}
                  />
                  <div className="task-content">
                    <h3 className="task-title">{task.title}</h3>
                    {task.description && <p className="task-description">{task.description}</p>}
                  </div>
                  <div className="task-actions">
                    <button className="task-action-btn" onClick={() => handleEditTask(task)} title="Editar">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="task-action-btn danger" onClick={() => deleteTaskMutation.mutate(task.id)} title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
    </AppLayout>
  )
}
