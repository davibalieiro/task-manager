import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/auth'
import { useRegister } from '@/features/auth/hooks/useAuth'
import { User, Mail, Lock, Eye, EyeOff, Loader2, Calendar, CheckSquare, Target, Flame, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { mutate: register, isPending } = useRegister()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = (data: RegisterFormData) => {
    const { name, email, password } = data
    register({ email, password, name }, {
      onSuccess: () => navigate('/'),
      onError: (error) => form.setError('root', { message: error.message }),
    })
  }

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
            <span className="auth-hero-logo-text">Mova</span>
          </div>
          <h2 className="auth-hero-title">
            Comece a organizar sua vida hoje
          </h2>
          <p className="auth-hero-description">
            Crie sua conta gratuita e descubra como ser mais produtivo
            com ferramentas de gerenciamento inteligentes.
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
          <Card>
            <CardContent className="p-6">
              <div className="auth-logo">
                <div className="auth-hero-logo-icon">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="auth-hero-logo-text" style={{ color: 'hsl(var(--foreground))' }}>Mova</span>
              </div>

              <div className="auth-header">
                <h1>Crie sua conta</h1>
                <p>Preencha os dados para começar</p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
                <div className="form-group">
                  <Label htmlFor="name">Nome</Label>
                  <div className="form-input-icon">
                    <User className="form-input-icon-left h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      disabled={isPending}
                      autoComplete="name"
                      {...form.register('name')}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="form-error">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="email">Email</Label>
                  <div className="form-input-icon">
                    <Mail className="form-input-icon-left h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      disabled={isPending}
                      autoComplete="email"
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="form-error">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="password">Senha</Label>
                  <div className="form-input-icon">
                    <Lock className="form-input-icon-left h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isPending}
                      autoComplete="new-password"
                      {...form.register('password')}
                    />
                    <button
                      type="button"
                      className="form-input-icon-right"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="form-error">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="form-input-icon">
                    <Lock className="form-input-icon-left h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isPending}
                      autoComplete="new-password"
                      {...form.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="form-input-icon-right"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isPending}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="form-error">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {form.formState.errors.root && (
                  <div className="form-error" style={{ textAlign: 'center', padding: '0.75rem', background: 'hsl(var(--destructive) / 0.1)', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--destructive) / 0.2)' }}>
                    {form.formState.errors.root.message}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </form>

              <div className="auth-toggle">
                <p>
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    disabled={isPending}
                  >
                    Entrar
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
