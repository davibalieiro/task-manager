export interface Habit {
  id: string
  name: string
  target: number
  unit: string
  color: string
  iconKey: string
  current: number
  lastResetDate: string
  createdAt: string
  updatedAt: string
}

export interface CreateHabitInput {
  name: string
  target: number
  unit: string
  color: string
  iconKey: string
}

export interface UpdateHabitInput {
  name?: string
  target?: number
  unit?: string
  color?: string
  iconKey?: string
  current?: number
}
