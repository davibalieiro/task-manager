import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Task } from '@/features/tasks/types/task'
import { tasksApi } from '@/features/tasks/api/tasks'
import { AppLayout } from '@/shared/components/AppLayout'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100),
  description: z.string().max(500).optional(),
  dueDate: z.string().min(1, 'Data é obrigatória'),
})

type TaskFormData = z.infer<typeof taskSchema>

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => tasksApi.create({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setShowForm(false)
      form.reset()
      toast.success('Tarefa criada com sucesso!')
    },
    onError: (error) => toast.error(error.message),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string; dueDate?: string | null } }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setEditingTask(null)
      setShowForm(false)
      toast.success('Tarefa atualizada com sucesso!')
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tarefa excluída com sucesso!')
    },
    onError: (error) => toast.error(error.message),
  })

  const toggleTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', dueDate: '' },
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    if (tasks) {
      tasks.forEach((task) => {
        if (task.dueDate) {
          const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd')
          if (!grouped[dateKey]) grouped[dateKey] = []
          grouped[dateKey].push(task)
        }
      })
    }
    return grouped
  }, [tasks])

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return tasksByDate[dateKey] || []
  }, [selectedDate, tasksByDate])

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddTask = () => {
    setEditingTask(null)
    form.reset({
      title: '',
      description: '',
      dueDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    })
    setShowForm(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    form.reset({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    })
    setShowForm(true)
  }

  const handleSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        data: { title: data.title, description: data.description, dueDate: data.dueDate },
      })
    } else {
      createTaskMutation.mutate(data)
    }
  }

  const handleDelete = (id: string) => {
    setTaskToDelete(id)
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete)
      setTaskToDelete(null)
    }
  }

  const handleToggle = (id: string) => {
    toggleTaskMutation.mutate(id)
  }

  const getTaskCountForDate = (date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return tasksByDate[dateKey]?.length || 0
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="calendar-header">
          <div className="skeleton skeleton-title" style={{ width: '10rem', height: '2rem' }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: '20rem', borderRadius: 'var(--radius-xl)' }} />
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
      <div className="calendar-header">
          <h1 className="calendar-title">Calendário</h1>
          <button className="btn btn-primary" onClick={handleAddTask}>
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </button>
        </div>

        <div className="calendar-nav">
          <button className="btn btn-ghost" onClick={handlePrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="calendar-nav-center">
            <h2 className="calendar-month">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={handleToday}>
              Hoje
            </button>
          </div>
          <button className="btn btn-ghost" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {showForm && (
          <div className="calendar-form">
            <div className="task-form-card">
              <div className="task-form-header">
                <h3 className="task-form-title">
                  {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h3>
              </div>
              <div className="task-form-content">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="auth-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cal-task-title">Título</label>
                    <input
                      id="cal-task-title"
                      type="text"
                      className="form-input"
                      placeholder="Título da tarefa"
                      {...form.register('title')}
                    />
                    {form.formState.errors.title && (
                      <p className="form-error">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cal-task-desc">Descrição (opcional)</label>
                    <textarea
                      id="cal-task-desc"
                      className="form-input form-textarea"
                      placeholder="Descrição da tarefa"
                      rows={2}
                      {...form.register('description')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cal-task-date">Data de Vencimento</label>
                    <input
                      id="cal-task-date"
                      type="date"
                      className="form-input"
                      {...form.register('dueDate')}
                    />
                    {form.formState.errors.dueDate && (
                      <p className="form-error">{form.formState.errors.dueDate.message}</p>
                    )}
                  </div>
                  <div className="task-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
                      {createTaskMutation.isPending || updateTaskMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                      ) : editingTask ? 'Salvar' : 'Criar Tarefa'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingTask(null); }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-days">
            {calendarDays.map((date) => {
              const dateKey = format(date, 'yyyy-MM-dd')
              const taskCount = getTaskCountForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isTodayDate = isToday(date)

              return (
                <button
                  key={dateKey}
                  className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${taskCount > 0 ? 'has-tasks' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <span className="calendar-day-number">{format(date, 'd')}</span>
                  {taskCount > 0 && (
                    <span className="calendar-day-badge">{taskCount}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="calendar-detail">
            <div className="calendar-detail-header">
              <CalendarIcon className="h-5 w-5" />
              <h3 className="calendar-detail-title">
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
            </div>

            <div className="calendar-detail-tasks">
              {selectedDateTasks.length === 0 ? (
                <div className="calendar-detail-empty">
                  <CheckSquare className="h-8 w-8" />
                  <p>Nenhuma tarefa para este dia</p>
                </div>
              ) : (
                selectedDateTasks.map((task) => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <input
                      type="checkbox"
                      className="checkbox-input task-checkbox"
                      checked={task.completed}
                      onChange={() => handleToggle(task.id)}
                    />
                    <div className="task-content">
                      <h3 className="task-title">{task.title}</h3>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                    </div>
                    <div className="task-actions">
                      <button className="task-action-btn" onClick={() => handleEditTask(task)} title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="task-action-btn danger" onClick={() => handleDelete(task.id)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
    </AppLayout>
  )
}
