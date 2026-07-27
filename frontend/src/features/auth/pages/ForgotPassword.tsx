import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Loader2, CheckCircle, Calendar, ShieldCheck } from 'lucide-react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { firebaseAuth } from '@/shared/infrastructure/config/auth'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPassword() {
  const navigate = useNavigate()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      await sendPasswordResetEmail(firebaseAuth, data.email)
      setIsSubmitted(true)
    } catch {
      form.setError('root', { message: 'Erro ao enviar email. Verifique o email informado.' })
    } finally {
      setIsLoading(false)
    }
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
            <span className="auth-hero-logo-text">TaskManager</span>
          </div>
          <h2 className="auth-hero-title">
            Seguranca da sua conta
          </h2>
          <p className="auth-hero-description">
            Manter sua conta segura e essencial. Vamos ajudar
            voce a recuperar o acesso rapidamente.
          </p>
          <div className="auth-hero-features">
            <div className="auth-hero-feature">
              <div className="auth-hero-feature-icon">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span>Recuperacao segura por email</span>
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

          {isSubmitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-8) 0' }}>
              <div style={{ width: '4rem', height: '4rem', borderRadius: 'var(--radius-full)', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle className="w-8 h-8" style={{ color: 'var(--success-500)' }} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>Email enviado!</h2>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-disabled)', padding: 'var(--space-4)', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', width: '100%', textAlign: 'center' }}>
                Se nao receber o email em alguns minutos, verifique sua pasta de spam.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-full btn-lg"
                onClick={() => navigate('/login')}
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </span>
              </button>
            </div>
          ) : (
            <>
              <div className="auth-header">
                <h1>Esqueceu a senha?</h1>
                <p>
                  Nao se preocupe! Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <div className="form-input-icon">
                    <Mail className="form-input-icon-left h-4 w-4" />
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      placeholder="seu@email.com"
                      disabled={isLoading}
                      autoComplete="email"
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="form-error">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {form.formState.errors.root && (
                  <div className="form-error" style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {form.formState.errors.root.message}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Enviar link de recuperacao'
                  )}
                </button>
              </form>

              <button
                type="button"
                className="btn btn-ghost btn-full btn-lg"
                style={{ color: 'var(--text-muted)', marginTop: 'var(--space-6)' }}
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
