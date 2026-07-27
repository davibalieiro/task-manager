import { useState } from 'react'
import { Plus, X, CheckSquare, Square } from 'lucide-react'
import type { Subtask } from '../types/task'

interface SubtasksProps {
  subtasks: Subtask[]
  onChange: (subtasks: Subtask[]) => void
  disabled?: boolean
}

export function Subtasks({ subtasks, onChange, disabled }: SubtasksProps) {
  const [newSubtaskText, setNewSubtaskText] = useState('')

  const handleAdd = () => {
    const text = newSubtaskText.trim()
    if (!text) return

    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    }
    onChange([...subtasks, newSubtask])
    setNewSubtaskText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleToggle = (id: string) => {
    onChange(
      subtasks.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    )
  }

  const handleDelete = (id: string) => {
    onChange(subtasks.filter((st) => st.id !== id))
  }

  const handleTextChange = (id: string, text: string) => {
    onChange(
      subtasks.map((st) =>
        st.id === id ? { ...st, text } : st
      )
    )
  }

  const completedCount = subtasks.filter((st) => st.completed).length
  const totalCount = subtasks.length

  return (
    <div className="task-subtasks">
      {totalCount > 0 && (
        <div className="task-subtask-progress">
          {completedCount}/{totalCount} concluídas
        </div>
      )}
      <div className="task-subtask-list">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className={`task-subtask-item ${subtask.completed ? 'completed' : ''}`}>
            <button
              type="button"
              className="task-subtask-check"
              onClick={() => handleToggle(subtask.id)}
              disabled={disabled}
            >
              {subtask.completed ? (
                <CheckSquare className="h-4 w-4" style={{ color: '#22c55e' }} />
              ) : (
                <Square className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
            <input
              type="text"
              className="form-input task-subtask-input"
              value={subtask.text}
              onChange={(e) => handleTextChange(subtask.id, e.target.value)}
              disabled={disabled || subtask.completed}
              placeholder="Texto da subtarefa..."
            />
            {!disabled && (
              <button
                type="button"
                className="task-subtask-delete"
                onClick={() => handleDelete(subtask.id)}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {!disabled && (
        <div className="task-subtask-add">
          <input
            type="text"
            className="form-input"
            placeholder="Adicionar subtarefa..."
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleAdd}
            disabled={!newSubtaskText.trim()}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
