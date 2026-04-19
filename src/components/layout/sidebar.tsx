'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Ship,
  ShieldAlert,
  UserCog,
} from 'lucide-react'
import { signOutAction } from '@/app/actions/auth-actions'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'BOSS', 'EMPLOYEE'] },
  { name: 'Inventario', href: '/dashboard/inventory', icon: Package, roles: ['ADMIN', 'BOSS', 'EMPLOYEE'] },
  { name: 'Importaciones', href: '/dashboard/imports', icon: Truck, roles: ['ADMIN', 'BOSS'] },
  { name: 'Clientes', href: '/dashboard/customers', icon: Users, roles: ['ADMIN', 'BOSS', 'EMPLOYEE'] },
  { name: 'Ventas', href: '/dashboard/sales', icon: ShoppingCart, roles: ['ADMIN', 'BOSS', 'EMPLOYEE'] },
  { name: 'Gastos', href: '/dashboard/expenses', icon: Receipt, roles: ['ADMIN', 'BOSS'] },
  { name: 'Reportes', href: '/dashboard/reports', icon: BarChart3, roles: ['ADMIN', 'BOSS'] },
]

const adminNavigation = [
  { name: 'User Management', href: '/dashboard/users', icon: UserCog, roles: ['ADMIN'] },
  { name: 'System Settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
  { name: 'Security Logs', href: '/dashboard/logs', icon: ShieldAlert, roles: ['ADMIN'] },
]

interface SidebarProps {
  userRole?: string
}

export function Sidebar({ userRole = 'EMPLOYEE' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen glass-panel border-r border-white/10 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center neon-glow shadow-[0_0_20px_rgba(0,247,255,0.3)]">
            <Ship className="text-black" size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">RAZORS</h1>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 relative z-10">
        {navigation.map((item) => {
          if (!item.roles.includes(userRole)) return null

          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 group relative cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary neon-border"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary neon-glow" />
              )}
              <item.icon size={20} className={cn(
                "transition-transform duration-300 shrink-0",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="font-medium text-sm tracking-wide truncate">{item.name}</span>
            </Link>
          )
        })}

        {adminNavigation.some(item => item.roles.includes(userRole)) && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-purple-400/60 mb-2 block">
              System Admin
            </span>
            {adminNavigation.map((item) => {
              if (!item.roles.includes(userRole)) return null

              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 group relative mb-1 cursor-pointer",
                    isActive
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  )}
                  <item.icon size={20} className={cn(
                    "transition-transform duration-300 shrink-0",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span className="font-medium text-sm tracking-wide truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-white/5 relative z-10">
        <button
          onClick={() => signOutAction()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
