import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/features/tasks/api/tasks'
import { Search, X, CheckCircle2, Clock, Target, Calendar, BarChart3, Settings, Flame } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: BarChart3 },
  { label: 'Tarefas', path: '/tasks', icon: CheckCircle2 },
  { label: 'Board', path: '/board', icon: Clock },
  { label: 'Calendário', path: '/calendar', icon: Calendar },
  { label: 'Hábitos', path: '/habits', icon: Flame },
  { label: 'Metas', path: '/goals', icon: Target },
  { label: 'Projetos', path: '/projects', icon: Target },
  { label: 'Relatórios', path: '/reports', icon: BarChart3 },
  { label: 'Configurações', path: '/settings', icon: Settings },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
    enabled: open,
  })

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Ctrl+K is handled by App.tsx to avoid duplicate handlers

  useEffect(() => {
    if (!open) return
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = document.querySelectorAll('.command-palette-item, .command-palette-input, .command-palette-close')
      const first = focusable[0] as HTMLElement
      const last = focusable[focusable.length - 1] as HTMLElement
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [open])

  if (!open) return null

  const filteredNav = NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)

  const handleSelect = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <div className="command-palette-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Buscar páginas e tarefas">
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-input-wrapper" role="combobox" aria-expanded="true" aria-haspopup="listbox">
          <Search className="command-palette-search-icon" />
          <input
            ref={inputRef}
            className="command-palette-input"
            placeholder="Buscar páginas, tarefas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar"
            autoComplete="off"
          />
          <button className="command-palette-close" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="command-palette-results" role="listbox">
          {filteredNav.length > 0 && (
            <div className="command-palette-group">
              <span className="command-palette-group-label">Páginas</span>
              {filteredNav.map((item) => (
                <button
                  key={item.path}
                  className="command-palette-item"
                  onClick={() => handleSelect(item.path)}
                  role="option"
                  aria-selected={false}
                >
                  <item.icon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
          {filteredTasks.length > 0 && (
            <div className="command-palette-group">
              <span className="command-palette-group-label">Tarefas</span>
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  className="command-palette-item"
                  onClick={() => handleSelect('/tasks')}
                  role="option"
                  aria-selected={false}
                >
                  <div
                    className="command-palette-task-dot"
                    style={{
                      background: task.completed ? '#22c55e' : task.status === 'in_progress' ? '#f59e0b' : 'var(--brand-500)',
                    }}
                  />
                  <span>{task.title}</span>
                  <span className="command-palette-task-status">
                    {task.completed ? 'Concluído' : task.status === 'in_progress' ? 'Em andamento' : 'A fazer'}
                  </span>
                </button>
              ))}
            </div>
          )}
          {filteredNav.length === 0 && filteredTasks.length === 0 && (
            <div className="command-palette-empty">
              Nenhum resultado para "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
