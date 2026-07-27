export interface Goal {
  id: string
  name: string
  target: number
  unit: string
  current: number
  color: string
  iconKey: string
  createdAt: string
  updatedAt: string
}

export interface CreateGoalInput {
  name: string
  target: number
  unit: string
  color: string
  iconKey: string
}

export interface UpdateGoalInput {
  name?: string
  target?: number
  unit?: string
  current?: number
  color?: string
  iconKey?: string
}
