import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/features/tasks/api/tasks'
import { habitsApi } from '@/features/habits/api/habits'
import type { Habit } from '@/features/habits/types/habit'
import { AppLayout } from '@/shared/components/AppLayout'
import { useNavigate } from 'react-router-dom'
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart3,
  CheckCircle2,
  Clock,
  CalendarDays,
  Flame,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Target,
  Activity,
} from 'lucide-react'

function useDashboardData(dateRange: string) {
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  })

  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: habitsApi.list,
  })

  const taskList = tasks || []
  const now = new Date()

  let rangeStart: Date
  switch (dateRange) {
    case 'week':
      rangeStart = startOfWeek(now, { weekStartsOn: 1 })
      break
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      rangeStart = new Date(now.getFullYear(), quarter * 3, 1)
      break
    }
    case 'year':
      rangeStart = startOfYear(now)
      break
    default:
      rangeStart = startOfMonth(now)
  }

  const rangeEnd = dateRange === 'week' ? endOfWeek(now, { weekStartsOn: 1 }) : now
  const filteredTasks = taskList.filter((t) => {
    const created = new Date(t.createdAt)
    return isWithinInterval(created, { start: rangeStart, end: rangeEnd })
  })

  const total = filteredTasks.length
  const completed = filteredTasks.filter((t) => t.completed).length
  const pending = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const habitsCompleted = habits.filter((h) => h.current >= h.target).length
  const habitsTotal = habits.length
  const habitsRate = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(now, 6 - i)
    const dayStart = startOfWeek(date, { weekStartsOn: 1 })
    const dayEnd = endOfWeek(date, { weekStartsOn: 1 })
    const dayTasks = taskList.filter((t) => {
      const created = new Date(t.createdAt)
      return isWithinInterval(created, { start: dayStart, end: dayEnd })
    })
    return {
      label: format(date, 'EEE', { locale: ptBR }),
      fullLabel: format(date, 'dd/MM'),
      created: dayTasks.length,
      done: dayTasks.filter((t) => t.completed).length,
    }
  })

  const lastWeek = taskList.filter((t) => {
    const created = new Date(t.createdAt)
    return created >= subDays(now, 7)
  })
  const lastWeekCompleted = lastWeek.filter((t) => t.completed).length

  const prevWeek = taskList.filter((t) => {
    const created = new Date(t.createdAt)
    return created >= subDays(now, 14) && created < subDays(now, 7)
  })
  const prevWeekCompleted = prevWeek.length

  const trendTotal = prevWeek.length > 0 ? Math.round(((lastWeek.length - prevWeek.length) / prevWeek.length) * 100) : 0
  const trendCompleted = prevWeekCompleted > 0 ? Math.round(((lastWeekCompleted - prevWeekCompleted) / prevWeekCompleted) * 100) : 0

  const recentActivity = useMemo(() => {
    const activity: Array<{ id: string; icon: string; text: string; time: string; color: string }> = []

    const recentTasks = [...taskList]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)

    recentTasks.forEach((task) => {
      const diff = Date.now() - new Date(task.updatedAt).getTime()
      const mins = Math.floor(diff / 60000)
      const hours = Math.floor(mins / 60)
      const days = Math.floor(hours / 24)
      let timeLabel = ''
      if (days > 0) timeLabel = `${days}d atras`
      else if (hours > 0) timeLabel = `${hours}h atras`
      else if (mins > 0) timeLabel = `${mins}m atras`
      else timeLabel = 'agora'

      activity.push({
        id: task.id,
        icon: task.completed ? 'check' : task.status === 'in_progress' ? 'clock' : 'target',
        text: task.completed ? `Concluiu "${task.title}"` : `Atualizou "${task.title}"`,
        time: timeLabel,
        color: task.completed ? '#22c55e' : task.status === 'in_progress' ? '#f59e0b' : 'var(--brand-400)',
      })
    })

    return activity
  }, [taskList])

  return {
    isLoading: tasksLoading || habitsLoading,
    total,
    completed,
    pending,
    completionRate,
    habitsCompleted,
    habitsTotal,
    habitsRate,
    habits,
    last7Days,
    lastWeekTotal: lastWeek.length,
    lastWeekCompleted,
    trendTotal,
    trendCompleted,
    recentActivity,
  }
}

export function Dashboard() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState('month')

  const {
    isLoading,
    total,
    completed,
    pending,
    completionRate,
    habitsCompleted,
    habitsTotal,
    habitsRate,
    habits,
    last7Days,
    lastWeekTotal,
    lastWeekCompleted,
    trendTotal,
    trendCompleted,
    recentActivity,
  } = useDashboardData(dateRange)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="skeleton skeleton-title" style={{ width: '10rem', height: '2rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '14rem', marginTop: '0.5rem' }} />
          </div>
        </div>
        <div className="dashboard-kpi-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-card skeleton-kpi">
              <div className="skeleton skeleton-icon" />
              <div className="skeleton-kpi-content">
                <div className="skeleton skeleton-text" style={{ width: '4rem' }} />
                <div className="skeleton skeleton-title" />
              </div>
            </div>
          ))}
        </div>
      </AppLayout>
    )
  }

  const maxDayTasks = Math.max(...last7Days.map((d) => d.created), 1)
  const now = new Date()

  const heatmapWeeks = Array.from({ length: 4 }, (_, weekIdx) =>
    Array.from({ length: 7 }, (_, dayIdx) => {
      const date = subDays(now, (3 - weekIdx) * 7 + (6 - dayIdx))
      const dayStart = startOfWeek(date, { weekStartsOn: 1 })
      const dayEnd = endOfWeek(date, { weekStartsOn: 1 })
      const completedHabits = habits.filter((h) => {
        const lastReset = new Date(h.lastResetDate)
        return h.current >= h.target && isWithinInterval(lastReset, { start: dayStart, end: dayEnd })
      }).length
      return { date, count: completedHabits }
    }),
  )

  return (
    <AppLayout>
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Visão geral do seu progresso</p>
        </div>
        <div className="dashboard-header-right">
          <div className="dashboard-date-filter">
            <CalendarDays className="dashboard-date-icon" />
            <select
              className="dashboard-date-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este ano</option>
            </select>
          </div>
          {/* Filtros - disponivel no seletor de periodo acima */}
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        {[
          {
            icon: <BarChart3 className="h-5 w-5" />,
            iconClass: 'kpi-icon-blue',
            label: 'Total de Tarefas',
            value: total,
            detail: 'Todas as tarefas cadastradas',
            trend: trendTotal,
            gradient: 'var(--gradient-blue)',
          },
          {
            icon: <Clock className="h-5 w-5" />,
            iconClass: 'kpi-icon-yellow',
            label: 'Pendentes',
            value: pending,
            detail: 'Tarefas a concluir',
            trend: null,
            gradient: 'var(--gradient-yellow)',
          },
          {
            icon: <CheckCircle2 className="h-5 w-5" />,
            iconClass: 'kpi-icon-green',
            label: 'Concluídas',
            value: completed,
            detail: `Taxa de conclusão: ${completionRate}%`,
            trend: trendCompleted,
            gradient: 'var(--gradient-green)',
          },
          {
            icon: <TrendingUp className="h-5 w-5" />,
            iconClass: 'kpi-icon-orange',
            label: 'Últimos 7 dias',
            value: lastWeekTotal,
            detail: `${lastWeekCompleted} concluídas nesse período`,
            trend: trendTotal,
            gradient: 'var(--gradient-orange)',
          },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.label}
            className="kpi-card kpi-card-gradient"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="kpi-card-top">
              <div className={`kpi-icon ${kpi.iconClass}`}>
                {kpi.icon}
              </div>
              {kpi.trend !== null && (
                <span className={`kpi-trend ${kpi.trend >= 0 ? 'kpi-trend-up' : 'kpi-trend-down'}`}>
                  {kpi.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(kpi.trend)}%
                </span>
              )}
            </div>
            <div className="kpi-info">
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-value">{kpi.value}</span>
              <span className="kpi-detail">{kpi.detail}</span>
            </div>
            <div className="kpi-gradient-bar" style={{ background: kpi.gradient }} />
          </motion.div>
        ))}
      </div>

      <div className="dashboard-charts-row">
        <div className="dashboard-chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Progresso de Conclusão</h3>
          </div>
          <div className="chart-card-content">
            <div className="progress-ring-container">
              <div className="progress-ring">
                <svg viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--brand-400)" />
                      <stop offset="100%" stopColor="var(--brand-600)" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - completionRate / 100)}`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="progress-ring-text">
                  <span className="progress-ring-value">{completionRate}%</span>
                  <span className="progress-ring-label">Concluído</span>
                </div>
              </div>
              <div className="progress-legend">
                <div className="progress-legend-item">
                  <span className="progress-legend-dot" style={{ background: '#22c55e' }} />
                  <span>Concluídas ({completed})</span>
                </div>
                <div className="progress-legend-item">
                  <span className="progress-legend-dot" style={{ background: 'var(--brand-500)' }} />
                  <span>Pendentes ({pending})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Atividade - Últimos 7 Dias</h3>
            <span className="chart-card-badge badge badge-primary">{lastWeekTotal} tarefas</span>
          </div>
          <div className="chart-card-content">
            <div className="area-chart">
              <svg viewBox="0 0 300 100" className="area-chart-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {last7Days.map((day, i) => {
                  const x = (i / 6) * 280 + 10
                  const y = 90 - (day.created / maxDayTasks) * 70
                  return i === 0 ? null : (
                    <line
                      key={`line-${i}`}
                      x1={(i - 1) / 6 * 280 + 10}
                      y1={90 - (last7Days[i - 1].created / maxDayTasks) * 70}
                      x2={x}
                      y2={y}
                      stroke="var(--brand-500)"
                      strokeWidth="2"
                    />
                  )
                })}
                {last7Days.map((day, i) => {
                  const x = (i / 6) * 280 + 10
                  const y = 90 - (day.created / maxDayTasks) * 70
                  return (
                    <circle key={`dot-${i}`} cx={x} cy={y} r="3" fill="var(--brand-500)" />
                  )
                })}
                <polygon
                  points={last7Days.map((day, i) => {
                    const x = (i / 6) * 280 + 10
                    const y = 90 - (day.created / maxDayTasks) * 70
                    return `${x},${y}`
                  }).join(' ') + ` 290,90 10,90`}
                  fill="url(#areaGrad)"
                />
              </svg>
              <div className="area-chart-labels">
                {last7Days.map((day) => (
                  <span key={day.fullLabel} className="area-chart-label">{day.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-row dashboard-charts-row-3">
        <div className="dashboard-chart-card">
          <div className="chart-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Flame className="h-4 w-4" style={{ color: '#f97316' }} />
              <h3 className="chart-card-title">Hábitos de Hoje</h3>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/habits')}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="chart-card-content">
            {habitsTotal === 0 ? (
              <div className="chart-empty">
                <Flame className="h-8 w-8" style={{ color: 'var(--text-disabled)' }} />
                <p>Nenhum hábito cadastrado</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/habits')}
                >
                  Criar hábito
                </button>
              </div>
            ) : (
              <>
                <div className="dashboard-habits-summary">
                  <div className="dashboard-habits-stat">
                    <span className="dashboard-habits-stat-value" style={{ color: '#22c55e' }}>{habitsCompleted}</span>
                    <span className="dashboard-habits-stat-label">Concluídos</span>
                  </div>
                  <div className="dashboard-habits-divider" />
                  <div className="dashboard-habits-stat">
                    <span className="dashboard-habits-stat-value" style={{ color: '#f59e0b' }}>{habitsTotal - habitsCompleted}</span>
                    <span className="dashboard-habits-stat-label">Pendentes</span>
                  </div>
                  <div className="dashboard-habits-divider" />
                  <div className="dashboard-habits-stat">
                    <span className="dashboard-habits-stat-value" style={{ color: 'var(--brand-400)' }}>{habitsRate}%</span>
                    <span className="dashboard-habits-stat-label">Taxa</span>
                  </div>
                </div>
                <div className="dashboard-habits-list">
                  {habits.slice(0, 5).map((habit) => {
                    const pct = habit.target > 0 ? Math.min(Math.round((habit.current / habit.target) * 100), 100) : 0
                    return (
                      <div key={habit.id} className="dashboard-habit-row">
                        <div className="dashboard-habit-info">
                          <div className="dashboard-habit-dot" style={{ background: habit.color }} />
                          <span className="dashboard-habit-name">{habit.name}</span>
                        </div>
                        <div className="dashboard-habit-bar">
                          <div
                            className="dashboard-habit-bar-fill"
                            style={{ width: `${pct}%`, background: habit.color }}
                          />
                        </div>
                        <span className="dashboard-habit-count" style={{ color: habit.color }}>
                          {habit.current}/{habit.target}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="dashboard-chart-card">
          <div className="chart-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Activity className="h-4 w-4" style={{ color: 'var(--brand-400)' }} />
              <h3 className="chart-card-title">Atividade Recente</h3>
            </div>
          </div>
          <div className="chart-card-content">
            {recentActivity.length === 0 ? (
              <div className="chart-empty">
                <Activity className="h-8 w-8" style={{ color: 'var(--text-disabled)' }} />
                <p>Nenhuma atividade recente</p>
              </div>
            ) : (
              <div className="dashboard-timeline">
                {recentActivity.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-dot" style={{ background: item.color }} />
                    <div className="timeline-content">
                      <span className="timeline-text">{item.text}</span>
                      <span className="timeline-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-chart-card">
          <div className="chart-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Target className="h-4 w-4" style={{ color: '#a855f7' }} />
              <h3 className="chart-card-title">Ações Rápidas</h3>
            </div>
          </div>
          <div className="chart-card-content">
            <div className="dashboard-quick-actions">
              <button
                className="quick-action-card"
                onClick={() => navigate('/tasks')}
              >
                <div className="quick-action-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <Plus className="h-5 w-5" />
                </div>
                <span className="quick-action-label">Nova Tarefa</span>
              </button>
              <button
                className="quick-action-card"
                onClick={() => navigate('/habits')}
              >
                <div className="quick-action-icon" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
                  <Flame className="h-5 w-5" />
                </div>
                <span className="quick-action-label">Novo Hábito</span>
              </button>
              <button
                className="quick-action-card"
                onClick={() => navigate('/goals')}
              >
                <div className="quick-action-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <Target className="h-5 w-5" />
                </div>
                <span className="quick-action-label">Nova Meta</span>
              </button>
              <button
                className="quick-action-card"
                onClick={() => navigate('/reports')}
              >
                <div className="quick-action-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="quick-action-label">Relatórios</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-row">
        <div className="dashboard-chart-card dashboard-chart-card-full">
          <div className="chart-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Activity className="h-4 w-4" style={{ color: '#22c55e' }} />
              <h3 className="chart-card-title">Heatmap de Hábitos - Últimas 4 Semanas</h3>
            </div>
          </div>
          <div className="chart-card-content">
            <div className="dashboard-heatmap">
              <div className="heatmap-labels">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((d) => (
                  <span key={d} className="heatmap-label">{d}</span>
                ))}
              </div>
              <div className="heatmap-grid">
                {heatmapWeeks.map((week, wi) => (
                  <div key={wi} className="heatmap-week">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        className={`heatmap-cell ${day.count > 0 ? 'heatmap-cell-filled' : ''}`}
                        style={{
                          background:
                            day.count === 0
                              ? 'rgba(255,255,255,0.04)'
                              : day.count === 1
                              ? 'rgba(34,197,94,0.25)'
                              : day.count === 2
                              ? 'rgba(34,197,94,0.5)'
                              : 'rgba(34,197,94,0.8)',
                        }}
                        title={`${format(day.date, 'dd/MM')} - ${day.count} hábitos concluídos`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="heatmap-legend">
                <span className="heatmap-legend-label">Menos</span>
                <div className="heatmap-cell" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="heatmap-cell" style={{ background: 'rgba(34,197,94,0.25)' }} />
                <div className="heatmap-cell" style={{ background: 'rgba(34,197,94,0.5)' }} />
                <div className="heatmap-cell" style={{ background: 'rgba(34,197,94,0.8)' }} />
                <span className="heatmap-legend-label">Mais</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
