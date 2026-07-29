import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/features/auth/schemas/auth'
import { useLogin, useRegister, useGoogleLogin } from '@/features/auth/hooks/useAuth'
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Calendar, CheckSquare, Target, Flame, BarChart3 } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { mutate: login, isPending: isLoginPending } = useLogin()
  const { mutate: register, isPending: isRegisterPending } = useRegister()
  const { mutate: googleLogin } = useGoogleLogin()

  const form = useForm<RegisterFormData | LoginFormData>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: isRegister
      ? { name: '', email: '', password: '', confirmPassword: '' }
      : { email: '', password: '' },
  })

  useEffect(() => {
    if (!isRegister) {
      const remembered = localStorage.getItem('rememberedEmail')
      if (remembered) {
        form.setValue('email', remembered)
        setRememberMe(true)
      }
    }
  }, [isRegister, form])

  const onSubmit = (data: LoginFormData | RegisterFormData) => {
    if (isRegister) {
      const { name, email, password } = data as RegisterFormData
      register({ email, password, name }, {
        onSuccess: () => navigate('/'),
        onError: (error) => form.setError('root', { message: error.message }),
      })
    } else {
      const { email, password } = data as LoginFormData
      login({ email, password }, {
        onSuccess: () => {
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', data.email)
          } else {
            localStorage.removeItem('rememberedEmail')
          }
          navigate('/')
        },
        onError: (error) => form.setError('root', { message: error.message }),
      })
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setShowPassword(false)
    setShowConfirmPassword(false)
    form.reset(isRegister
      ? { email: '', password: '' }
      : { name: '', email: '', password: '', confirmPassword: '' }
    )
  }

  const isSubmitting = isLoginPending || isRegisterPending

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-decoration" />
        <div className="auth-hero-decoration-2" />
        <div className="auth-hero-content">
          <div className="auth-hero-logo">
            <div className="auth-hero-logo-icon">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="auth-hero-logo-text">TaskManager</span>
          </div>
          <h2 className="auth-hero-title">
            Organize sua vida com eficiência
          </h2>
          <p className="auth-hero-description">
            Gerencie tarefas, projetos e hábitos em um só lugar.
            Aumente sua produtividade com ferramentas inteligentes.
          </p>
          <div className="auth-hero-features">
            <div className="auth-hero-feature">
              <div className="auth-hero-feature-icon">
                <CheckSquare className="h-4 w-4" />
              </div>
              <span>Gerenciamento de tarefas com Kanban</span>
            </div>
            <div className="auth-hero-feature">
              <div className="auth-hero-feature-icon">
                <Flame className="h-4 w-4" />
              </div>
              <span>Acompanhamento de hábitos diários</span>
            </div>
            <div className="auth-hero-feature">
              <div className="auth-hero-feature-icon">
                <Target className="h-4 w-4" />
              </div>
              <span>Metas e objetivos personalizados</span>
            </div>
            <div className="auth-hero-feature">
              <div className="auth-hero-feature-icon">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span>Relatórios e gráficos detalhados</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-hero-logo-icon">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="auth-hero-logo-text" style={{ color: 'var(--text-primary)' }}>TaskManager</span>
          </div>

          <div className="auth-header">
            <h1>{isRegister ? 'Crie sua conta' : 'Bem-vindo de volta'}</h1>
            <p>
              {isRegister
                ? 'Comece a organizar suas rotinas agora'
                : 'Entre para continuar sua jornada'}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
            {isRegister && (
              <div className="form-group animate-fade-in-up">
                <label className="form-label" htmlFor="name">Nome</label>
                <div className="form-input-icon">
                  <User className="form-input-icon-left h-4 w-4" />
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    placeholder="Seu nome"
                    disabled={isSubmitting}
                    autoComplete="name"
                    {...form.register('name')}
                  />
                </div>
                {'name' in form.formState.errors && form.formState.errors.name && (
                  <p className="form-error">{form.formState.errors.name.message}</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div className="form-input-icon">
                <Mail className="form-input-icon-left h-4 w-4" />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                  autoComplete="email"
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="form-error">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha</label>
              <div className="form-input-icon">
                <Lock className="form-input-icon-left h-4 w-4" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  className="form-input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="form-error">{form.formState.errors.password.message}</p>
              )}
            </div>

            {isRegister && (
              <div className="form-group animate-fade-in-up">
                <label className="form-label" htmlFor="confirmPassword">Confirmar senha</label>
                <div className="form-input-icon">
                  <Lock className="form-input-icon-left h-4 w-4" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    {...form.register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="form-input-icon-right"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {'confirmPassword' in form.formState.errors && form.formState.errors.confirmPassword && (
                  <p className="form-error">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {!isRegister && (
              <div className="auth-remember">
                <div className="auth-remember-left">
                  <input
                    type="checkbox"
                    id="remember"
                    className="checkbox-input"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="remember" className="checkbox-label">
                    Lembrar de mim
                  </label>
                </div>
                <button
                  type="button"
                  className="auth-forgot"
                  onClick={() => navigate('/forgot-password')}
                  disabled={isSubmitting}
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {form.formState.errors.root && (
              <div className="form-error animate-fade-in-up" style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {form.formState.errors.root.message}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isRegister ? 'Criar conta' : 'Entrar'}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou continue com</span>
          </div>

          <div className="auth-social">
            <button
              type="button"
              className="btn-google"
              disabled={isSubmitting}
              onClick={() => googleLogin(undefined, {
                onSuccess: () => navigate('/'),
                onError: (error) => form.setError('root', { message: error.message }),
              })}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" role="img" aria-label="Google">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Entrar com Google
            </button>
          </div>

          <div className="auth-toggle">
            <p>
              {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                disabled={isSubmitting}
              >
                {isRegister ? 'Entrar' : 'Criar conta'}
              </button>
            </p>
            <p className="auth-terms">
              Ao continuar, você concorda com nossos{' '}
              <a href="/terms">Termos</a>
              {' '}e{' '}
              <a href="/privacy">Privacidade</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
