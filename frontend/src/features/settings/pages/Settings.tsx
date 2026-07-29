import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, updateProfile } from 'firebase/auth'
import toast from 'react-hot-toast'
import { firebaseAuth } from '@/shared/infrastructure/config/auth'
import { useAuthContext } from '@/shared/context/AuthContext'
import { AppLayout } from '@/shared/components/AppLayout'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import {
  User,
  Palette,
  Shield,
  Info,
  Loader2,
  Check,
  LogOut,
  Trash2,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react'

type Theme = 'dark' | 'light' | 'system'

const THEME_KEY = 'tm_theme'

function getStoredTheme(): Theme {
  try {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'dark'
  } catch {
    return 'dark'
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light-theme', 'dark-theme')

  if (theme === 'light') {
    root.classList.add('light-theme')
  } else if (theme === 'dark') {
    root.classList.add('dark-theme')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.add(prefersDark ? 'dark-theme' : 'light-theme')
  }
}

export function Settings() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [theme, setTheme] = useState<Theme>(getStoredTheme)
  const [userName, setUserName] = useState(user?.displayName || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [cacheCleared, setCacheCleared] = useState(false)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const handleSaveProfile = async () => {
    if (!userName.trim() || !firebaseAuth.currentUser) return

    setIsSaving(true)
    try {
      await updateProfile(firebaseAuth.currentUser, { displayName: userName.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      toast.error('Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth)
      navigate('/login')
    } catch {
      navigate('/login')
    }
  }

  const handleClearData = () => {
    localStorage.removeItem('tm_habits')
    localStorage.removeItem('tm_habits_last_reset')
    localStorage.removeItem('tm_goals')
    localStorage.removeItem('tm_tags')
    localStorage.removeItem('tm_task_tags')
    setShowDeleteConfirm(false)
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 3000)
  }

  const userNameInitial = userName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <AppLayout>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Limpar cache local"
        message="Tem certeza que deseja limpar todos os dados locais? Esta ação não pode ser desfeita."
        confirmLabel="Sim, limpar"
        cancelLabel="Cancelar"
        danger
        onConfirm={handleClearData}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <div className="settings-header">
          <h1 className="settings-title">Configurações</h1>
        </div>

        <div className="settings-grid">
          <div className="settings-section">
            <div className="settings-section-header">
              <User className="h-5 w-5" />
              <h2 className="settings-section-title">Perfil</h2>
            </div>
            <div className="settings-card">
              <div className="settings-profile">
                <div className="settings-avatar">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="settings-avatar-img" />
                  ) : (
                    <span className="settings-avatar-text">{userNameInitial}</span>
                  )}
                </div>
                <div className="settings-profile-info">
                  <span className="settings-profile-email">{user?.email || 'usuario@email.com'}</span>
                  <span className="settings-profile-id">ID: {user?.uid?.slice(0, 8)}...</span>
                </div>
              </div>

              <div className="settings-field">
                <label className="form-label" htmlFor="settings-name">Nome</label>
                <div className="settings-field-row">
                  <input
                    id="settings-name"
                    type="text"
                    className="form-input"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Seu nome"
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={isSaving || !userName.trim()}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saved ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      'Salvar'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-header">
              <Palette className="h-5 w-5" />
              <h2 className="settings-section-title">Aparência</h2>
            </div>
            <div className="settings-card">
              <div className="settings-theme-options">
                <button
                  className={`settings-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-5 w-5" />
                  <span>Escuro</span>
                </button>
                <button
                  className={`settings-theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-5 w-5" />
                  <span>Claro</span>
                </button>
                <button
                  className={`settings-theme-btn ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-5 w-5" />
                  <span>Sistema</span>
                </button>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-header">
              <Shield className="h-5 w-5" />
              <h2 className="settings-section-title">Conta</h2>
            </div>
            <div className="settings-card">
              <div className="settings-account-actions">
                <button className="btn btn-secondary settings-logout-btn" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                </button>

                <div className="settings-danger-zone">
                  <h3 className="settings-danger-title">Zona de perigo</h3>
                  <p className="settings-danger-description">
                    Limpar dados locais e cache da aplicação. Os dados do servidor (hábitos, metas, etiquetas) não serão afetados.
                  </p>
                  {cacheCleared && <p className="settings-about-value" style={{ color: '#22c55e' }}>Cache limpo com sucesso!</p>}
                  <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4" />
                    Limpar cache local
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-header">
              <Info className="h-5 w-5" />
              <h2 className="settings-section-title">Sobre</h2>
            </div>
            <div className="settings-card">
              <div className="settings-about">
                <div className="settings-about-row">
                  <span className="settings-about-label">Aplicação</span>
                  <span className="settings-about-value">TaskManager</span>
                </div>
                <div className="settings-about-row">
                  <span className="settings-about-label">Versão</span>
                  <span className="settings-about-value">1.0.0</span>
                </div>
                <div className="settings-about-row">
                  <span className="settings-about-label">Descrição</span>
                  <span className="settings-about-value">Gerenciador de tarefas, hábitos, metas e projetos</span>
                </div>
                <div className="settings-about-row">
                  <span className="settings-about-label">Desenvolvido por</span>
                  <span className="settings-about-value">TaskManager Team</span>
                </div>
                <div className="settings-about-row">
                  <span className="settings-about-label">Suporte</span>
                  <span className="settings-about-value">taskmanager@email.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </AppLayout>
  )
}
