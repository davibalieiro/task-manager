import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CommandPalette } from '@/shared/components/CommandPalette'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/shared/context/AuthContext'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { NotFound } from '@/shared/components/NotFound'
import { ProtectedRoute, PublicRoute } from '@/shared/middleware/auth'

const Login = lazy(() => import('@/features/auth/pages/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('@/features/auth/pages/Register').then(m => ({ default: m.Register })))
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const TaskList = lazy(() => import('@/features/tasks/pages/TaskList').then(m => ({ default: m.TaskList })))
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Habits = lazy(() => import('@/features/habits/pages/Habits').then(m => ({ default: m.Habits })))
const ProjectList = lazy(() => import('@/features/projects/pages/ProjectList').then(m => ({ default: m.ProjectList })))
const ProjectDetail = lazy(() => import('@/features/projects/pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })))
const Board = lazy(() => import('@/features/board/pages/Board').then(m => ({ default: m.Board })))
const Calendar = lazy(() => import('@/features/calendar/pages/Calendar').then(m => ({ default: m.Calendar })))
const Goals = lazy(() => import('@/features/goals/pages/Goals').then(m => ({ default: m.Goals })))
const Reports = lazy(() => import('@/features/reports/pages/Reports').then(m => ({ default: m.Reports })))
const TagsPage = lazy(() => import('@/features/tags/pages/Tags').then(m => ({ default: m.TagsPage })))
const Settings = lazy(() => import('@/features/settings/pages/Settings').then(m => ({ default: m.Settings })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function AppRoutes() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner-lg" />
      </div>
    }>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        } />
        <Route path="/habits" element={
          <ProtectedRoute>
            <Habits />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        } />
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        } />
        <Route path="/board" element={
          <ProtectedRoute>
            <Board />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/tags" element={
          <ProtectedRoute>
            <TagsPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  const [cmdOpen, setCmdOpen] = useState(false)

  const toggleCmd = useCallback(() => setCmdOpen((v) => !v), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        toggleCmd()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleCmd])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
              },
            }}
          />
          <AppRoutes />
          <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
