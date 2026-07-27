import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import toast from 'react-hot-toast'
import type { Task } from '@/features/tasks/types/task'
import type { Project } from '@/features/projects/types/project'
import { tasksApi } from '@/features/tasks/api/tasks'
import { projectsApi } from '@/features/projects/api/projects'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../hooks/useGoals'
import type { Goal } from '../types/goal'
import { AppLayout } from '@/shared/components/AppLayout'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Flame,
  CheckSquare,
  FolderKanban,
  TrendingUp,
  Award,
  BookOpen,
  Dumbbell,
  Droplets,
  Bed,
  Footprints,
  Music,
  Code,
  Coffee,
  Heart,
  Leaf,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const GOAL_ICONS = [
  { key: 'Target', icon: Target },
  { key: 'Flame', icon: Flame },
  { key: 'CheckSquare', icon: CheckSquare },
  { key: 'FolderKanban', icon: FolderKanban },
  { key: 'TrendingUp', icon: TrendingUp },
  { key: 'Award', icon: Award },
  { key: 'BookOpen', icon: BookOpen },
  { key: 'Dumbbell', icon: Dumbbell },
  { key: 'Droplets', icon: Droplets },
  { key: 'Bed', icon: Bed },
  { key: 'Footprints', icon: Footprints },
  { key: 'Music', icon: Music },
  { key: 'Code', icon: Code },
  { key: 'Coffee', icon: Coffee },
  { key: 'Heart', icon: Heart },
  { key: 'Leaf', icon: Leaf },
]

const GOAL_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
]

const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  target: z.number().min(1, 'Alvo deve ser maior que 0').max(9999),
  unit: z.string().min(1, 'Unidade é obrigatória').max(20),
  color: z.string(),
  iconKey: z.string(),
})

type GoalFormData = z.infer<typeof goalSchema>

export function Goals() {
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedIcon, setSelectedIcon] = useState('Target')
  const [selectedColor, setSelectedColor] = useState('#6366f1')
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)

  const { data: goals = [], isLoading: goalsLoading } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  })

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: { name: '', target: 1, unit: '', color: '#6366f1', iconKey: 'Target' },
  })

  const autoGoals = useMemo(() => {
    if (!tasks || !projects) return []

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const tasksCompletedTotal = tasks.filter((t) => t.completed).length
    const tasksCompletedThisWeek = tasks.filter((t) => {
      if (!t.completed) return false
      const date = new Date(t.updatedAt)
      return isWithinInterval(date, { start: weekStart, end: weekEnd })
    }).length
    const tasksCompletedThisMonth = tasks.filter((t) => {
      if (!t.completed) return false
      const date = new Date(t.updatedAt)
      return isWithinInterval(date, { start: monthStart, end: monthEnd })
    }).length

    const projectsCompleted = projects.filter((p) => p.status === 'completed').length

    const completionRate = tasks.length > 0
      ? Math.round((tasksCompletedTotal / tasks.length) * 100)
      : 0

    return [
      {
        id: 'auto-tasks-total',
        name: 'Total de Tarefas Concluídas',
        target: tasks.length || 1,
        current: tasksCompletedTotal,
        unit: 'tarefas',
        color: '#3b82f6',
        iconKey: 'CheckSquare',
        isAuto: true,
      },
      {
        id: 'auto-tasks-week',
        name: 'Tarefas Concluídas esta Semana',
        target: 10,
        current: tasksCompletedThisWeek,
        unit: 'tarefas',
        color: '#8b5cf6',
        iconKey: 'TrendingUp',
        isAuto: true,
      },
      {
        id: 'auto-tasks-month',
        name: 'Tarefas Concluídas este Mês',
        target: 30,
        current: tasksCompletedThisMonth,
        unit: 'tarefas',
        color: '#22c55e',
        iconKey: 'Target',
        isAuto: true,
      },
      {
        id: 'auto-projects',
        name: 'Projetos Concluídos',
        target: projects.length || 1,
        current: projectsCompleted,
        unit: 'projetos',
        color: '#f97316',
        iconKey: 'FolderKanban',
        isAuto: true,
      },
      {
        id: 'auto-rate',
        name: 'Taxa de Conclusão',
        target: 100,
        current: completionRate,
        unit: '%',
        color: '#eab308',
        iconKey: 'Award',
        isAuto: true,
      },
    ]
  }, [tasks, projects])

  const handleAddGoal = () => {
    setEditingGoal(null)
    setSelectedIcon('Target')
    setSelectedColor('#6366f1')
    form.reset({ name: '', target: 1, unit: '', color: '#6366f1', iconKey: 'Target' })
    setShowForm(true)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setSelectedIcon(goal.iconKey)
    setSelectedColor(goal.color)
    form.reset({ name: goal.name, target: goal.target, unit: goal.unit, color: goal.color, iconKey: goal.iconKey })
    setShowForm(true)
  }

  const handleSubmit = (data: GoalFormData) => {
    const goalData = { ...data, color: selectedColor, iconKey: selectedIcon }

    if (editingGoal) {
      updateGoal.mutate({ id: editingGoal.id, data: goalData }, {
        onSuccess: () => {
          toast.success('Meta atualizada com sucesso!')
          setShowForm(false)
          setEditingGoal(null)
        },
        onError: (error) => toast.error(error.message),
      })
    } else {
      createGoal.mutate(goalData, {
        onSuccess: () => {
          toast.success('Meta criada com sucesso!')
          setShowForm(false)
          setEditingGoal(null)
        },
        onError: (error) => toast.error(error.message),
      })
    }
  }

  const handleDeleteGoal = (id: string) => {
    setGoalToDelete(id)
  }

  const confirmDeleteGoal = () => {
    if (goalToDelete) {
      deleteGoal.mutate(goalToDelete, {
        onSuccess: () => toast.success('Meta excluída com sucesso!'),
        onError: (error) => toast.error(error.message),
      })
      setGoalToDelete(null)
    }
  }

  const handleIncrement = (goal: Goal) => {
    updateGoal.mutate({ id: goal.id, data: { current: Math.min(goal.current + 1, goal.target) } })
  }

  const handleDecrement = (goal: Goal) => {
    updateGoal.mutate({ id: goal.id, data: { current: Math.max(goal.current - 1, 0) } })
  }

  const handleReset = (goal: Goal) => {
    updateGoal.mutate({ id: goal.id, data: { current: 0 } })
  }

  const getIcon = (iconKey: string) => {
    const found = GOAL_ICONS.find((i) => i.key === iconKey)
    return found ? found.icon : Target
  }

  const getProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100)
  }

  const isLoading = goalsLoading || tasksLoading || projectsLoading

  if (isLoading) {
    return (
      <AppLayout>
        <div className="goals-header">
          <div className="skeleton skeleton-title" style={{ width: '6rem', height: '2rem' }} />
        </div>
        <div className="goals-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div className="skeleton skeleton-icon" />
                <div className="skeleton skeleton-text" style={{ width: '4rem' }} />
              </div>
              <div className="skeleton skeleton-title" style={{ width: '70%' }} />
              <div className="skeleton skeleton-text" style={{ width: '100%', marginTop: 'var(--space-3)' }} />
              <div className="skeleton" style={{ width: '100%', height: '0.5rem', marginTop: 'var(--space-3)' }} />
            </div>
          ))}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ConfirmDialog
        isOpen={goalToDelete !== null}
        title="Excluir meta"
        message="Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmDeleteGoal}
        onCancel={() => setGoalToDelete(null)}
      />
      <div className="goals-header">
          <h1 className="goals-title">Metas</h1>
          <button className="btn btn-primary" onClick={handleAddGoal}>
            <Plus className="h-4 w-4" />
            Nova Meta
          </button>
        </div>

        {showForm && (
          <div className="goals-form">
            <div className="task-form-card">
              <div className="task-form-header">
                <h3 className="task-form-title">
                  {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                </h3>
              </div>
              <div className="task-form-content">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="auth-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="goal-name">Nome</label>
                    <input
                      id="goal-name"
                      type="text"
                      className="form-input"
                      placeholder="Nome da meta"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="form-error">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="goals-form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="goal-target">Alvo</label>
                      <input
                        id="goal-target"
                        type="number"
                        className="form-input"
                        min={1}
                        {...form.register('target', { valueAsNumber: true })}
                      />
                      {form.formState.errors.target && (
                        <p className="form-error">{form.formState.errors.target.message}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="goal-unit">Unidade</label>
                      <input
                        id="goal-unit"
                        type="text"
                        className="form-input"
                        placeholder="ex: livros, vezes"
                        {...form.register('unit')}
                      />
                      {form.formState.errors.unit && (
                        <p className="form-error">{form.formState.errors.unit.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ícone</label>
                    <div className="goals-icon-picker">
                      {GOAL_ICONS.map(({ key, icon: Icon }) => (
                        <button
                          key={key}
                          type="button"
                          className={`goals-icon-option ${selectedIcon === key ? 'selected' : ''}`}
                          style={{ color: selectedColor }}
                          onClick={() => setSelectedIcon(key)}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cor</label>
                    <div className="color-picker">
                      {GOAL_COLORS.map((color) => (
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
                    <button type="submit" className="btn btn-primary" disabled={createGoal.isPending || updateGoal.isPending}>
                      {(createGoal.isPending || updateGoal.isPending) ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                      ) : editingGoal ? 'Salvar' : 'Criar Meta'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingGoal(null); }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="goals-section">
          <h2 className="goals-section-title">
            <TrendingUp className="h-5 w-5" />
            Metas Automáticas
          </h2>
          <p className="goals-section-description">Acompanhamento automático baseado nos seus dados</p>
          <div className="goals-grid">
            {autoGoals.map((goal) => {
              const Icon = getIcon(goal.iconKey)
              const progress = getProgress(goal.current, goal.target)
              return (
                <div key={goal.id} className="goal-card">
                  <div className="goal-card-header">
                    <div className="goal-card-icon" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="goal-card-badge auto">Automática</span>
                  </div>
                  <h3 className="goal-card-name">{goal.name}</h3>
                  <div className="goal-card-progress">
                    <div className="goal-progress-bar">
                      <div
                        className="goal-progress-fill"
                        style={{ width: `${progress}%`, backgroundColor: goal.color }}
                      />
                    </div>
                    <div className="goal-progress-text">
                      <span className="goal-progress-current">{goal.current}</span>
                      <span className="goal-progress-separator">/</span>
                      <span className="goal-progress-target">{goal.target} {goal.unit}</span>
                    </div>
                  </div>
                  <div className="goal-card-percentage" style={{ color: goal.color }}>
                    {progress}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="goals-section">
          <h2 className="goals-section-title">
            <Target className="h-5 w-5" />
            Metas Pessoais
          </h2>
          <p className="goals-section-description">Crie suas próprias metas personalizadas</p>
          {goals.length === 0 ? (
            <div className="goals-empty">
              <Target className="goals-empty-icon" />
              <h3 className="goals-empty-title">Nenhuma meta pessoal</h3>
              <p className="goals-empty-description">Clique em "Nova Meta" para criar sua primeira meta.</p>
            </div>
          ) : (
            <div className="goals-grid">
              {goals.map((goal) => {
                const Icon = getIcon(goal.iconKey)
                const progress = getProgress(goal.current, goal.target)
                return (
                  <div key={goal.id} className="goal-card">
                    <div className="goal-card-header">
                      <div className="goal-card-icon" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="goal-card-actions">
                        <button className="task-action-btn" onClick={() => handleEditGoal(goal)} title="Editar">
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button className="task-action-btn danger" onClick={() => handleDeleteGoal(goal.id)} title="Excluir">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <h3 className="goal-card-name">{goal.name}</h3>
                    <div className="goal-card-progress">
                      <div className="goal-progress-bar">
                        <div
                          className="goal-progress-fill"
                          style={{ width: `${progress}%`, backgroundColor: goal.color }}
                        />
                      </div>
                      <div className="goal-progress-text">
                        <span className="goal-progress-current">{goal.current}</span>
                        <span className="goal-progress-separator">/</span>
                        <span className="goal-progress-target">{goal.target} {goal.unit}</span>
                      </div>
                    </div>
                    <div className="goal-card-controls">
                      <button
                        className="goal-control-btn"
                        onClick={() => handleDecrement(goal)}
                        disabled={goal.current <= 0}
                      >
                        -
                      </button>
                      <span className="goal-card-percentage" style={{ color: goal.color }}>
                        {progress}%
                      </span>
                      <button
                        className="goal-control-btn"
                        onClick={() => handleIncrement(goal)}
                        disabled={goal.current >= goal.target}
                      >
                        +
                      </button>
                    </div>
                    <button className="goal-reset-btn" onClick={() => handleReset(goal)}>
                      Reiniciar
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
    </AppLayout>
  )
}
