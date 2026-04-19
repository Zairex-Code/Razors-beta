'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  Menu,
  X,
  ShieldAlert,
  UserCog,
  Settings,
  LogOut,
  Ship,
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
  { name: 'Usuarios', href: '/dashboard/users', icon: UserCog, roles: ['ADMIN'] },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
  { name: 'Logs', href: '/dashboard/logs', icon: ShieldAlert, roles: ['ADMIN'] },
]

interface MobileNavProps {
  userRole?: string
  userName?: string
}

export function MobileNav({ userRole = 'EMPLOYEE', userName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const filteredNav = navigation.filter(item => item.roles.includes(userRole))
  const filteredAdminNav = adminNavigation.filter(item => item.roles.includes(userRole))

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-background/80 backdrop-blur-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all md:hidden"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a] border-r border-white/5 transform transition-transform duration-300 md:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center neon-glow shadow-[0_0_20px_rgba(0,247,255,0.3)]">
                <Ship className="text-black" size={24} strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter text-white">RAZORS</h1>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-foreground/10 text-gray-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300',
                    isActive
                      ? 'bg-primary/10 text-primary neon-border'
                      : 'text-gray-400 hover:text-white hover:bg-foreground/5'
                  )}
                >
                  <item.icon size={20} className={isActive ? 'scale-110' : ''} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}

            {filteredAdminNav.length > 0 && (
              <div className="pt-4 mt-4 border-t border-white/5">
                <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-purple-400/60 mb-2 block">
                  Admin
                </span>
                {filteredAdminNav.map((item) => {
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 mb-1',
                        isActive
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-foreground/5'
                      )}
                    >
                      <item.icon size={20} className={isActive ? 'scale-110' : ''} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </nav>

          <div className="p-3 border-t border-white/5 space-y-1">
            <div className="px-4 py-3 rounded-xl bg-foreground/5 mb-2">
              <p className="font-medium text-white text-sm">{userName || 'Usuario'}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole?.toLowerCase()}</p>
            </div>
            <button
              onClick={() => signOutAction()}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
