import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects'
import type { Project, ProjectStatus } from '../types/project'
import type { Task } from '@/features/tasks/types/task'
import { tasksApi } from '@/features/tasks/api/tasks'
import { AppLayout } from '@/shared/components/AppLayout'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Plus, Trash2, Edit2, Loader2, FolderKanban, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, type CreateProjectFormData } from '../schemas/project'

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
]

const STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: 'Pendente',
  completed: 'Concluído',
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  pending: '#eab308',
  completed: '#22c55e',
}

export function ProjectList() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all')
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  const { data: projects, isLoading, error } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  })

  const taskStats = useMemo(() => {
    const stats: Record<string, { todo: number; in_progress: number; done: number; total: number }> = {}
    allTasks.forEach((task) => {
      if (!task.projectId) return
      if (!stats[task.projectId]) {
        stats[task.projectId] = { todo: 0, in_progress: 0, done: 0, total: 0 }
      }
      stats[task.projectId].total++
      if (task.status === 'done' || task.completed) {
        stats[task.projectId].done++
      } else if (task.status === 'in_progress') {
        stats[task.projectId].in_progress++
      } else {
        stats[task.projectId].todo++
      }
    })
    return stats
  }, [allTasks])

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', description: '', color: '#6366f1' },
  })

  const filteredProjects = projects?.filter((p) =>
    filterStatus === 'all' || p.status === filterStatus
  )

  const handleSubmit = (data: CreateProjectFormData) => {
    if (editingProject) {
      updateProject.mutate({ id: editingProject.id, data }, {
        onSuccess: () => {
          form.reset()
          setEditingProject(null)
          setShowForm(false)
        },
      })
    } else {
      createProject.mutate(data, {
        onSuccess: () => {
          form.reset()
          setShowForm(false)
        },
      })
    }
  }

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProject(project)
    form.reset({ name: project.name, description: project.description, color: project.color })
    setShowForm(true)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToDelete(id)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete)
      setProjectToDelete(null)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProject(null)
    form.reset()
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="projects-loading">
          <Loader2 className="spinner-lg" />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="projects-error">
          Erro ao carregar projetos: {(error as Error).message}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ConfirmDialog
        isOpen={projectToDelete !== null}
        title="Excluir projeto"
        message="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
      <div className="projects-header">
          <h1 className="projects-title">Meus Projetos</h1>
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditingProject(null); form.reset(); }}
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </button>
        </div>

        <div className="projects-filters">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'Todos' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {(showForm || editingProject) && (
          <div className="project-form">
            <div className="project-form-card">
              <div className="project-form-header">
                <h2 className="project-form-title">
                  {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                </h2>
              </div>
              <div className="project-form-content">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="auth-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Nome</label>
                    <input
                      id="name"
                      type="text"
                      className="form-input"
                      placeholder="Nome do projeto"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="form-error">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="description">Descrição (opcional)</label>
                    <textarea
                      id="description"
                      className="form-input form-textarea"
                      placeholder="Descrição do projeto"
                      rows={3}
                      {...form.register('description')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cor</label>
                    <div className="color-picker">
                      {PROJECT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${form.watch('color') === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => form.setValue('color', color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="task-form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={createProject.isPending || updateProject.isPending}
                    >
                      {createProject.isPending || updateProject.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        editingProject ? 'Salvar Alterações' : 'Criar Projeto'
                      )}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="projects-grid">
          {filteredProjects?.length === 0 ? (
            <div className="projects-empty">
              <FolderKanban className="projects-empty-icon" />
              <h3 className="projects-empty-title">
                {filterStatus !== 'all' ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
              </h3>
              <p className="projects-empty-description">
                {filterStatus !== 'all'
                  ? 'Tente mudar o filtro.'
                  : showForm || editingProject
                    ? 'Crie seu primeiro projeto acima.'
                    : 'Clique em "Novo Projeto" para começar.'}
              </p>
            </div>
          ) : (
            filteredProjects?.map((project) => {
              const stats = taskStats[project.id]
              const progress = stats && stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
              return (
              <div
                key={project.id}
                className={`project-card project-card-${project.status}`}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="project-card-header">
                  <div className="project-card-color" style={{ backgroundColor: project.color }} />
                  <div className="project-card-actions">
                    <button
                      className="task-action-btn"
                      onClick={(e) => handleEdit(project, e)}
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="task-action-btn danger"
                      onClick={(e) => handleDelete(project.id, e)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="project-card-name">{project.name}</h3>
                {project.description && (
                  <p className="project-card-description">{project.description}</p>
                )}
                {stats && stats.total > 0 && (
                  <div className="project-card-stats">
                    <div className="project-card-progress-bar">
                      <div className="project-card-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="project-card-stat-row">
                      <span className="project-card-stat">
                        <span className="stat-dot stat-dot-done" /> {stats.done}
                      </span>
                      <span className="project-card-stat">
                        <span className="stat-dot stat-dot-progress" /> {stats.in_progress}
                      </span>
                      <span className="project-card-stat">
                        <span className="stat-dot stat-dot-todo" /> {stats.todo}
                      </span>
                      <span className="project-card-stat-total">{stats.total} tarefas</span>
                    </div>
                  </div>
                )}
                <div className="project-card-footer">
                  <span
                    className="project-status-badge"
                    style={{ backgroundColor: STATUS_COLORS[project.status] }}
                  >
                    {STATUS_LABELS[project.status]}
                  </span>
                  <span className="project-card-date">
                    {format(new Date(project.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <div className="project-card-link">
                  Ver detalhes <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            )})
          )}
        </div>
    </AppLayout>
  )
}
