import { useState, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  format,
  subDays,
  subMonths,
  isWithinInterval,
  getDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Task } from '@/features/tasks/types/task'
import type { Project } from '@/features/projects/types/project'
import { tasksApi } from '@/features/tasks/api/tasks'
import { projectsApi } from '@/features/projects/api/projects'
import { AppLayout } from '@/shared/components/AppLayout'
import { PDFDownloader, PPTDownloader } from 'pdf-ppt-export-react'
import {
  BarChart3,
  Loader2,
  CheckSquare,
  FolderKanban,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Download,
  FileText,
  MessageCircle,
  FileImage,
} from 'lucide-react'

type TimeRange = 'week' | 'month' | 'quarter' | 'year'

export function Reports() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [phone, setPhone] = useState('')
  const [showPDF, setShowPDF] = useState(false)
  const [showPPT, setShowPPT] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  })

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const stats = useMemo(() => {
    if (!tasks || !projects) return null

    const now = new Date()
    let rangeStart: Date
    let prevRangeStart: Date
    let prevRangeEnd: Date

    switch (timeRange) {
      case 'week':
        rangeStart = subDays(now, 7)
        prevRangeStart = subDays(now, 14)
        prevRangeEnd = subDays(now, 7)
        break
      case 'month':
        rangeStart = subDays(now, 30)
        prevRangeStart = subDays(now, 60)
        prevRangeEnd = subDays(now, 30)
        break
      case 'quarter':
        rangeStart = subMonths(now, 3)
        prevRangeStart = subMonths(now, 6)
        prevRangeEnd = subMonths(now, 3)
        break
      case 'year':
        rangeStart = subMonths(now, 12)
        prevRangeStart = subMonths(now, 24)
        prevRangeEnd = subMonths(now, 12)
        break
    }

    const currentTasks = tasks.filter((t) =>
      isWithinInterval(new Date(t.createdAt), { start: rangeStart, end: now })
    )
    const prevTasks = tasks.filter((t) =>
      isWithinInterval(new Date(t.createdAt), { start: prevRangeStart, end: prevRangeEnd })
    )

    const currentCompleted = currentTasks.filter((t) => t.completed).length
    const prevCompleted = prevTasks.filter((t) => t.completed).length

    const totalTasks = tasks.length
    const totalCompleted = tasks.filter((t) => t.completed).length
    const totalPending = totalTasks - totalCompleted

    const tasksChange = prevTasks.length > 0
      ? Math.round(((currentTasks.length - prevTasks.length) / prevTasks.length) * 100)
      : currentTasks.length > 0 ? 100 : 0

    const completionChange = prevCompleted > 0
      ? Math.round(((currentCompleted - prevCompleted) / prevCompleted) * 100)
      : currentCompleted > 0 ? 100 : 0

    const projectsByStatus = {
      pending: projects.filter((p) => p.status === 'pending').length,
      completed: projects.filter((p) => p.status === 'completed').length,
    }

    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    }

    const tasksByDayOfWeek = Array.from({ length: 7 }, (_, i) => {
      const count = tasks.filter((t) => getDay(new Date(t.createdAt)) === i).length
      return { day: i, count }
    })

    const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

    const overdueTasks = tasks.filter((t) => {
      if (!t.dueDate || t.completed) return false
      return new Date(t.dueDate) < now
    }).length

    const avgTasksPerDay = (() => {
      const days = Math.max(1, Math.ceil((now.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)))
      return Math.round((currentTasks.length / days) * 10) / 10
    })()

    const recentCompleted = tasks
      .filter((t) => t.completed)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)

    return {
      totalTasks,
      totalCompleted,
      totalPending,
      currentTasks: currentTasks.length,
      currentCompleted,
      currentTasksList: currentTasks,
      tasksChange,
      completionChange,
      projectsByStatus,
      tasksByStatus,
      tasksByDayOfWeek,
      completionRate,
      overdueTasks,
      avgTasksPerDay,
      recentCompleted,
      totalProjects: projects.length,
    }
  }, [tasks, projects, timeRange])

  const handleExportCSV = () => {
    if (!stats) return
    const headers = ['Título', 'Descrição', 'Status', 'Projeto', 'Subtarefas', 'Criado em', 'Atualizado em']
    const rows = stats.currentTasksList.map(task => [
      task.title,
      task.description || '',
      task.status === 'todo' ? 'A Fazer' : task.status === 'in_progress' ? 'Em Andamento' : 'Concluído',
      projects?.find(p => p.id === task.projectId)?.name || '',
      task.subtasks ? `${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}` : '0/0',
      new Date(task.createdAt).toLocaleDateString('pt-BR'),
      new Date(task.updatedAt).toLocaleDateString('pt-BR'),
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-tarefas-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    if (!stats) return
    const data = {
      exportDate: new Date().toISOString(),
      period: timeRange,
      summary: {
        totalTasks: stats.totalTasks,
        totalCompleted: stats.totalCompleted,
        totalPending: stats.totalPending,
        completionRate: stats.completionRate,
        tasksInPeriod: stats.currentTasks,
        completedInPeriod: stats.currentCompleted,
        overdueTasks: stats.overdueTasks,
      },
      tasks: stats.currentTasksList.map(task => ({
        title: task.title,
        description: task.description || null,
        status: task.status,
        completed: task.completed,
        project: projects?.find(p => p.id === task.projectId)?.name || null,
        subtasks: task.subtasks?.map(s => ({ text: s.text, completed: s.completed })) || [],
        dueDate: task.dueDate || null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-tarefas-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportWhatsApp = () => {
    if (!stats || !phone.trim()) return
    const cleanPhone = phone.replace(/\D/g, '')
    const periodLabel = timeRange === 'week' ? 'Últimos 7 dias' : timeRange === 'month' ? 'Últimos 30 dias' : timeRange === 'quarter' ? 'Último trimestre' : 'Último ano'
    const completed = stats.currentTasksList.filter(t => t.completed)
    const pending = stats.currentTasksList.filter(t => !t.completed)
    let message = `*RELATORIO DE TAREFAS*\n\n`
    message += `Periodo: ${periodLabel}\n`
    message += `Gerado em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n`
    message += `---------------------------\n`
    message += `*RESUMO GERAL*\n`
    message += `---------------------------\n\n`
    message += `Total de tarefas: *${stats.currentTasks}*\n`
    message += `Concluidas: *${stats.currentCompleted}*\n`
    message += `Pendentes: *${stats.currentTasks - stats.currentCompleted}*\n`
    message += `Taxa de conclusao: *${stats.completionRate}%*\n\n`

    if (stats.overdueTasks > 0) {
      message += `*ATENCAO: ${stats.overdueTasks} tarefa(s) ATRASADA(S)!*\n\n`
    }

    if (completed.length > 0) {
      message += `*CONCLUIDAS (${completed.length})*\n`
      completed.forEach(t => {
        const project = projects?.find(p => p.id === t.projectId)
        message += `  - ${t.title}${project ? ` [${project.name}]` : ''}\n`
      })
      message += '\n'
    }

    if (pending.length > 0) {
      message += `*PENDENTES (${pending.length})*\n`
      pending.forEach(t => {
        const project = projects?.find(p => p.id === t.projectId)
        message += `  - ${t.title}${project ? ` [${project.name}]` : ''}\n`
      })
      message += '\n'
    }

    message += `---------------------------\n`
    message += `*METRICAS DO PERIODO*\n`
    message += `---------------------------\n\n`
    message += `Media: *${stats.avgTasksPerDay} tarefas/dia*\n`
    message += `Atrasadas: *${stats.overdueTasks}*\n`
    message += `Projetos ativos: *${stats.totalProjects}*\n\n`
    message += `Gerado por Mova`

    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/55${cleanPhone}?text=${encoded}`, '_blank')
  }

  const isLoading = tasksLoading || projectsLoading

  if (isLoading) {
    return (
      <AppLayout>
        <div className="reports-loading">
          <Loader2 className="spinner-lg" />
        </div>
      </AppLayout>
    )
  }

  if (!stats) {
    return (
      <AppLayout>
        <div className="reports-empty">
          <BarChart3 className="h-12 w-12" />
          <p>Dados insuficientes para gerar relatórios</p>
        </div>
      </AppLayout>
    )
  }

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const maxTasksByDay = Math.max(...stats.tasksByDayOfWeek.map((d) => d.count), 1)

  return (
    <AppLayout>
      <div className="reports-header">
          <div className="reports-header-top">
            <h1 className="reports-title">Relatórios</h1>
            <div className="reports-export-group">
              <div className="reports-phone-input">
                <input
                  type="tel"
                  className="form-input"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-label="Número do WhatsApp"
                />
              </div>
              <button
                className="btn btn-sm"
                style={{ background: '#25d366', color: 'white' }}
                onClick={handleExportWhatsApp}
                disabled={!phone.trim()}
                aria-label="Exportar para WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPDF(true)} aria-label="Exportar como PDF">
                <FileImage className="h-4 w-4" />
                PDF
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPPT(true)} aria-label="Exportar como PowerPoint">
                <FileText className="h-4 w-4" />
                PPT
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} aria-label="Exportar como CSV">
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleExportJSON} aria-label="Exportar como JSON">
                <FileText className="h-4 w-4" />
                JSON
              </button>
            </div>
          </div>
          <div className="reports-filters">
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                className={`filter-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : range === 'quarter' ? 'Trimestre' : 'Ano'}
              </button>
            ))}
          </div>
        </div>

        <div ref={reportRef} className="reports-content">
        <div className="reports-kpi-grid">
          <div className="reports-kpi-card">
            <div className="reports-kpi-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="reports-kpi-content">
              <span className="reports-kpi-value">{stats.totalTasks}</span>
              <span className="reports-kpi-label">Total de Tarefas</span>
            </div>
            {stats.tasksChange !== 0 && (
              <span className={`reports-kpi-change ${stats.tasksChange > 0 ? 'positive' : 'negative'}`}>
                {stats.tasksChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(stats.tasksChange)}%
              </span>
            )}
          </div>

          <div className="reports-kpi-card">
            <div className="reports-kpi-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <Target className="h-5 w-5" />
            </div>
            <div className="reports-kpi-content">
              <span className="reports-kpi-value">{stats.totalCompleted}</span>
              <span className="reports-kpi-label">Concluídas</span>
            </div>
            {stats.completionChange !== 0 && (
              <span className={`reports-kpi-change ${stats.completionChange > 0 ? 'positive' : 'negative'}`}>
                {stats.completionChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(stats.completionChange)}%
              </span>
            )}
          </div>

          <div className="reports-kpi-card">
            <div className="reports-kpi-icon" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
              <Clock className="h-5 w-5" />
            </div>
            <div className="reports-kpi-content">
              <span className="reports-kpi-value">{stats.totalPending}</span>
              <span className="reports-kpi-label">Pendentes</span>
            </div>
          </div>

          <div className="reports-kpi-card">
            <div className="reports-kpi-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="reports-kpi-content">
              <span className="reports-kpi-value">{stats.totalProjects}</span>
              <span className="reports-kpi-label">Projetos</span>
            </div>
          </div>
        </div>

        <div className="reports-charts-row">
          <div className="reports-chart-card">
            <h3 className="reports-chart-title">Taxa de Conclusão</h3>
            <div className="reports-ring-chart">
              <svg viewBox="0 0 120 120" className="reports-ring-svg">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--border-default)"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeDasharray={`${(stats.completionRate / 100) * 2 * Math.PI * 50} ${(1 - stats.completionRate / 100) * 2 * Math.PI * 50}`}
                  strokeDashoffset="78.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="reports-ring-center">
                <span className="reports-ring-value">{stats.completionRate}%</span>
                <span className="reports-ring-label">Concluído</span>
              </div>
            </div>
          </div>

          <div className="reports-chart-card">
            <h3 className="reports-chart-title">Tarefas por Dia da Semana</h3>
            <div className="reports-bar-chart">
              {stats.tasksByDayOfWeek.map((item) => (
                <div key={item.day} className="reports-bar-row">
                  <span className="reports-bar-label">{dayLabels[item.day]}</span>
                  <div className="reports-bar-track">
                    <div
                      className="reports-bar-fill"
                      style={{
                        width: `${(item.count / maxTasksByDay) * 100}%`,
                        backgroundColor: 'var(--color-primary)',
                      }}
                    />
                  </div>
                  <span className="reports-bar-value">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="reports-charts-row">
          <div className="reports-chart-card">
            <h3 className="reports-chart-title">Status das Tarefas</h3>
            <div className="reports-distribution">
              <div className="reports-dist-item">
                <div className="reports-dist-color" style={{ backgroundColor: '#6366f1' }} />
                <span className="reports-dist-label">A Fazer</span>
                <span className="reports-dist-value">{stats.tasksByStatus.todo}</span>
                <div className="reports-dist-bar">
                  <div
                    className="reports-dist-fill"
                    style={{
                      width: `${stats.totalTasks > 0 ? (stats.tasksByStatus.todo / stats.totalTasks) * 100 : 0}%`,
                      backgroundColor: '#6366f1',
                    }}
                  />
                </div>
              </div>
              <div className="reports-dist-item">
                <div className="reports-dist-color" style={{ backgroundColor: '#f97316' }} />
                <span className="reports-dist-label">Em Andamento</span>
                <span className="reports-dist-value">{stats.tasksByStatus.in_progress}</span>
                <div className="reports-dist-bar">
                  <div
                    className="reports-dist-fill"
                    style={{
                      width: `${stats.totalTasks > 0 ? (stats.tasksByStatus.in_progress / stats.totalTasks) * 100 : 0}%`,
                      backgroundColor: '#f97316',
                    }}
                  />
                </div>
              </div>
              <div className="reports-dist-item">
                <div className="reports-dist-color" style={{ backgroundColor: '#22c55e' }} />
                <span className="reports-dist-label">Concluído</span>
                <span className="reports-dist-value">{stats.tasksByStatus.done}</span>
                <div className="reports-dist-bar">
                  <div
                    className="reports-dist-fill"
                    style={{
                      width: `${stats.totalTasks > 0 ? (stats.tasksByStatus.done / stats.totalTasks) * 100 : 0}%`,
                      backgroundColor: '#22c55e',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="reports-chart-card">
            <h3 className="reports-chart-title">Status dos Projetos</h3>
            <div className="reports-distribution">
              <div className="reports-dist-item">
                <div className="reports-dist-color" style={{ backgroundColor: '#eab308' }} />
                <span className="reports-dist-label">Pendente</span>
                <span className="reports-dist-value">{stats.projectsByStatus.pending}</span>
                <div className="reports-dist-bar">
                  <div
                    className="reports-dist-fill"
                    style={{
                      width: `${stats.totalProjects > 0 ? (stats.projectsByStatus.pending / stats.totalProjects) * 100 : 0}%`,
                      backgroundColor: '#eab308',
                    }}
                  />
                </div>
              </div>
              <div className="reports-dist-item">
                <div className="reports-dist-color" style={{ backgroundColor: '#22c55e' }} />
                <span className="reports-dist-label">Concluído</span>
                <span className="reports-dist-value">{stats.projectsByStatus.completed}</span>
                <div className="reports-dist-bar">
                  <div
                    className="reports-dist-fill"
                    style={{
                      width: `${stats.totalProjects > 0 ? (stats.projectsByStatus.completed / stats.totalProjects) * 100 : 0}%`,
                      backgroundColor: '#22c55e',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reports-summary-row">
          <div className="reports-summary-card">
            <Calendar className="h-5 w-5" style={{ color: '#3b82f6' }} />
            <div className="reports-summary-content">
              <span className="reports-summary-value">{stats.avgTasksPerDay}</span>
              <span className="reports-summary-label">Tarefas/dia (média)</span>
            </div>
          </div>
          <div className="reports-summary-card">
            <Clock className="h-5 w-5" style={{ color: '#ef4444' }} />
            <div className="reports-summary-content">
              <span className="reports-summary-value">{stats.overdueTasks}</span>
              <span className="reports-summary-label">Atrasadas</span>
            </div>
          </div>
          <div className="reports-summary-card">
            <CheckSquare className="h-5 w-5" style={{ color: '#22c55e' }} />
            <div className="reports-summary-content">
              <span className="reports-summary-value">{stats.currentCompleted}</span>
              <span className="reports-summary-label">Concluídas no período</span>
            </div>
          </div>
          <div className="reports-summary-card">
            <TrendingUp className="h-5 w-5" style={{ color: '#8b5cf6' }} />
            <div className="reports-summary-content">
              <span className="reports-summary-value">{stats.currentTasks}</span>
              <span className="reports-summary-label">Criadas no período</span>
            </div>
          </div>
        </div>

        {stats.recentCompleted.length > 0 && (
          <div className="reports-recent">
            <h3 className="reports-chart-title">Últimas Tarefas Concluídas</h3>
            <div className="reports-recent-list">
              {stats.recentCompleted.map((task) => (
                <div key={task.id} className="reports-recent-item">
                  <CheckSquare className="h-4 w-4" style={{ color: '#22c55e' }} />
                  <span className="reports-recent-name">{task.title}</span>
                  <span className="reports-recent-date">
                    {format(new Date(task.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {showPDF && (
          <PDFDownloader
            contentRef={reportRef}
            onClose={() => setShowPDF(false)}
            defaultTitle={`Relatório Mova - ${timeRange}`}
          />
        )}

        {showPPT && (
          <PPTDownloader
            contentRef={reportRef}
            onClose={() => setShowPPT(false)}
            defaultTitle={`Relatório Mova - ${timeRange}`}
          />
        )}
    </AppLayout>
  )
}
