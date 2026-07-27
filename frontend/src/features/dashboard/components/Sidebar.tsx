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
  ListTodo,
  Tags,
  Flame,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { to: '/projects', icon: FolderKanban, label: 'Projetos' },
  { to: '/board', icon: ListTodo, label: 'Kanban' },
]

const toolsNav = [
  { to: '/habits', icon: Flame, label: 'Hábitos' },
  { to: '/calendar', icon: Calendar, label: 'Calendário' },
  { to: '/goals', icon: Target, label: 'Metas' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios' },
  { to: '/tags', icon: Tags, label: 'Etiquetas' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const { user } = useAuthContext()

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

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} role="navigation" aria-label="Menu principal">
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={collapsed ? onToggle : undefined} style={collapsed ? { cursor: 'pointer' } : undefined}>
          <div className="sidebar-logo-icon">TM</div>
          {!collapsed && <span className="sidebar-logo-text">TaskManager</span>}
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
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? 'Configurações' : undefined}
            aria-label="Configurações"
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
