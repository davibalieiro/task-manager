import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task } from '@/features/tasks/types/task'
import { X, Calendar, Folder, Clock, CheckCircle2, Circle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TaskSlideOverProps {
  task: Task | null
  onClose: () => void
}

export function TaskSlideOver({ task, onClose }: TaskSlideOverProps) {
  useEffect(() => {
    if (task) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [task])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && task) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [task, onClose])

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.div
            className="slide-over-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="slide-over-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="slide-over-header">
              <h2 className="slide-over-title">Detalhes da Tarefa</h2>
              <button className="slide-over-close" onClick={onClose} aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="slide-over-content">
              <div className="slide-over-field">
                <span className="slide-over-label">Titulo</span>
                <span className="slide-over-value slide-over-value-title">{task.title}</span>
              </div>

              {task.description && (
                <div className="slide-over-field">
                  <span className="slide-over-label">Descricao</span>
                  <span className="slide-over-value">{task.description}</span>
                </div>
              )}

              <div className="slide-over-field">
                <span className="slide-over-label">Status</span>
                <div className="slide-over-status">
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: '#22c55e' }} />
                  ) : task.status === 'in_progress' ? (
                    <Clock className="h-4 w-4" style={{ color: '#f59e0b' }} />
                  ) : (
                    <Circle className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <span>
                    {task.completed ? 'Concluido' : task.status === 'in_progress' ? 'Em andamento' : 'A fazer'}
                  </span>
                </div>
              </div>

              {task.dueDate && (
                <div className="slide-over-field">
                  <span className="slide-over-label">
                    <Calendar className="h-3 w-3" />
                    Data de vencimento
                  </span>
                  <span className="slide-over-value">
                    {format(new Date(task.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}

              {task.projectId && (
                <div className="slide-over-field">
                  <span className="slide-over-label">
                    <Folder className="h-3 w-3" />
                    Projeto
                  </span>
                  <span className="slide-over-value">{task.projectId}</span>
                </div>
              )}

              {task.subtasks && task.subtasks.length > 0 && (
                <div className="slide-over-field">
                  <span className="slide-over-label">Subtarefas ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</span>
                  <div className="slide-over-subtasks">
                    {task.subtasks.map((sub) => (
                      <div key={sub.id} className="slide-over-subtask">
                        {sub.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
                        ) : (
                          <Circle className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                        )}
                        <span className={sub.completed ? 'slide-over-subtask-done' : ''}>{sub.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="slide-over-field">
                <span className="slide-over-label">
                  <Clock className="h-3 w-3" />
                  Criado em
                </span>
                <span className="slide-over-value">
                  {format(new Date(task.createdAt), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                </span>
              </div>

              <div className="slide-over-field">
                <span className="slide-over-label">
                  <Clock className="h-3 w-3" />
                  Atualizado em
                </span>
                <span className="slide-over-value">
                  {format(new Date(task.updatedAt), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
