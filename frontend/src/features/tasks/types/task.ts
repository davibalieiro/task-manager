export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Subtask {
  id: string
  text: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  status: TaskStatus
  position: number
  userId: string
  projectId?: string
  dueDate?: string
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  projectId?: string
  status?: TaskStatus
  position?: number
  dueDate?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  completed?: boolean
  status?: TaskStatus
  position?: number
  projectId?: string | null
  dueDate?: string | null
  subtasks?: Subtask[]
}