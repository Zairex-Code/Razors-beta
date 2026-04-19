'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Ship, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.')
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000000] relative overflow-hidden p-6">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/5 blur-[180px] rounded-full" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-[#111111] rounded-[2rem] p-10 md:p-12 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center neon-glow mb-4 shadow-[0_0_20px_rgba(0,247,255,0.3)]">
              <Ship className="text-black" size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">RAZORS</h1>
            <p className="text-[#888888] text-xs font-medium mt-2 uppercase tracking-widest">Portal de Gestión B2B</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-1">Inicio de Sesión</h2>
            <p className="text-[#555555] text-sm">Ingrese sus credenciales para acceder al sistema.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-500 text-xs font-bold text-center">
                {error}
              </div>
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

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#888888]">Contraseña</Label>
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-black font-black text-sm tracking-tight hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,247,255,0.2)]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                "Acceder al Panel"
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.3em]">Razors Management System v2.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}