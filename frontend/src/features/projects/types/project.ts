export type ProjectStatus = 'pending' | 'in_progress' | 'completed'

export interface Project {
  id: string
  name: string
  description: string
  color: string
  status: ProjectStatus
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  name: string
  description?: string
  color?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  color?: string
  status?: ProjectStatus
}
