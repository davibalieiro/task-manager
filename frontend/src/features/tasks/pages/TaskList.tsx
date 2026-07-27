import { useState, useMemo, useRef } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks'
import type { Task, TaskStatus, Subtask, CreateTaskInput, UpdateTaskInput } from '../types/task'
import { projectsApi } from '@/features/projects/api/projects'
import type { Project } from '@/features/projects/types/project'
import { Subtasks } from '../components/Subtasks'
import { AppLayout } from '@/shared/components/AppLayout'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { TaskSlideOver } from '@/shared/components/TaskSlideOver'
import { Plus, Trash2, Edit2, Loader2, CheckSquare, Calendar, Search, X, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useKeyboardShortcuts } from '@/shared/hooks/useKeyboardShortcuts'

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100),
  description: z.string().max(500).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

type FilterStatus = 'all' | TaskStatus

export function TaskList() {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [editingSubtasks, setEditingSubtasks] = useState<Subtask[]>([])
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)

  useKeyboardShortcuts({
    onNewTask: () => { setShowForm(true); setEditingTask(null); setEditingSubtasks([]); createForm.reset(); },
    onSearch: () => searchInputRef.current?.focus(),
    onEscape: () => { setShowForm(false); setEditingTask(null); setEditingSubtasks([]); },
  })

  const queryClient = useQueryClient()

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  })

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const createTask = useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tarefa criada com sucesso!')
    },
    onError: (error) => toast.error(error.message),
  })

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => tasksApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      toast.success('Tarefa atualizada com sucesso!')
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tarefa excluída com sucesso!')
    },
    onError: (error) => toast.error(error.message),
  })

  const toggleTask = useMutation({
    mutationFn: (id: string) => tasksApi.toggle(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
    onError: (error) => toast.error(error.message),
  })

  const createForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', dueDate: '', projectId: '', status: 'todo' },
  })

  const updateForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', dueDate: '', projectId: '', status: 'todo' },
  })

  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.filter((task) => {
      const matchesSearch = searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesProject = filterProject === 'all' || task.projectId === filterProject
      return matchesSearch && matchesStatus && matchesProject
    })
  }, [tasks, searchQuery, filterStatus, filterProject])

  const hasActiveFilters = searchQuery !== '' || filterStatus !== 'all' || filterProject !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
    setFilterProject('all')
  }

  const handleCreateSubmit = (data: TaskFormData) => {
    createTask.mutate({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate || undefined,
      projectId: data.projectId || undefined,
      status: data.status || 'todo',
    }, {
      onSuccess: () => {
        createForm.reset()
        setShowForm(false)
      },
    })
  }

  const handleUpdateSubmit = (data: TaskFormData) => {
    if (!editingTask) return
    updateTask.mutate({ id: editingTask.id, data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate || undefined,
      projectId: data.projectId || undefined,
      status: data.status || editingTask.status,
      subtasks: editingSubtasks,
    } }, {
      onSuccess: () => {
        updateForm.reset()
        setEditingTask(null)
        setEditingSubtasks([])
        setShowForm(false)
      },
    })
  }

  const handleToggle = (id: string) => {
    toggleTask.mutate(id)
  }

  const handleDelete = (id: string) => {
    setTaskToDelete(id)
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask.mutate(taskToDelete)
      setTaskToDelete(null)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setEditingSubtasks(task.subtasks || [])
    updateForm.reset({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      projectId: task.projectId || '',
      status: task.status || 'todo',
    })
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="tasks-header">
          <div className="skeleton skeleton-title" style={{ width: '10rem', height: '2rem' }} />
        </div>
        <div className="tasks-filters">
          <div className="skeleton" style={{ width: '100%', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
        </div>
        <div className="skeleton-table">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-table-row">
              <div className="skeleton skeleton-checkbox" />
              <div className="skeleton-table-content">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text short" />
              </div>
            </div>
          ))}
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="tasks-error">
          Erro ao carregar tarefas: {(error as Error).message}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ConfirmDialog
        isOpen={taskToDelete !== null}
        title="Excluir tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
      <div className="tasks-header">
        <h1 className="tasks-title">Minhas Tarefas</h1>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(true); setEditingTask(null); setEditingSubtasks([]); createForm.reset(); }}
        >
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </button>
      </div>

      <div className="tasks-filters">
        <div className="tasks-search">
          <Search className="tasks-search-icon h-4 w-4" />
          <input
            ref={searchInputRef}
            type="text"
            className="form-input tasks-search-input"
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="tasks-search-clear" onClick={() => setSearchQuery('')}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="tasks-filter-group">
          <Filter className="h-4 w-4" />
          <select
            className="form-input tasks-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="all">Todos os status</option>
            <option value="todo">A Fazer</option>
            <option value="in_progress">Em Andamento</option>
            <option value="done">Concluído</option>
          </select>
          <select
            className="form-input tasks-filter-select"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="all">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Limpar
            </button>
          )}
              </div>
            </div>

      {(showForm || editingTask) && (
        <div className="task-form">
          <div className="task-form-card">
            <div className="task-form-header">
              <h2 className="task-form-title">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
            </div>
            <div className="task-form-content">
              <form
                onSubmit={editingTask ? updateForm.handleSubmit(handleUpdateSubmit) : createForm.handleSubmit(handleCreateSubmit)}
                className="auth-form"
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Título</label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    placeholder="Título da tarefa"
                    {...(editingTask ? updateForm.register('title') : createForm.register('title'))}
                  />
                  {(editingTask ? updateForm.formState.errors.title : createForm.formState.errors.title) && (
                    <p className="form-error">
                      {(editingTask ? updateForm.formState.errors.title : createForm.formState.errors.title)?.message}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Descrição (opcional)</label>
                  <textarea
                    id="description"
                    className="form-input form-textarea"
                    placeholder="Descrição da tarefa"
                    rows={3}
                    {...(editingTask ? updateForm.register('description') : createForm.register('description'))}
                  />
                </div>
                <div className="task-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dueDate">Data de vencimento</label>
                    <input
                      id="dueDate"
                      type="date"
                      className="form-input"
                      {...(editingTask ? updateForm.register('dueDate') : createForm.register('dueDate'))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="projectId">Projeto</label>
                    <select
                      id="projectId"
                      className="form-input"
                      {...(editingTask ? updateForm.register('projectId') : createForm.register('projectId'))}
                    >
                      <option value="">Nenhum</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select
                      id="status"
                      className="form-input"
                      {...(editingTask ? updateForm.register('status') : createForm.register('status'))}
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
                      disabled={updateTask.isPending}
                    />
                  </div>
                )}
                <div className="task-form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createTask.isPending || updateTask.isPending}
                  >
                    {createTask.isPending || updateTask.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      editingTask ? 'Salvar Alterações' : 'Criar Tarefa'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setShowForm(false); setEditingTask(null); setEditingSubtasks([]); createForm.reset(); updateForm.reset(); }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="tasks-empty">
            <CheckSquare className="tasks-empty-icon" />
            <h3 className="tasks-empty-title">
              {hasActiveFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda'}
            </h3>
            <p className="tasks-empty-description">
              {hasActiveFilters
                ? 'Tente ajustar os filtros ou limpe a busca.'
                : showForm || editingTask
                  ? 'Crie sua primeira tarefa acima'
                  : 'Clique em "Nova Tarefa" para começar.'}
            </p>
            {hasActiveFilters && (
              <button className="btn btn-secondary" onClick={clearFilters}>
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              layout
              onClick={() => setSelectedTask(task)}
              style={{ cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                className="checkbox-input task-checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id)}
                disabled={toggleTask.isPending}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
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
                  {task.projectId && (
                    <span className="task-project-badge">
                      {projects.find(p => p.id === task.projectId)?.name || 'Projeto'}
                    </span>
                  )}
                </div>
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="task-subtasks">
                    <div className="task-subtask-progress">
                      {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtarefas concluídas
                    </div>
                    <div className="task-subtask-list">
                      {task.subtasks.map((subtask) => (
                        <div key={subtask.id} className={`task-subtask-item ${subtask.completed ? 'completed' : ''}`}>
                          <input
                            type="checkbox"
                            className="checkbox-input"
                            checked={subtask.completed}
                            readOnly
                          />
                          <span>{subtask.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="task-meta">
                  Criado em {format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  {task.updatedAt !== task.createdAt && (
                    <> · Atualizado em {format(new Date(task.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</>
                  )}
                </p>
              </div>
              <div className="task-actions">
                <button
                  className="task-action-btn"
                  onClick={() => handleEdit(task)}
                  disabled={editingTask !== null || updateTask.isPending}
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  className="task-action-btn danger"
                  onClick={() => handleDelete(task.id)}
                  disabled={deleteTask.isPending}
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
      <TaskSlideOver task={selectedTask} onClose={() => setSelectedTask(null)} />
    </AppLayout>
  )
}
