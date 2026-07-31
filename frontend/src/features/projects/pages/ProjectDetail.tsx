import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useProject, useUpdateProject } from '../hooks/useProjects'
import type { ProjectStatus } from '../types/project'
import { tasksApi } from '@/features/tasks/api/tasks'
import type { Task, Subtask, CreateTaskInput, UpdateTaskInput } from '@/features/tasks/types/task'
import { Subtasks } from '@/features/tasks/components/Subtasks'
import { AppLayout } from '@/shared/components/AppLayout'
import { ArrowLeft, Loader2, Plus, Trash2, Edit2, CheckSquare, Calendar } from 'lucide-react'
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
  dueDate: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingSubtasks, setEditingSubtasks] = useState<Subtask[]>([])

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
    mutationFn: (data: CreateTaskInput) => tasksApi.create({ ...data, projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] })
      toast.success('Tarefa criada com sucesso!')
      setShowTaskForm(false)
    },
    onError: (error) => toast.error(error.message),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
      tasksApi.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] })
      toast.success('Tarefa atualizada com sucesso!')
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
    defaultValues: { title: '', description: '', dueDate: '', status: 'todo' },
  })

  const updateTaskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', dueDate: '', status: 'todo' },
  })

  const handleStatusChange = (status: ProjectStatus) => {
    if (!id) return
    updateProject.mutate({ id, data: { status } })
  }

  const handleCreateTask = (data: TaskFormData) => {
    createTask.mutate({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate || undefined,
      status: data.status || 'todo',
    }, { onSuccess: () => taskForm.reset() })
  }

  const handleUpdateTask = (data: TaskFormData) => {
    if (!editingTask) return
    updateTaskMutation.mutate({ taskId: editingTask.id, data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate || undefined,
      status: data.status || editingTask.status,
      subtasks: editingSubtasks,
    } }, { onSuccess: () => updateTaskForm.reset() })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditingSubtasks(task.subtasks || [])
    updateTaskForm.reset({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status || 'todo',
    })
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
                      {(editingTask ? updateTaskForm.formState.errors.title : taskForm.formState.errors.title) && (
                        <p className="form-error">
                          {(editingTask ? updateTaskForm.formState.errors.title : taskForm.formState.errors.title)?.message}
                        </p>
                      )}
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
                    <div className="task-form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="task-dueDate">Data de vencimento</label>
                        <input
                          id="task-dueDate"
                          type="date"
                          className="form-input"
                          {...(editingTask ? updateTaskForm.register('dueDate') : taskForm.register('dueDate'))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="task-status">Status</label>
                        <select
                          id="task-status"
                          className="form-input"
                          {...(editingTask ? updateTaskForm.register('status') : taskForm.register('status'))}
                        >
                          <option value="todo">A Fazer</option>
                          <option value="in_progress">Em Andamento</option>
                          <option value="done">Concluído</option>
                        </select>
                      </div>
                    </div>
                    {editingTask && (
                      <div className="form-group">
                        <label className="form-label">Subtarefas</label>
                        <Subtasks
                          subtasks={editingSubtasks}
                          onChange={setEditingSubtasks}
                          disabled={updateTaskMutation.isPending}
                        />
                      </div>
                    )}
                    <div className="task-form-actions">
                      <button type="submit" className="btn btn-primary" disabled={createTask.isPending || updateTaskMutation.isPending}>
                        {createTask.isPending || updateTaskMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                        ) : editingTask ? 'Salvar' : 'Criar'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => { setShowTaskForm(false); setEditingTask(null); setEditingSubtasks([]); }}>
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
                    <div className="task-meta-row">
                      <span className={`task-status-badge task-status-${task.status}`}>
                        {task.status === 'todo' ? 'A Fazer' : task.status === 'in_progress' ? 'Em Andamento' : 'Concluído'}
                      </span>
                      {task.dueDate && (
                        <span className="task-due-badge">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="task-subtasks">
                        <div className="task-subtask-progress">
                          {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtarefas concluídas
                        </div>
                      </div>
                    )}
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
