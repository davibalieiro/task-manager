import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { firebaseAuth } from '@/shared/infrastructure/config/auth'
import { useAuthContext } from '@/shared/context/AuthContext'
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  BarChart3,
  Settings,
  Target,
  Flame,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
}

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { to: '/projects', icon: FolderKanban, label: 'Projetos' },

]

const toolsNav = [
  { to: '/habits', icon: Flame, label: 'Hábitos' },
  { to: '/calendar', icon: Calendar, label: 'Calendário' },
  { to: '/goals', icon: Target, label: 'Metas' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios' },

]

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('tm_theme') as 'dark' | 'light' | 'system' | null
    const theme = stored || 'dark'
    if (theme === 'light') {
      setIsDark(false)
    } else if (theme === 'dark') {
      setIsDark(true)
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const newIsDark = !isDark
    setIsDark(newIsDark)
    root.classList.remove('light-theme', 'dark-theme')
    root.classList.add(newIsDark ? 'dark-theme' : 'light-theme')
    localStorage.setItem('tm_theme', newIsDark ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth)
      navigate('/login')
    } catch {
      navigate('/login')
    }
  }

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuário'
  const userInitial = userName.charAt(0).toUpperCase()

  const handleLinkClick = () => {
    onNavigate?.()
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} role="navigation" aria-label="Menu principal">
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={collapsed ? onToggle : undefined} style={collapsed ? { cursor: 'pointer' } : undefined}>
          <div className="sidebar-logo-icon">M</div>
          {!collapsed && <span className="sidebar-logo-text">Mova</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expandir' : 'Minimizar'}>
          {collapsed ? <PanelLeftOpen className="sidebar-toggle-icon" /> : <PanelLeftClose className="sidebar-toggle-icon" />}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Navegacao">
        <div className="sidebar-section">
          {!collapsed && <span className="sidebar-section-title">Principal</span>}
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              onClick={handleLinkClick}
            >
              <item.icon className="sidebar-link-icon" />
              {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
              {!collapsed && <ChevronRight className="sidebar-link-arrow" />}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-section">
          {!collapsed && <span className="sidebar-section-title">Ferramentas</span>}
          {toolsNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              onClick={handleLinkClick}
            >
              <item.icon className="sidebar-link-icon" />
              {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
              {!collapsed && <ChevronRight className="sidebar-link-arrow" />}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{userInitial}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{userName}</span>
              <span className="sidebar-user-email">{user?.email || ''}</span>
            </div>
          )}
        </div>
        <div className="sidebar-footer-actions">
          <button
            className="sidebar-link"
            onClick={toggleTheme}
            title={collapsed ? (isDark ? 'Modo Claro' : 'Modo Escuro') : undefined}
            aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
          >
            {isDark ? <Sun className="sidebar-link-icon" /> : <Moon className="sidebar-link-icon" />}
            {!collapsed && <span className="sidebar-link-label">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </button>
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? 'Configurações' : undefined}
            aria-label="Configurações"
            onClick={handleLinkClick}
          >
            <Settings className="sidebar-link-icon" />
            {!collapsed && <span className="sidebar-link-label">Configurações</span>}
          </NavLink>
          <button className="sidebar-link sidebar-logout" onClick={handleLogout} title="Sair">
            <LogOut className="sidebar-link-icon" />
            {!collapsed && <span className="sidebar-link-label">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
