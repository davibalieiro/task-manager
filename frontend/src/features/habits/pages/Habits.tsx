import { useState } from 'react'
import { AppLayout } from '@/shared/components/AppLayout'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useHabits, useCreateHabit, useUpdateHabit, useDeleteHabit, useToggleHabit } from '../hooks/useHabits'
import type { Habit } from '../types/habit'
import {
  Flame,
  Plus,
  Trash2,
  Edit2,
  X,
  Dumbbell,
  Droplets,
  BookOpen,
  Bed,
  Footprints,
  Music,
  Code,
  Coffee,
  Heart,
  Leaf,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'

const habitSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  target: z.coerce.number().min(1, 'Meta deve ser pelo menos 1').max(999),
  unit: z.string().min(1, 'Unidade é obrigatória').max(20),
  color: z.string().min(1, 'Cor é obrigatória'),
  iconKey: z.string().min(1, 'Ícone é obrigatório'),
})

type HabitFormData = z.infer<typeof habitSchema>

const iconOptions = [
  { key: 'flame', icon: Flame, label: 'Chama' },
  { key: 'dumbbell', icon: Dumbbell, label: 'Exercício' },
  { key: 'droplets', icon: Droplets, label: 'Água' },
  { key: 'book', icon: BookOpen, label: 'Leitura' },
  { key: 'bed', icon: Bed, label: 'Sono' },
  { key: 'footprints', icon: Footprints, label: 'Caminhar' },
  { key: 'music', icon: Music, label: 'Música' },
  { key: 'code', icon: Code, label: 'Código' },
  { key: 'coffee', icon: Coffee, label: 'Café' },
  { key: 'heart', icon: Heart, label: 'Saúde' },
  { key: 'leaf', icon: Leaf, label: 'Natureza' },
]

const colorOptions = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#14b8a6',
  '#6366f1',
]

function getIcon(key: string) {
  const found = iconOptions.find((o) => o.key === key)
  return found?.icon || Flame
}

export function Habits() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)

  const { data: habits = [], isLoading } = useHabits()
  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit()
  const deleteHabit = useDeleteHabit()
  const toggleHabit = useToggleHabit()

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      target: 1,
      unit: '',
      color: '#3b82f6',
      iconKey: 'flame',
    },
  })

  const handleCreate = (data: HabitFormData) => {
    createHabit.mutate(data, {
      onSuccess: () => {
        toast.success('Hábito criado com sucesso!')
        form.reset({ name: '', target: 1, unit: '', color: '#3b82f6', iconKey: 'flame' })
        setShowForm(false)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  const handleEdit = (habit: Habit) => {
    setEditingId(habit.id)
    form.reset({
      name: habit.name,
      target: habit.target,
      unit: habit.unit,
      color: habit.color,
      iconKey: habit.iconKey,
    })
    setShowForm(true)
  }

  const handleUpdate = (data: HabitFormData) => {
    if (!editingId) return
    updateHabit.mutate({ id: editingId, data }, {
      onSuccess: () => {
        toast.success('Hábito atualizado com sucesso!')
        setEditingId(null)
        form.reset({ name: '', target: 1, unit: '', color: '#3b82f6', iconKey: 'flame' })
        setShowForm(false)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowForm(false)
    form.reset({ name: '', target: 1, unit: '', color: '#3b82f6', iconKey: 'flame' })
  }

  const handleDelete = (id: string) => {
    setHabitToDelete(id)
  }

  const confirmDelete = () => {
    if (habitToDelete) {
      deleteHabit.mutate(habitToDelete, {
        onSuccess: () => toast.success('Hábito excluído com sucesso!'),
        onError: (error) => toast.error(error.message),
      })
      setHabitToDelete(null)
    }
  }

  const handleIncrement = (habit: Habit) => {
    toggleHabit.mutate({ id: habit.id, direction: 'increment', currentValue: habit.current, target: habit.target })
  }

  const handleDecrement = (habit: Habit) => {
    toggleHabit.mutate({ id: habit.id, direction: 'decrement', currentValue: habit.current, target: habit.target })
  }

  const handleReset = (habit: Habit) => {
    toggleHabit.mutate({ id: habit.id, direction: 'reset', currentValue: habit.current, target: habit.target })
  }

  const getStreak = (habit: Habit) => {
    if (!habit.lastResetDate) return 0
    const lastReset = new Date(habit.lastResetDate)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24))
    if (habit.current >= habit.target) return Math.max(diffDays, 1)
    return 0
  }

  return (
    <AppLayout>
      <ConfirmDialog
        isOpen={habitToDelete !== null}
        title="Excluir hábito"
        message="Tem certeza que deseja excluir este hábito? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setHabitToDelete(null)}
      />
      <div className="dashboard-header">
          <div className="dashboard-header-left">
            <h1 className="dashboard-title">Hábitos</h1>
            <p className="dashboard-subtitle">Crie e acompanhe seus hábitos diários</p>
          </div>
          <div className="dashboard-header-right">
            <button
              className="btn btn-primary"
              onClick={() => { setShowForm(true); setEditingId(null); form.reset({ name: '', target: 1, unit: '', color: '#3b82f6', iconKey: 'flame' }); }}
            >
              <Plus className="h-4 w-4" />
              Novo Hábito
            </button>
          </div>
        </div>

        {showForm && (
          <div className="habit-form-card">
            <div className="habit-form-header">
              <h3 className="chart-card-title">{editingId ? 'Editar Hábito' : 'Novo Hábito'}</h3>
              <button className="habit-form-close" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={editingId ? form.handleSubmit(handleUpdate) : form.handleSubmit(handleCreate)}
              className="habit-form-body"
            >
              <div className="habit-form-grid">
                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Beber água"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="form-error">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Meta</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="8"
                    {...form.register('target')}
                  />
                  {form.formState.errors.target && (
                    <p className="form-error">{form.formState.errors.target.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Unidade</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: copos, vezes, min"
                    {...form.register('unit')}
                  />
                  {form.formState.errors.unit && (
                    <p className="form-error">{form.formState.errors.unit.message}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ícone</label>
                <div className="habit-icon-picker">
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        className={`habit-icon-option ${form.watch('iconKey') === opt.key ? 'selected' : ''}`}
                        onClick={() => form.setValue('iconKey', opt.key)}
                        title={opt.label}
                        style={form.watch('iconKey') === opt.key ? { background: `${form.watch('color')}20`, color: form.watch('color'), borderColor: form.watch('color') } : {}}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    )
                  })}
                </div>
                {form.formState.errors.iconKey && (
                  <p className="form-error">{form.formState.errors.iconKey.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Cor</label>
                <div className="habit-color-picker">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`habit-color-option ${form.watch('color') === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => form.setValue('color', color)}
                    />
                  ))}
                </div>
                {form.formState.errors.color && (
                  <p className="form-error">{form.formState.errors.color.message}</p>
                )}
              </div>

              <div className="habit-form-actions">
                <button type="submit" className="btn btn-primary" disabled={createHabit.isPending || updateHabit.isPending}>
                  {(createHabit.isPending || updateHabit.isPending) ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                  ) : editingId ? 'Salvar Alterações' : 'Criar Hábito'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <>
            <div className="dashboard-header">
              <div className="dashboard-header-left">
                <div className="skeleton skeleton-title" style={{ width: '8rem', height: '2rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '14rem', marginTop: '0.5rem' }} />
              </div>
            </div>
            <div className="skeleton-table">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-table-row" style={{ padding: 'var(--space-4)' }}>
                  <div className="skeleton skeleton-icon" />
                  <div className="skeleton-table-content">
                    <div className="skeleton skeleton-title" style={{ width: '40%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                  </div>
                  <div className="skeleton" style={{ width: '6rem', height: '2rem' }} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="habits-list">
            {habits.length === 0 ? (
              <div className="habits-empty">
                <Flame className="habits-empty-icon" />
                <h3 className="habits-empty-title">Nenhum hábito cadastrado</h3>
                <p className="habits-empty-description">
                  Clique em "Novo Hábito" para criar seu primeiro hábito.
                </p>
              </div>
            ) : (
              habits.map((habit) => {
                const Icon = getIcon(habit.iconKey)
                const percentage = habit.target > 0 ? Math.min(Math.round((habit.current / habit.target) * 100), 100) : 0

                return (
                  <motion.div
                    key={habit.id}
                    className="habit-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <div className="habit-item-left">
                      <div className="habit-item-icon" style={{ background: `${habit.color}20`, color: habit.color }}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="habit-item-info">
                        <span className="habit-item-name">{habit.name}</span>
                        <span className="habit-item-meta">
                          {habit.unit} · Meta: {habit.target}
                          {getStreak(habit) > 0 && (
                            <span style={{ color: '#f97316', marginLeft: '0.5rem', fontWeight: 600 }}>
                              🔥 {getStreak(habit)} {getStreak(habit) === 1 ? 'dia' : 'dias'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="habit-item-center">
                      <div className="habit-item-progress">
                        <div className="habit-progress-bar">
                          <div
                            className="habit-progress-fill"
                            style={{ width: `${percentage}%`, background: habit.color }}
                          />
                        </div>
                        <span className="habit-item-percentage" style={{ color: habit.color }}>
                          {habit.current}/{habit.target} ({percentage}%)
                        </span>
                      </div>
                      <div className="habit-history" style={{ display: 'flex', gap: '2px', marginTop: '0.25rem' }}>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const dayOffset = 6 - i
                          const isCompleted = dayOffset < getStreak(habit)
                          return (
                            <div
                              key={i}
                              style={{
                                width: '0.75rem',
                                height: '0.75rem',
                                borderRadius: '2px',
                                background: isCompleted ? habit.color : 'rgba(255,255,255,0.06)',
                                opacity: isCompleted ? 1 : 0.5,
                              }}
                              title={isCompleted ? `${7 - dayOffset} dias atras` : 'Sem registro'}
                            />
                          )
                        })}
                      </div>
                    </div>

                    <div className="habit-item-actions">
                      <button
                        className="habit-action-btn"
                        onClick={() => handleDecrement(habit)}
                        disabled={habit.current === 0 || toggleHabit.isPending}
                        title="Diminuir"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <span className="habit-item-count" style={{ color: habit.color }}>{habit.current}</span>
                      <button
                        className="habit-action-btn"
                        onClick={() => handleIncrement(habit)}
                        disabled={habit.current >= habit.target || toggleHabit.isPending}
                        title="Aumentar"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <div className="habit-item-divider" />
                      <button
                        className="habit-action-btn"
                        onClick={() => handleReset(habit)}
                        disabled={toggleHabit.isPending}
                        title="Resetar"
                      >
                        <span className="habit-reset-text">Reset</span>
                      </button>
                      <button className="habit-action-btn" onClick={() => handleEdit(habit)} title="Editar">
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button className="habit-action-btn habit-action-danger" onClick={() => handleDelete(habit.id)} title="Excluir">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        )}
    </AppLayout>
  )
}
