'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Ship, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isResetMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (error) {
        setError('No se pudo enviar el correo de recuperación.')
      } else {
        setResetSent(true)
      }
      setLoading(false)
      return
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('[LOGIN] signInWithPassword result:', { error, userId: data?.user?.id })

    if (error) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.')
      setLoading(false)
    } else {
      console.log('[LOGIN] Success, redirecting to /dashboard')
      window.location.href = '/dashboard'
    }
  }

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) {
      setError(`Error con ${provider}: ${error.message}`)
      setLoading(false)
    }
  }

  if (resetSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#000000] relative overflow-hidden p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-[440px] relative z-10"
        >
          <div className="bg-[#111111] rounded-[2rem] p-10 md:p-12 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="flex flex-col items-center mb-10">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="text-emerald-400" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white">Correo Enviado</h1>
            </div>
            <div className="text-center space-y-4">
              <p className="text-gray-400">
                Se ha enviado un enlace de recuperación a <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-gray-500 text-sm">
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              <button
                onClick={() => {
                  setResetSent(false)
                  setIsResetMode(false)
                }}
                className="text-primary hover:underline text-sm font-medium"
              >
                Volver al login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000000] relative overflow-hidden p-6">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/5 blur-[180px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-[#111111] rounded-[2rem] p-10 md:p-12 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center neon-glow mb-4 shadow-[0_0_20px_rgba(0,247,255,0.3)]">
              <Ship className="text-black" size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">RAZORS</h1>
            <p className="text-[#888888] text-xs font-medium mt-2 uppercase tracking-widest">Portal de Gestión B2B</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-1">
              {isResetMode ? 'Recuperar Contraseña' : 'Inicio de Sesión'}
            </h2>
            <p className="text-[#555555] text-sm">
              {isResetMode
                ? 'Ingresa tu correo para recibir un enlace de recuperación.'
                : 'Ingrese sus credenciales para acceder al sistema.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-500 text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[#888888] ml-1">Correo Electrónico</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444] group-focus-within:text-primary transition-colors" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@razors.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  suppressHydrationWarning
                  className="w-full bg-[#1a1a1a] border border-white/10 py-3.5 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-[#333333] rounded-xl"
                />
              </div>
            </div>

            {!isResetMode && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-[#888888]">Contraseña</Label>
                  <button
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444] group-focus-within:text-primary transition-colors" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    suppressHydrationWarning
                    className="w-full bg-[#1a1a1a] border border-white/10 py-3.5 pl-12 pr-12 text-sm font-medium text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-[#333333] rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444444] hover:text-primary/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-black font-black text-sm tracking-tight hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(0,247,255,0.2)]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : isResetMode ? (
                'Enviar Enlace'
              ) : (
                'Acceder al Panel'
              )}
            </Button>

            {isResetMode && (
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false)
                  setError('')
                }}
                className="w-full text-center text-gray-400 hover:text-white text-sm transition-colors"
              >
                Volver al login
              </button>
            )}
          </form>

          {!isResetMode && (
            <>
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-[#111111] px-4 text-[#444444]">O continuar con</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSocialLogin('github')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1a1a] border border-white/5 hover:bg-[#222222] transition-colors text-xs font-bold text-white disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1a1a] border border-white/5 hover:bg-[#222222] transition-colors text-xs font-bold text-white disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
              </div>
            </>
          )}

          <div className="mt-10 text-center">
            <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.3em]">Razors Management System v2.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}