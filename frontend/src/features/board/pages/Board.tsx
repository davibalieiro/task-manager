import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import type { Task, TaskStatus, UpdateTaskInput } from '@/features/tasks/types/task'
import { tasksApi } from '@/features/tasks/api/tasks'
import { AppLayout } from '@/shared/components/AppLayout'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Plus, Loader2, GripVertical, Trash2, Edit2, CheckSquare, Calendar } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'A Fazer', color: '#6366f1' },
  { id: 'in_progress', title: 'Em Andamento', color: '#f97316' },
  { id: 'done', title: 'Concluído', color: '#22c55e' },
]

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100),
  description: z.string().max(500).optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

function SortableTaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: (t: Task) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`board-task-card ${isDragging ? 'dragging' : ''}`}>
      <div className="board-task-header">
        <button className="board-task-drag" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="board-task-actions">
          <button className="task-action-btn" onClick={() => onEdit(task)} title="Editar">
            <Edit2 className="h-3 w-3" />
          </button>
          <button className="task-action-btn danger" onClick={() => onDelete(task.id)} title="Excluir">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <h4 className="board-task-title">{task.title}</h4>
      {task.description && (
        <p className="board-task-description">{task.description}</p>
      )}
      {task.dueDate && (
        <div className="board-task-due">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
      )}
    </div>
  )
}

function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <div className="board-task-card overlay">
      <h4 className="board-task-title">{task.title}</h4>
      {task.description && (
        <p className="board-task-description">{task.description}</p>
      )}
    </div>
  )
}

export function Board() {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus>('todo')
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => toast.error(error.message),
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData & { status: TaskStatus }) =>
      tasksApi.create({ title: data.title, description: data.description, status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setShowForm(false)
      toast.success('Tarefa criada com sucesso!')
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

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '' },
  })

  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    }
    if (tasks) {
      tasks.forEach((task) => {
        const status = task.status || 'todo'
        grouped[status].push(task)
      })
      Object.keys(grouped).forEach((status) => {
        grouped[status as TaskStatus].sort((a, b) => a.position - b.position)
      })
    }
    return grouped
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const findTaskById = (id: string): Task | undefined => {
    return tasks?.find((t) => t.id === id)
  }

  const findColumnByTaskId = (id: string): TaskStatus | undefined => {
    for (const [status, columnTasks] of Object.entries(tasksByColumn)) {
      if (columnTasks.some((t) => t.id === id)) {
        return status as TaskStatus
      }
    }
    return undefined
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = findTaskById(active.id as string)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumnByTaskId(activeId)
    let overColumn = findColumnByTaskId(overId)

    if (!overColumn) {
      if (COLUMNS.some((c) => c.id === overId)) {
        overColumn = overId as TaskStatus
      }
    }

    if (!activeColumn || !overColumn || activeColumn === overColumn) return

    queryClient.setQueryData<Task[]>(['tasks'], (old) => {
      if (!old) return old
      const activeIndex = old.findIndex((t) => t.id === activeId)
      if (activeIndex === -1) return old
      const updated = [...old]
      updated[activeIndex] = { ...updated[activeIndex], status: overColumn! }
      return updated
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumnByTaskId(activeId)
    let overColumn = findColumnByTaskId(overId)

    if (!overColumn && COLUMNS.some((c) => c.id === overId)) {
      overColumn = overId as TaskStatus
    }

    if (!activeColumn || !overColumn) return

    if (activeColumn === overColumn) {
      const columnTasks = tasksByColumn[activeColumn]
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
      const newIndex = columnTasks.findIndex((t) => t.id === overId)

      if (oldIndex !== newIndex && newIndex >= 0) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex)
        queryClient.setQueryData<Task[]>(['tasks'], (old) => {
          if (!old) return old
          const otherTasks = old.filter((t) => t.status !== activeColumn)
          const updated = reordered.map((t, i) => ({ ...t, position: i }))
          return [...otherTasks, ...updated]
        })

        for (const [index, task] of reordered.entries()) {
          if (task.position !== index) {
            updateTaskMutation.mutate({ id: task.id, data: { position: index } })
          }
        }
      }
    } else {
      updateTaskMutation.mutate({ id: activeId, data: { status: overColumn } })
    }
  }

  const handleAddTask = (status: TaskStatus) => {
    setAddingToColumn(status)
    setEditingTask(null)
    form.reset()
    setShowForm(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setAddingToColumn(task.status)
    form.reset({ title: task.title, description: task.description || '' })
    setShowForm(true)
  }

  const handleSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        data: { title: data.title, description: data.description, status: addingToColumn },
      })
      setShowForm(false)
      setEditingTask(null)
    } else {
      createTaskMutation.mutate({ ...data, status: addingToColumn })
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="board-loading">
          <Loader2 className="spinner-lg" />
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
      <div className="board-header">
          <h1 className="board-title">Quadro Kanban</h1>
        </div>

        {showForm && (
          <div className="board-form">
            <div className="task-form-card">
              <div className="task-form-header">
                <h3 className="task-form-title">
                  {editingTask ? 'Editar Tarefa' : `Nova Tarefa - ${COLUMNS.find((c) => c.id === addingToColumn)?.title}`}
                </h3>
              </div>
              <div className="task-form-content">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="auth-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="board-task-title">Título</label>
                    <input
                      id="board-task-title"
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
                    <label className="form-label" htmlFor="board-task-desc">Descrição (opcional)</label>
                    <textarea
                      id="board-task-desc"
                      className="form-input form-textarea"
                      placeholder="Descrição da tarefa"
                      rows={2}
                      {...form.register('description')}
                    />
                  </div>
                  <div className="task-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={createTaskMutation.isPending}>
                      {createTaskMutation.isPending ? (
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="board-columns">
            {COLUMNS.map((column) => (
              <div key={column.id} className="board-column">
                <div className="board-column-header">
                  <div className="board-column-title-row">
                    <div className="board-column-dot" style={{ backgroundColor: column.color }} />
                    <h2 className="board-column-title">{column.title}</h2>
                    <span className="board-column-count">{tasksByColumn[column.id].length}</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleAddTask(column.id)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <SortableContext
                  items={tasksByColumn[column.id].map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="board-column-tasks" data-column-id={column.id}>
                    {tasksByColumn[column.id].length === 0 ? (
                      <div className="board-column-empty">
                        <CheckSquare className="h-8 w-8" />
                        <p>Nenhuma tarefa</p>
                      </div>
                    ) : (
                      tasksByColumn[column.id].map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
    </AppLayout>
  )
}
